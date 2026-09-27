# 网站内容维护指南

适用仓库：`MoriatyLi/moriatyli.github.io`。基于 2026-09-27 的 `main`（`e110f3422d092194cae7e9d40145d72e86e3a3e5`）核对。

| 任务 | 操作指南 | 实际维护位置 |
| --- | --- | --- |
| 添加或更新文章 | [文章添加与同步](articles.md) | `Ariticle_written/`、`scripts/generate-catalog.ps1`、`data/` |
| 添加照片 | [照片添加](photos.md) | `assets/photos/thumb/`、`assets/photos/full/`、`photo-gallery.js` |
| 添加 Mindmap 短命题 | [Mindmap 短命题添加](mindmap.md) | `thought-tree.js`、`index.html` |
| 查看两篇文章的上传过程 | [2026-09-27 文章上传记录](2026-09-27-article-upload.md) | 原文、目录、提交与部署证据 |

## 操作前

在完整仓库副本中操作，命令的工作目录均为仓库根目录。第一次可使用 GitHub Desktop 克隆仓库；以后先查看本地改动，再同步远端最新版本。不要在仅有两篇新文章的临时目录中生成整个目录，否则生成结果会漏掉旧文章。

若用命令行，先运行 `git status --short` 检查未提交内容，处理好现有工作后运行 `git pull --ff-only`。已有本地修改时，不要直接覆盖或重置。

## 通用发布步骤

1. 按对应指南完成内容、名单或目录修改。
2. 打开本地 `index.html` 检查对应模块。已有预览页面时重新加载。
3. 在 GitHub Desktop 的 Changes 或 `git diff --stat` / `git diff` 中核对本次文件。只提交这次需要发布的文件。
4. 提交并推送到当前站点发布分支 `main`；若仓库以后启用分支保护，则按要求通过 PR 合并。避免强制推送。
5. 在 [GitHub Actions](https://github.com/MoriatyLi/moriatyli.github.io/actions) 中找到本次提交对应的 **pages build and deployment**。核对提交 SHA，等待状态为成功。
6. 打开 [线上网站](https://moriatyli.github.io/)，刷新后完成指南末尾的实际页面检查。必要时强制刷新或使用无痕窗口排除旧缓存。
7. 保存本次提交链接、部署链接和页面检查结果。部署成功表示发布流程完成，仍需实际确认展示与交互。

照片与 Mindmap 指南中的示例仅供以后操作。本次编写文档没有添加示例照片或短命题，也没有修改页面功能代码。

## 撤回一次内容更新

需要撤回时，针对确定的内容提交创建 revert 提交并正常推送，再等待 Pages 部署。文章撤回要同时撤回原文和生成目录；照片撤回要同时处理展示名单和本次新增资源；Mindmap 撤回要同步处理句子列表与数量说明。若之后已有其他修改，先检查 revert 的冲突与范围，不要用强制推送覆盖后续历史。

## 每次维护可复制的记录模板

```text
日期：
任务：文章 / 照片 / Mindmap
新增或修改内容：
涉及文件：
生成目录或转换图片的操作：
本地检查结果：
提交链接：
Pages 部署链接与状态：
线上实际检查结果：
操作者 / 用户确认：
已知限制或待处理事项：
```

