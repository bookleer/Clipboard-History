// 生产模式启动 Electron
// 清除 ELECTRON_RUN_AS_NODE 环境变量，确保 Electron 正常启动
const { spawn } = require('child_process');
const path = require('path');

const electronPath = require('electron');

delete process.env.ELECTRON_RUN_AS_NODE;

const child = spawn(electronPath, [path.resolve(__dirname, '..')], {
  stdio: 'inherit',
  env: {
    ...process.env,
    ELECTRON_RUN_AS_NODE: undefined,
  },
  shell: false,
});

child.on('exit', (code) => {
  process.exit(code);
});
