const { app, BrowserWindow, globalShortcut, Tray, Menu, screen, nativeImage } = require('electron');
const path = require('path');
const database = require('./database');
const ipcHandlers = require('./ipc-handlers');
const settings = require('./settings');

// 判断是否为开发模式
const isDev = process.env.NODE_ENV === 'development';

let mainWindow = null;
let tray = null;
let cleanupTimer = null;

function createWindow() {
  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 420,
    height: 620,
    minWidth: 360,
    minHeight: 480,
    frame: false,
    resizable: true,
    show: false,
    skipTaskbar: true,
    transparent: false,
    backgroundColor: '#f0f6fc',
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', '..', 'dist', 'renderer', 'index.html'));
  }

  // 阻止窗口关闭，改为隐藏
  mainWindow.on('close', (event) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // 窗口失去焦点时隐藏
  mainWindow.on('blur', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.hide();
    }
  });
}

function toggleWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow();
  }

  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    // 定位到鼠标所在屏幕居中
    const cursorPoint = screen.getCursorScreenPoint();
    const currentDisplay = screen.getDisplayNearestPoint(cursorPoint);
    const { x, y, width, height } = currentDisplay.workArea;

    const winBounds = mainWindow.getBounds();
    const winX = Math.round(x + (width - winBounds.width) / 2);
    const winY = Math.round(y + (height - winBounds.height) / 2);

    mainWindow.setPosition(winX, winY);
    mainWindow.show();
    mainWindow.focus();
    // 通知渲染进程刷新数据
    mainWindow.webContents.send('window:shown');
  }
}

function createTray() {
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'assets', 'icon.png')
    : path.join(__dirname, '..', '..', 'assets', 'icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开面板',
      click: () => toggleWindow(),
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('历史粘贴板');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => toggleWindow());
}

function registerShortcut() {
  // 先清理所有可能的残留注册
  globalShortcut.unregisterAll();

  const shortcuts = [
    'CommandOrControl+Shift+V',
    'CommandOrControl+Alt+V',
    'CommandOrControl+Shift+B',
    'Alt+Shift+V',
    'CommandOrControl+Shift+F12',
    'CommandOrControl+Shift+F11',
  ];

  for (const shortcut of shortcuts) {
    const registered = globalShortcut.register(shortcut, () => {
      toggleWindow();
    });
    if (registered) {
      const key = shortcut.replace('CommandOrControl+', 'Ctrl+');
      console.log(`全局快捷键注册成功: ${key}`);
      return;
    }
  }

  console.warn('全局快捷键注册失败，请通过系统托盘打开面板');
}

app.whenReady().then(async () => {
  // 初始化数据库
  await database.init();

  createWindow();
  createTray();
  registerShortcut();

  // 注册 IPC 处理
  ipcHandlers.register(mainWindow);

  // 启动时执行一次过期清理
  const retentionDays = settings.get('retentionDays');
  database.cleanExpired(retentionDays);

  // 每小时执行一次清理
  cleanupTimer = setInterval(() => {
    const days = settings.get('retentionDays');
    database.cleanExpired(days);
  }, 60 * 60 * 1000);

  // 首次启动时显示窗口
  setTimeout(() => toggleWindow(), 500);
});

app.on('window-all-closed', (event) => {
  event.preventDefault();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (cleanupTimer) clearInterval(cleanupTimer);
  const monitor = require('./clipboard-monitor');
  monitor.stop();
});

