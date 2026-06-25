# 技术规范 - 历史粘贴板

## 技术栈

| 层面 | 选型 | 版本 | 选型理由 |
|------|------|------|----------|
| 桌面框架 | Electron | 28.x | 成熟稳定的跨平台桌面框架，自带 Chromium 便于构建漂亮 UI |
| 前端框架 | React | 18.x | 组件化开发，生态丰富 |
| 构建工具 | Vite | 5.x | 快速 HMR，原生 ESM 支持 |
| 数据库 | sql.js | 1.x | SQLite 的 WASM 实现，无需原生编译，纯 JS |
| 配置存储 | electron-store | 11.x | 简单的 JSON 配置文件读写 |
| 打包工具 | electron-builder | 24.x | Windows NSIS 安装包生成 |

## 项目结构

```
历史粘贴/
├── package.json
├── electron-builder.yml
├── vite.config.js
├── CLAUDE.md
├── docs/                    # 项目标准文档
│   ├── requirements.md
│   ├── tech-spec.md         # 本文件
│   ├── design-spec.md
│   ├── implementation-plan.md
│   └── changelog.md
├── 日志/                     # 日常开发日志
├── assets/                   # 应用图标等静态资源
│   └── icon.png
├── src/
│   ├── main/                 # Electron 主进程
│   │   ├── index.js          # 入口：窗口/托盘/快捷键
│   │   ├── clipboard-monitor.js  # 剪贴板轮询
│   │   ├── database.js       # 数据库操作
│   │   └── ipc-handlers.js   # IPC 处理
│   ├── preload/
│   │   └── preload.js        # contextBridge
│   └── renderer/             # React 前端
│       ├── index.html
│       ├── index.jsx
│       ├── App.jsx
│       ├── App.css
│       ├── components/
│       │   ├── SearchBar.jsx
│       │   ├── ClipCard.jsx
│       │   ├── ClipList.jsx
│       │   ├── SettingsPanel.jsx
│       │   └── Toast.jsx
│       └── hooks/
│           └── useClipboard.js
└── dist/                     # 构建输出
```

## 数据库设计

### sql.js (SQLite)

**表：clipboard_items**

```sql
CREATE TABLE IF NOT EXISTS clipboard_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,           -- 'text' | 'image'
  content TEXT NOT NULL,        -- 文本内容或图片文件路径
  content_hash TEXT NOT NULL,   -- SHA256 前16位，用于去重
  timestamp INTEGER NOT NULL,   -- Unix 时间戳（毫秒）
  pinned INTEGER DEFAULT 0,     -- 0=普通, 1=置顶
  deleted INTEGER DEFAULT 0     -- 0=正常, 1=软删除
);

CREATE INDEX IF NOT EXISTS idx_timestamp ON clipboard_items(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_pinned ON clipboard_items(pinned);
CREATE INDEX IF NOT EXISTS idx_deleted ON clipboard_items(deleted);
```

### 图片文件存储

- 路径：`%APPDATA%/clipboard-manager/images/`
- 命名规则：`{timestamp}_{contentHash}.png`

### 应用设置（electron-store）

```json
{
  "retentionDays": 3,
  "autoLaunch": true
}
```

## IPC 通信协议

使用 `contextBridge` + `ipcRenderer.invoke` 模式，渲染进程通过 `window.api` 访问。

| 频道 | 方向 | 参数 | 返回值 |
|------|------|------|--------|
| `clipboard:getAll` | 渲染→主 | `{ search?: string }` | `ClipboardItem[]` |
| `clipboard:pin` | 渲染→主 | `{ id: number }` | `void` |
| `clipboard:delete` | 渲染→主 | `{ id: number }` | `void` |
| `clipboard:copy` | 渲染→主 | `{ id: number }` | `void` |
| `settings:get` | 渲染→主 | - | `Settings` |
| `settings:update` | 渲染→主 | `{ key: string, value: any }` | `void` |
| `clipboard:onNewItem` | 主→渲染 | `ClipboardItem` | -（推送） |

## 状态去重

剪贴板监听使用内容哈希进行去重：对文本内容取 SHA256 前 16 位，对图片取二进制数据的 SHA256 前 16 位。连续复制相同内容只保留一条最新记录。
