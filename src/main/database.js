const path = require('path');
const { app } = require('electron');

let SQL = null;
let db = null;

// 数据目录：%APPDATA%/clipboard-manager/
function getDataDir() {
  const dataDir = path.join(app.getPath('userData'), 'data');
  return dataDir;
}

// 图片存储目录
function getImageDir() {
  const imageDir = path.join(app.getPath('userData'), 'images');
  return imageDir;
}

async function init() {
  const fs = require('fs');
  const initSqlJs = require('sql.js');

  // 确保数据目录存在
  const dataDir = getDataDir();
  const imageDir = getImageDir();
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

  // 初始化 sql.js
  SQL = await initSqlJs();

  // 加载或创建数据库文件
  const dbPath = path.join(dataDir, 'clipboard.db');
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // 建表
  db.run(`
    CREATE TABLE IF NOT EXISTS clipboard_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      content_hash TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      pinned INTEGER DEFAULT 0,
      deleted INTEGER DEFAULT 0
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_timestamp ON clipboard_items(timestamp DESC)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_pinned ON clipboard_items(pinned)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_deleted ON clipboard_items(deleted)`);

  save();
  return { dataDir, imageDir };
}

function save() {
  const fs = require('fs');
  const data = db.export();
  const buffer = Buffer.from(data);
  const dbPath = path.join(getDataDir(), 'clipboard.db');
  fs.writeFileSync(dbPath, buffer);
}

// 插入一条剪贴板记录
function insertItem(type, content, contentHash) {
  const timestamp = Date.now();
  db.run(
    'INSERT INTO clipboard_items (type, content, content_hash, timestamp) VALUES (?, ?, ?, ?)',
    [type, content, contentHash, timestamp]
  );
  save();
  return {
    id: db.exec('SELECT last_insert_rowid()')[0].values[0][0],
    type,
    content,
    content_hash: contentHash,
    timestamp,
    pinned: 0,
    deleted: 0,
  };
}

// 获取所有记录（排除已删除的）
function getAllItems(search) {
  let query = 'SELECT * FROM clipboard_items WHERE deleted = 0';
  const params = [];

  if (search && search.trim()) {
    query += ' AND type = \'text\' AND content LIKE ?';
    params.push(`%${search.trim()}%`);
  }

  query += ' ORDER BY pinned DESC, timestamp DESC LIMIT 200';

  const results = db.exec(query, params);
  if (!results.length) return [];

  const columns = results[0].columns;
  return results[0].values.map((row) => {
    const item = {};
    columns.forEach((col, i) => {
      item[col] = row[i];
    });
    item.pinned = !!item.pinned;
    item.deleted = !!item.deleted;
    return item;
  });
}

// 切换置顶状态
function togglePin(id) {
  const result = db.exec('SELECT pinned FROM clipboard_items WHERE id = ?', [id]);
  if (!result.length) return;
  const current = result[0].values[0][0];
  db.run('UPDATE clipboard_items SET pinned = ? WHERE id = ?', [current ? 0 : 1, id]);
  save();
}

// 软删除
function softDelete(id) {
  db.run('UPDATE clipboard_items SET deleted = 1 WHERE id = ?', [id]);
  save();
}

// 清理过期和已删除的记录
function cleanExpired(retentionDays) {
  const fs = require('fs');
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

  // 先获取要删除的图片记录，以便删除文件
  const expiredImages = db.exec(
    'SELECT content FROM clipboard_items WHERE type = \'image\' AND (deleted = 1 OR timestamp < ?)',
    [cutoff]
  );

  if (expiredImages.length) {
    expiredImages[0].values.forEach((row) => {
      const filePath = row[0];
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) { /* 文件可能已被删除 */ }
    });
  }

  // 删除数据库记录
  db.run('DELETE FROM clipboard_items WHERE deleted = 1 OR timestamp < ?', [cutoff]);
  save();
}

// 更新已存在记录的时间戳（去重时使用）
function updateTimestamp(id) {
  db.run('UPDATE clipboard_items SET timestamp = ? WHERE id = ?', [Date.now(), id]);
  save();
}

// 根据内容哈希查找记录
function findByHash(contentHash) {
  const result = db.exec(
    'SELECT id FROM clipboard_items WHERE content_hash = ? AND deleted = 0',
    [contentHash]
  );
  if (!result.length || !result[0].values.length) return null;
  return result[0].values[0][0];
}

module.exports = {
  init,
  insertItem,
  getAllItems,
  togglePin,
  softDelete,
  cleanExpired,
  updateTimestamp,
  findByHash,
  getImageDir,
};
