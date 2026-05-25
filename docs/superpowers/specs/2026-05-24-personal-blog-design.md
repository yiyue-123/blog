# 个人技术博客 - 设计文档

**日期**: 2026-05-24
**状态**: 设计完成

## 概述

基于 Hugo 的个人技术博客，极简风格，纯 Markdown 写作，GitHub Pages 自动部署。

## 技术选型

| 层面 | 选择 | 说明 |
|------|------|------|
| 静态生成器 | Hugo | Go 编写，构建极快，内置代码高亮和 RSS |
| 主题 | Hermit | 极简主题，暗色代码块，排版克制 |
| 内容管理 | 纯 Markdown 文件 | 直接在编辑器写 .md，无后台 |
| 托管 | GitHub Pages | 免费、稳定、自动化部署 |
| 域名 | 自定义域名 | 通过 CNAME 和 DNS 配置 |

## 项目结构

```
my-blog/
├── archetypes/default.md     # 文章模板
├── assets/css/custom.css     # 自定义样式覆盖
├── content/
│   ├── posts/                # 所有文章
│   │   └── 2026-05-24-slug/
│   │       └── index.md
│   └── about.md              # 关于页面
├── static/                   # favicon、CNAME 等
├── hugo.toml                 # 站点配置
└── themes/hermit/            # 主题（Git submodule）
```

## 功能范围

- **文章列表**：首页按时间倒序，分页（每页 10 篇）
- **分类/标签**：自动生成分类页和标签页
- **代码高亮**：Chroma 内置，暗色主题，覆盖常用编程语言
- **RSS**：Hugo 内置生成
- **关于页**：静态页面，简短个人介绍
- **自定义域名**：CNAME 文件 + DNS CNAME/A 记录
- **导航**：桌面端顶部横栏，移动端汉堡菜单

## 配色与排版

- **背景**：#fafafa（浅灰白）
- **正文**：#111（近黑）
- **代码块**：暗色背景，VS Code 风格
- **链接/强调**：#2563eb（蓝）
- **字体**：系统字体栈（PingFang / 微软雅黑 / sans-serif）
- **等宽字体**：JetBrains Mono（代码块）
- **内容宽度**：最大 680px，居中

## 部署流程

1. 推送 Markdown 源文件到 GitHub 主分支
2. GitHub Actions 触发：`hugo --minify` 构建
3. 输出部署到 `gh-pages` 分支
4. GitHub Pages 从 `gh-pages` 分支提供服务
5. 自定义域名通过仓库 CNAME 文件和 DNS 配置绑定

## 写文章流程

```bash
hugo new posts/2026-05-24-文章标题   # 创建文章
# 编辑 content/posts/.../index.md
hugo server -D                       # 本地预览
hugo                                 # 构建
git push                             # 发布
```

## 非功能需求

- 首屏加载 :< 2 秒
- 页面 Lighthouse 评分 >= 90
- 移动端响应式适配
