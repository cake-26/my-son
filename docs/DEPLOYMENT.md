# 部署文档 — 宝宝成长记录

## 部署架构

```
本地开发  ──git push──>  GitHub (cake-26/my-son)
    │                         │
    │                         │ (手动或 CI)
    │                         ▼
    └── npm run build ──>  wrangler pages deploy dist
                               │
                               ▼
                      Cloudflare Pages
                    https://my-son.pages.dev
```

当前使用**手动部署**方式，不依赖 GitHub Actions 或 Cloudflare 自动构建。

## 环境要求

| 工具 | 最低版本 | 用途 |
|------|---------|------|
| Node.js | 18+ | 构建运行时 |
| npm | 9+ | 包管理 |
| wrangler | 4+ | Cloudflare Pages CLI |
| gh (可选) | 2+ | GitHub CLI |

## 本地开发

```bash
# 克隆项目
git clone https://github.com/cake-26/my-son.git
cd my-son

# 安装依赖
npm install

# 启动开发服务器
npm run dev
# → http://localhost:5173/
```

开发模式下 PWA Service Worker **不会**注册（仅生产构建生成）。

## 生产构建

```bash
npm run build
```

输出到 `dist/` 目录，包含：
- 所有 JS/CSS 代码块（tree-shaken + minified）
- `sw.js` — Workbox Service Worker
- `workbox-*.js` — Workbox 运行时
- `manifest.webmanifest` — PWA manifest
- `registerSW.js` — SW 注册脚本
- `index.html` — 入口 HTML

### 构建验证

```bash
# 本地预览生产版本
npm run preview
# → http://localhost:4173/

# TypeScript 类型检查
npx tsc -b --noEmit
```

## 部署到 Cloudflare Pages

### 首次设置

```bash
# 安装 wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 创建 Pages 项目
wrangler pages project create my-son --production-branch main
```

### 部署命令

```bash
# 构建 + 部署
npm run build && wrangler pages deploy dist --project-name my-son --commit-message "deploy"
```

部署完成后，输出部署 URL:
- 生产域名: `https://my-son.pages.dev`
- 部署预览: `https://<hash>.my-son.pages.dev`

### 注意事项

- Cloudflare Pages 的 commit message 不支持非 ASCII 字符（中文），使用英文
- 每次部署上传的文件会与已有文件去重，仅上传变化的部分
- 免费版 Cloudflare Pages 支持 500 次/月部署

## GitHub 仓库

- **地址**: https://github.com/cake-26/my-son
- **分支**: `main`
- **可见性**: Public

### 推送代码

```bash
git add -A
git commit -m "your message"
git push origin main
```

### .gitignore

```
node_modules
dist
.DS_Store
*.local
.venv
__pycache__
```

## 自动化部署 (可选)

如需设置 Cloudflare Pages 自动从 GitHub 构建部署：

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Pages → my-son → Settings → Builds & deployments
3. 连接 GitHub 仓库 `cake-26/my-son`
4. 配置:
   - 构建命令: `npm run build`
   - 输出目录: `dist`
   - Node.js 版本: `18`
5. 之后每次 push 到 `main` 自动触发构建部署

## PWA 安装

### iOS (Safari)

1. 打开 https://my-son.pages.dev
2. 点击 Safari 分享按钮 → "添加到主屏幕"
3. 确认名称 → 添加
4. 从主屏幕打开即为全屏 standalone 模式

### Android (Chrome)

1. 打开 https://my-son.pages.dev
2. Chrome 自动弹出"添加到主屏幕"横幅
3. 或手动: 三点菜单 → "安装应用"

### 桌面 (Chrome/Edge)

1. 打开 https://my-son.pages.dev
2. 地址栏右侧出现安装图标 → 点击安装

## 离线支持

PWA Service Worker 使用 Workbox `generateSW` 策略，预缓存所有静态资源。

**行为**:
- 首次访问: 下载并缓存所有资源
- 后续访问: 优先从缓存加载（离线可用）
- 更新: `autoUpdate` 模式下，检测到新版本自动更新 SW

**数据**: IndexedDB 数据始终存储在本地，与网络状态无关。

## 域名配置 (可选)

如需绑定自定义域名:

1. Cloudflare Dashboard → Pages → my-son → Custom domains
2. 添加自定义域名
3. Cloudflare 自动配置 DNS 和 SSL

## 监控

Cloudflare Pages 提供基础分析:
- Dashboard → Pages → my-son → Analytics
- 访问量、带宽、请求数等

无需额外配置。
