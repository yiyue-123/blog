# 个人技术博客

一个基于 Hugo 的极简个人技术博客。项目按 `docs/superpowers/specs/2026-05-24-personal-blog-design.md` 实现，支持 Markdown 写作、分类、标签、RSS、代码高亮和 GitHub Pages 自动部署。

## 本地预览

先安装 Hugo Extended，然后运行：

```bash
hugo server -D
```

构建静态文件：

```bash
hugo --minify
```

## 写文章

```bash
hugo new posts/2026-05-24-文章标题/index.md
```

文章会生成到 `content/posts/` 下。把 front matter 里的 `draft` 改为 `false` 后即可发布。

## 导入 PDF

后台地址 `/admin/pdf-importer.html` 支持选择 PDF 文件生成 Hugo 文章内容，并把 PDF 中解析出的图片保存到 `static/images/pdf-imports/<日期-目录名>/`，正文使用 `/images/pdf-imports/...` 加载图片。登录后台后，解析完成可以直接保存到线上仓库；也支持本地浏览器直接写入项目目录，或下载包含文章和媒体文件的内容包。

## 配置

- 修改 `hugo.toml` 里的 `baseURL`、`title`、`params.author` 和 `params.description`。
- 如需自定义域名，把 `static/CNAME.example` 改名为 `static/CNAME`，并填入真实域名。
- GitHub Pages 部署由 `.github/workflows/deploy.yml` 完成，默认从 `main` 分支构建并发布到 `gh-pages` 分支。
