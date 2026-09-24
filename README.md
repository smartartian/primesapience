# 原初智性官网

北京原初智性科技有限公司的品牌官网，展示 AI 应用开发与 AI 内容创作两条核心业务线。

## 本地预览

```bash
python3 -m http.server 4173
```

打开 `http://localhost:4173`。

## GitHub Pages 部署

仓库已包含 `.github/workflows/deploy-pages.yml`。将代码推送到 `main` 分支后，GitHub Actions 会自动构建静态站点并发布到 GitHub Pages。

发布地址通常为：

```text
https://smartartian.github.io/primesapience/
```

## 文件说明

- `index.html`：页面结构与全部文案
- `styles.css`：品牌视觉、响应式布局与动效样式
- `app.js`：导航、滚动反馈和首屏交互画布
- `assets/original-logo.png`：用户提供的公司 logo 原图

## 上线前建议

1. 补充公司正式联系方式、备案信息和社交媒体链接。
2. 如需搜索引擎收录，补充正式域名、站点地图和结构化数据。
3. 后续需要展示合作入口时，再接入真实表单服务或企业邮箱接口。
