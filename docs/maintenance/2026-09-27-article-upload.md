# 2026-09-27 两篇文章上传记录

这是根据本次对话与 GitHub 提交证据事后整理的逐步操作记录，不是上传当时自动生成的逐条工具审计日志。未记录的时间和动作不作补造。

## 任务与输入

用户要求将两篇上传的 Markdown 同步到 `MoriatyLi/moriatyli.github.io` 的 Library，确保书架及索引能找到并打开：

- `公平.md`
- `从静态互利到动态依赖_交换能力存量与合作共赢的跨期经济学模型.md`

## 实际执行步骤

1. 读取用户引用的前一段 ChatGPT 对话，取得两份附件的临时本地路径，确认附件存在并读取内容。临时路径不是长期内容来源，因此不作为后续维护依赖。
2. 查询 GitHub 仓库信息，确认默认分支为 `main`，当前连接具有写权限。
3. 检查仓库根目录、文章目录、数据目录、README、`index.html`、`app.js` 和目录生成脚本，确认没有独立的 `library/` 文件夹；Library 是首页中的一个区段。
4. 确认加载关系：`Ariticle_written/` 保存源 Markdown；`data/articles.js` 声明 `window.MORIATY_ARTICLES` 并嵌入正文；`app.js` 用同一目录构建书架、Search、Index 和阅读器。
5. 阅读 `scripts/generate-catalog.ps1`，确认标题清理、ID、分类、标签、字数、摘要等生成规则，并发现每篇文章都必须具备不超过 6 字符的 `$spineLabels` 映射。
6. 按现有“路径及文件名小写、Unicode NFC、SHA-256 前 12 位”的规则，用 PowerShell 计算两篇文章的 ID；为《公平》设置“公平正义”，为经济学文章设置“动态依赖”。在 `thought` 分类规则中补入“公平”。经济学文章的标题含“经济”，按已有规则归入 `policy`。
7. 读取最新 `main` 的提交和树，以及原有 90 条目录记录。通过工具编排读取附件正文，按生成器规则构造两条记录并追加到原目录；同步准备源文件和生成器修改。本次实际没有在完整本地仓库运行 `generate-catalog.ps1`，后续常规维护应优先按照[文章指南](articles.md)执行现有生成器。
8. 使用 GitHub Git Data API 为四个文件创建 blob，以原树为基础创建新树，再创建以原 `main` 为父提交的新提交。随后以 `force: false` 更新 `main`，将四项改动同时发布，避免中途只出现原文或只有目录。
9. 从 GitHub 回读两篇源文件、目录和生成器，确认目录从 90 条增至 92 条，两条记录包含正文，且分类规则和书脊标签已保存。确认 `index.html` 包含 `data/articles.js`，阅读器调用 `renderMarkdown(article.markdown)`。
10. 查询 GitHub Actions，确认对应本次提交的 **pages build and deployment** 状态为 `completed`、结论为 `success`。
11. 曾尝试连接内置浏览器做线上点击检查，但浏览器连接被运行环境拒绝（native pipe bridge 不可用），因此本次助手没有完成浏览器实际点击验收。随后用户在对话中明确确认：“我已经确认过文章上线成功了。”

## 最终改动与证据

| 文件 | 变化 |
| --- | --- |
| `Ariticle_written/公平.md` | 新增原文 |
| `Ariticle_written/从静态互利到动态依赖_交换能力存量与合作共赢的跨期经济学模型.md` | 新增原文 |
| `data/articles.js` | 新增两条含正文的目录记录，合计 92 条 |
| `scripts/generate-catalog.ps1` | 新增两条书脊短名映射及“公平”分类关键词 |

- 提交：[e110f3422d092194cae7e9d40145d72e86e3a3e5](https://github.com/MoriatyLi/moriatyli.github.io/commit/e110f3422d092194cae7e9d40145d72e86e3a3e5)
- 部署：[pages build and deployment / 36310200307](https://github.com/MoriatyLi/moriatyli.github.io/actions/runs/36310200307)
- 网站：[Library](https://moriatyli.github.io/#library)
- 文章 ID：`a0c24b6306ee`（公平），`77b7e070bb9a`（动态依赖）。

## 执行中的失败与边界

- 初次准备上传数据时，工具编排环境没有 `TextEncoder`，ID 计算失败。错误发生在任何创建 blob、提交或分支更新之前；改为在 PowerShell 计算 ID 后继续。
- 查询提交详情时曾使用错误的参数名，被连接器拒绝；后按工具声明改为 `repo_full_name`、`commit_sha` 并读取成功。这没有影响已完成的提交或部署。
- 部分目录、脚本和提交详情的完整输出过长，被显示层截断；后续通过提取关键字段、保存并读取工具返回内容核对所需结构。
- 目录中的年份沿用生成器规则，经济学文章得到 `1962`（文献引用年份）。本次没有另行修改日期规则；这个值不应解释为真实写作年份。
- 仓库回读与部署成功均有工具证据；线上成功另有用户确认。没有生成本次浏览器截图，也不宣称做过公式排版或完整跨设备测试。

## 后续可复用的关键顺序

原文入库 → 确定稳定文件名及 ID → 补书脊短名和必要分类规则 → 生成目录 → 核对目录及页面 → 原文与目录一起提交 → 等 Pages 部署 → 线上检查并留下记录。

