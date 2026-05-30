# 个人技术博客 — 开发进度总览

> 最后更新: 2026-05-30 | 总 commits: 326

## 项目概览

基于 Hugo 的极简个人技术博客，部署在 `https://blog.yiyue.tech`，支持 Markdown 写作、在线 CMS 编辑、PDF 一键导入、GitHub Pages 自动部署。

| 项 | 详情 |
|---|------|
| 仓库 | `yiyue-123/blog` (GitHub) |
| 域名 | `blog.yiyue.tech` (腾讯云注册, Cloudflare DNS) |
| 框架 | Hugo Extended v0.161.1 |
| 主题 | hermit (自建, 10 个模板文件) |
| CMS | Decap CMS + DecapBridge |
| 部署 | GitHub Actions → gh-pages 分支 |
| 语言 | 简体中文 (zh-CN) |

---

## 一、已完成模块

### 1. 主题系统 (themes/hermit)

自建的轻量主题，10 个文件覆盖全部布局：

- `baseof.html` — HTML5 骨架, SEO meta, RSS 订阅, 响应式导航 (桌面菜单 + 移动端汉堡菜单)
- `index.html` — 首页文章分页列表 (每页 10 篇)
- `single.html` — 文章详情页 (标题/日期/分类/标签/正文)
- `list.html` — 通用列表页, 带分页
- `taxonomy.html` / `terms.html` — 分类/标签概览页
- `taxonomy/list.html` / `term/list.html` — 分类/标签下的文章列表
- `partials/post-item.html` — 文章摘要卡片复用组件

**主题特性**: 系统暗色模式自适应 (`prefers-color-scheme: dark`), 打印样式, 系统字体栈 (PingFang SC / Microsoft YaHei), JetBrains Mono 等宽字体

### 2. 样式系统 (assets/css/custom.css)

约 565 行自定义 CSS, 通过 Hugo Pipelines 处理 (minify + fingerprint):

- CSS 变量驱动的亮/暗双主题
- 三档响应式: 640px+ (桌面), 640px- (移动端), 380px- (超小屏)
- 代码块 (暗色背景), 表格, 引用块, 列表, 分页导航, 标签云, 页脚
- 焦点轮廓, 过渡动画等无障碍细节

### 3. 内容体系 (content/)

共 6 篇内容:

| 文章 | 分类 | 日期 | 说明 |
|------|------|------|------|
| 从这里开始 | 随笔 | 2026-05-24 | 开篇文, Hugo, 博客 |
| 树——简单 | 树 | 2026-05-25 | LeetCode 算法笔记 |
| 树——中等 | 树 | 2026-05-25 | LeetCode 算法笔记 |
| 滑动窗口——中等 | 滑动窗口 | 2026-05-26 | LeetCode 算法笔记 |
| JVM从入门到放弃 | 八股 | 2026-05-26 | PDF 导入长文 (2900行, 68张图) |
| 关于 | - | 2026-05-24 | 个人介绍页 |

**permalinks**: `/posts/:year/:month/:slug/`

### 4. CMS 在线编辑 (static/admin/)

| 文件 | 用途 |
|------|------|
| `config.yml` | Decap CMS 配置 (中文界面, git-gateway 后端, posts + pages 两个集合) |
| `index.html` | CMS 入口页面 |
| `pdf-importer.html` | PDF 导入工具页面 |
| `pdf-importer.css` | 导入工具样式 |
| `pdf-importer.js` | 导入工具核心逻辑 (约 880 行, pdf.js 解析, 三类保存方式) |
| `cms-media-cleanup.js` | 媒体清理: 删除/编辑文章时自动清理不再被引用的图片 |

**认证**: DecapBridge (`auth.decapbridge.com` + `gateway.decapbridge.com`)

### 5. PDF 导入工具

独立的浏览器端 SPA (`/admin/pdf-importer.html`):

- 基于 pdf.js 的 PDF 解析 (文本 + 图片提取)
- 图片智能过滤 (忽略小图标/水印)
- 前端生成 front matter + Markdown 正文
- **三种保存方式**: 保存到线上仓库 (Git Gateway API) / 保存到本地项目 (File System Access API) / 下载 ZIP 内容包
- 自动复用 Decap CMS 的 GoTrue 认证 token

### 6. 自定义图片渲染 (layouts/_default/_markup/render-image.html)

覆盖 Hugo 默认图片渲染:
- 相对路径图片优先使用 Page Resources 的 RelPermalink
- 全局添加 `loading="lazy"` + `decoding="async"` 懒加载

### 7. 文章模板 (archetypes/default.md)

新建文章默认: draft=true, categories=["技术"], 格式为 `YYYY-MM-DD-slug/index.md`

### 8. 自动化部署 (.github/workflows/deploy.yml)

- 触发: 推送到 `main` 分支 / 手动 `workflow_dispatch`
- 流程: 纯 git 检出 → 下载 Hugo Extended → `hugo --minify` 构建 → gh-pages 部署
- **零第三方 Actions 依赖**, 使用 `GITHUB_TOKEN` 认证推送
- 权限: `contents: write`

### 9. 基础设施

- `static/favicon.svg` — "Y" 字母 SVG 图标
- `static/CNAME` — `blog.yiyue.tech` 自定义域名
- `hugo.toml` — 完整配置: hasCJKLanguage=true, Chroma 代码高亮 (github-dark, 无行号), RSS 全站输出
- `.gitignore` — 排除 public/, .hugo_build.lock 等

---

## 二、已知问题

| # | 问题 | 严重程度 | 说明 |
|---|------|----------|------|
| 1 | Decap CMS 代码块语言标记丢失 | 低 | 富文本编辑器插入代码块时偶尔丢失语言标记, 需切到 Markdown 模式手动写 ` ```language `。 |
| 2 | 代码高亮缺少深色适配 | 中 | `github-dark` 主题在暗色模式下显示正常, 但亮色模式下代码块仍为深色背景, 与页面白底风格不协调。Chroma 不支持运行时切换主题, 需额外方案解决。 |

---

## 三、可扩展方向

以下是没有实现的常见博客功能, 按需选用:

### 短期 (体验提升)
- [ ] 评论系统 (Giscus / Waline / utterances)
- [ ] 文章内目录 (Table of Contents)
- [ ] 站内搜索 (Pagefind / Fuse.js)
- [ ] 代码块复制按钮
- [ ] 上一篇/下一篇导航
- [ ] 文章阅读时长估算

### 中期 (内容增强)
- [ ] 图片点击放大 (lightbox)
- [ ] 数学公式支持 (KaTeX / MathJax)
- [ ] 系列文章功能 (series taxonomy)
- [ ] 文章置顶
- [ ] 标签云 / 归档页面
- [ ] 阅读统计 (不蒜子 / Google Analytics)

### 长期 (功能扩展)
- [ ] 友链页面
- [ ] 文章加密访问
- [ ] 自动生成 OG 图片
- [ ] 邮件订阅 (Newsletter)
- [ ] 多语言支持
- [ ] 自动化文章备份

---

## 四、常用操作速查

```bash
# 本地预览 (含草稿)
hugo server -D

# 构建生产版本
hugo --minify

# 新建文章
hugo new posts/YYYY-MM-DD-slug/index.md

# 推送部署 (本地 master → 远程 main)
git push origin master:main
```

**CMS 相关地址:**
- 在线编辑: `https://blog.yiyue.tech/admin/`
- PDF 导入: `https://blog.yiyue.tech/admin/pdf-importer.html`
- DecapBridge 管理: `https://decapbridge.com`
- GitHub Actions: `https://github.com/yiyue-123/blog/actions`
