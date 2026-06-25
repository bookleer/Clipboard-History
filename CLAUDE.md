# CLAUDE.md - 历史粘贴板项目指引

## 项目简介

这是一个 Windows 桌面剪贴板历史管理软件。使用 Electron + React 构建，后台监听剪贴板变化，记录文本和图片，用户可通过快捷键呼出面板查看和管理历史记录。

## 重要文档路径

| 文档 | 路径 | 说明 |
|------|------|------|
| 需求文档 | [docs/requirements.md](docs/requirements.md) | 功能清单、验收标准 |
| 技术规范 | [docs/tech-spec.md](docs/tech-spec.md) | 技术栈、项目结构、数据库设计、IPC 协议 |
| 设计规范 | [docs/design-spec.md](docs/design-spec.md) | UI 色彩、组件、交互行为 |
| 实施计划 | [docs/implementation-plan.md](docs/implementation-plan.md) | 分阶段步骤、当前进度 |
| 变更记录 | [docs/changelog.md](docs/changelog.md) | 版本变更历史 |
| 开发日志 | [日志/](日志/) | 每日开发记录 |

## 开发约定

### 工作流程

1. **分阶段执行**：严格按照实施计划的 9 个阶段逐步推进
2. **每阶段验证**：完成一个阶段后，必须验证功能正常再进入下一阶段
3. **用户确认**：每个阶段完成后，向用户报告结果并等待确认再继续
4. **每日日志**：每天开始开发时在 `日志/` 目录下创建当日日志文件

### 代码风格

- JavaScript/JSX：使用标准 ES6+ 语法
- 组件：React 函数组件 + Hooks
- 样式：纯 CSS，使用 CSS 变量管理主题色
- 文件命名：组件用 PascalCase，工具函数用 kebab-case
- 主进程代码使用 CommonJS（Electron 默认），渲染进程使用 ES Module（Vite 处理）

### 安全要求

- 渲染进程禁止直接访问 Node.js API
- 所有 IPC 通信通过 preload.js 的 contextBridge
- 剪贴板数据仅存储在本地，不上传网络

### 关键设计决策

- **sql.js 替代 better-sqlite3**：避免原生编译依赖（用户环境无 Visual Studio）
- **软删除**：删除操作仅标记 deleted=1，实际清理在自动清理时执行
- **内容去重**：使用 SHA256 前 16 位作为哈希值，按内容去重而非按时间
- **图片存储**：图片以 PNG 文件存本地目录，数据库仅存文件路径

### 已知问题与解决方案

- **ELECTRON_RUN_AS_NODE 环境变量**：Claude Code 运行环境会设置 `ELECTRON_RUN_AS_NODE=1`，导致 Electron 以 Node.js 模式运行。使用 `scripts/electron-start.js` 和 `scripts/electron-dev.js` 包装脚本清除该变量。

### 开发命令

```bash
npm run dev              # 启动 Vite 开发服务器（仅前端）
npm run build            # 构建前端
npm run electron:dev     # 启动 Electron + Vite 开发模式
npm run electron:start   # 直接启动 Electron（需先 build）
npm run electron:build   # 构建 + 打包为 Windows 安装包
```

### 当前状态

- **当前阶段**：阶段 1-9 全部完成
- **已完成**：项目骨架、窗口/托盘/快捷键、数据库层、剪贴板监听、IPC通信、前端界面、交互功能、自动清理、安装包生成
- **安装包**：`release/历史粘贴板 Setup 1.0.0.exe` (76MB)
