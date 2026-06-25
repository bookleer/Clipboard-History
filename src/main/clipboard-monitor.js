const { clipboard, nativeImage } = require('electron');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const database = require('./database');

let intervalId = null;
let lastText = '';
let lastImageHash = '';

function hashContent(content) {
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

function start(onNewItem) {
  stop();

  // 记录当前剪贴板内容，避免启动时立即记录
  lastText = clipboard.readText() || '';
  const currentImg = clipboard.readImage();
  if (!currentImg.isEmpty()) {
    lastImageHash = hashContent(currentImg.toPNG().toString('base64'));
  }

  intervalId = setInterval(() => {
    try {
      // 检查文本
      const text = clipboard.readText();
      if (text && text !== lastText) {
        lastText = text;
        const contentHash = hashContent(text);

        // 去重：相同内容只更新 timestamp
        const existingId = database.findByHash(contentHash);
        if (existingId) {
          database.updateTimestamp(existingId);
        } else {
          const item = database.insertItem('text', text, contentHash);
          if (onNewItem) onNewItem(item);
        }
        return;
      }

      // 检查图片
      const img = clipboard.readImage();
      if (!img.isEmpty()) {
        const imgBuffer = img.toPNG();
        const imgBase64 = imgBuffer.toString('base64');
        const contentHash = hashContent(imgBase64);

        if (contentHash !== lastImageHash) {
          lastImageHash = contentHash;
          lastText = ''; // 重置文本状态

          // 去重
          const existingId = database.findByHash(contentHash);
          if (existingId) {
            database.updateTimestamp(existingId);
          } else {
            // 保存图片文件
            const imageDir = database.getImageDir();
            const fileName = `${Date.now()}_${contentHash}.png`;
            const filePath = path.join(imageDir, fileName);
            fs.writeFileSync(filePath, imgBuffer);

            const item = database.insertItem('image', filePath, contentHash);
            if (onNewItem) onNewItem(item);
          }
        }
      }
    } catch (err) {
      console.error('剪贴板监听错误:', err.message);
    }
  }, 500);
}

function stop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

module.exports = { start, stop };
