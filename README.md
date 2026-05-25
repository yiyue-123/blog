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

## 配置

- 修改 `hugo.toml` 里的 `baseURL`、`title`、`params.author` 和 `params.description`。
- 如需自定义域名，把 `static/CNAME.example` 改名为 `static/CNAME`，并填入真实域名。
- GitHub Pages 部署由 `.github/workflows/deploy.yml` 完成，默认从 `main` 分支构建并发布到 `gh-pages` 分支。
