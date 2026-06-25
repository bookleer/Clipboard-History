const { ipcMain, clipboard, nativeImage, BrowserWindow } = require('electron');
const database = require('./database');
const clipboardMonitor = require('./clipboard-monitor');
const settings = require('./settings');

function register(mainWindow) {
  // 获取剪贴板历史
  ipcMain.handle('clipboard:getAll', (_event, { search } = {}) => {
    return database.getAllItems(search);
  });

  // 置顶/取消置顶
  ipcMain.handle('clipboard:pin', (_event, { id }) => {
    database.togglePin(id);
  });

  // 删除
  ipcMain.handle('clipboard:delete', (_event, { id }) => {
    database.softDelete(id);
  });

  // 复制到剪贴板
  ipcMain.handle('clipboard:copy', (_event, { id }) => {
    const items = database.getAllItems();
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (item.type === 'text') {
      clipboard.writeText(item.content);
    } else if (item.type === 'image') {
      const fs = require('fs');
      if (fs.existsSync(item.content)) {
        const img = nativeImage.createFromPath(item.content);
        clipboard.writeImage(img);
      }
    }
  });

  // 获取设置
  ipcMain.handle('settings:get', () => {
    return settings.getAll();
  });

  // 更新设置
  ipcMain.handle('settings:update', (_event, { key, value }) => {
    settings.set(key, value);
    // 如果修改了保留天数，触发一次清理
    if (key === 'retentionDays') {
      database.cleanExpired(value);
    }
  });

  // 隐藏窗口
  ipcMain.handle('window:hide', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.hide();
    }
  });

  // 启动剪贴板监听
  clipboardMonitor.start((item) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('clipboard:newItem', item);
    }
  });
}

module.exports = { register };
