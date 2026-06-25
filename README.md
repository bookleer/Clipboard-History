# 历史粘贴板 (Clipboard History)

一款运行在 Windows 上的剪贴板历史管理工具。后台静默记录你复制的文字和图片，随时通过快捷键呼出面板查看、搜索、再次粘贴。

## 功能特性

- **自动记录**：后台监听剪贴板，文字和图片都能保存
- **历史面板**：时间降序卡片式展示，置顶项始终在最前
- **详情查看**：点击卡片进入详情页，查看完整内容
- **一键复制**：详情页中 `Ctrl+C` 或点击按钮即可复制到剪贴板
- **搜索过滤**：输入关键词快速定位历史记录
- **置顶 / 删除**：重要内容置顶，不需要的随手删除
- **保留天数**：可设定 1 天 / 3 天 / 5 天，过期自动清理
- **内容去重**：连续复制相同内容不会重复记录
- **全局快捷键**：一键呼出/隐藏面板
- **系统托盘**：后台常驻，不打扰正常工作

## 安装使用

### 方式一：下载安装包

从 [Releases](https://github.com/bookleer/Clipboard-History/releases) 页面下载最新的 `历史粘贴板 Setup x.x.x.exe`，双击安装即可。

### 方式二：源码运行

```bash
# 克隆仓库
git clone https://github.com/bookleer/Clipboard-History.git
cd Clipboard-History

# 安装依赖
npm install

# 构建前端
npm run build

# 启动应用
npm run electron:start
```

## 操作指南

| 操作 | 方法 |
|------|------|
| 呼出面板 | 按下全局快捷键（自动匹配可用组合键）shif t+ alt + v |
| 隐藏面板 | 点击窗口外部 / 再次按快捷键 / 按 `Esc` |
| 查看详情 | 点击任意历史卡片 |
| 复制内容 | 详情页中按 `Ctrl+C` 或点击「复制」按钮 |
| 置顶 / 删除 | 鼠标悬停卡片，点击图钉或垃圾桶图标 |
| 搜索 | 在顶部搜索栏输入关键词 |
| 设置保留天数 | 点击右上角齿轮图标 |
| 退出程序 | 右键系统托盘图标 → 退出 |

## 技术栈

| 层面 | 技术 |
|------|------|
| 桌面框架 | Electron 28 |
| 前端 | React 18 + Vite |
| 数据库 | sql.js (SQLite WASM) |
| 配置存储 | electron-store |
| 打包 | electron-builder (NSIS) |

## 项目结构

```
Clipboard-History/
├── src/
│   ├── main/                     # Electron 主进程
│   │   ├── index.js              # 窗口管理、托盘、快捷键
│   │   ├── clipboard-monitor.js  # 剪贴板轮询监听
│   │   ├── database.js           # SQLite 数据库操作
│   │   ├── ipc-handlers.js       # IPC 通信处理
│   │   └── settings.js           # 应用设置
│   ├── preload/
│   │   └── preload.js            # contextBridge 安全桥接
│   └── renderer/                 # React 前端
│       ├── App.jsx               # 主应用
│       ├── App.css               # 全局样式（淡蓝主题）
│       ├── components/
│       │   ├── SearchBar.jsx     # 搜索栏
│       │   ├── ClipCard.jsx      # 历史记录卡片
│       │   ├── ClipList.jsx      # 卡片列表
│       │   ├── ClipDetail.jsx    # 内容详情页
│       │   ├── SettingsPanel.jsx # 设置面板
│       │   └── Toast.jsx         # 提示消息
│       └── hooks/
│           └── useClipboard.js   # 剪贴板数据 Hook
├── docs/                         # 项目文档
│   ├── requirements.md           # 需求文档
│   ├── tech-spec.md              # 技术规范
│   ├── design-spec.md            # UI 设计规范
│   └── changelog.md              # 变更记录
├── scripts/                      # 启动辅助脚本
├── assets/                       # 应用图标
├── 日志/                          # 开发日志
├── CLAUDE.md                     # AI 辅助开发指引
└── package.json
```

## 开发命令

```bash
npm run dev             # 启动 Vite 开发服务器（仅前端）
npm run build           # 构建前端
npm run electron:dev    # 启动 Electron + Vite 开发模式
npm run electron:start  # 生产模式启动 Electron
npm run electron:build  # 打包为 Windows 安装包
```

## License

MIT
