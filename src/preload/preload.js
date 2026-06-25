const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // 剪贴板相关
  getHistory: (search) => ipcRenderer.invoke('clipboard:getAll', { search }),
  pinItem: (id) => ipcRenderer.invoke('clipboard:pin', { id }),
  deleteItem: (id) => ipcRenderer.invoke('clipboard:delete', { id }),
  copyItem: (id) => ipcRenderer.invoke('clipboard:copy', { id }),

  // 设置相关
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (key, value) => ipcRenderer.invoke('settings:update', { key, value }),

  // 监听新数据推送
  onNewItem: (callback) => {
    ipcRenderer.on('clipboard:newItem', (_event, item) => callback(item));
  },
  removeNewItemListener: () => {
    ipcRenderer.removeAllListeners('clipboard:newItem');
  },

  // 监听窗口显示（用于刷新数据）
  onWindowShown: (callback) => {
    ipcRenderer.on('window:shown', () => callback());
  },
  removeWindowShownListener: () => {
    ipcRenderer.removeAllListeners('window:shown');
  },

  // 窗口控制
  hideWindow: () => ipcRenderer.invoke('window:hide'),
});
