# 照片添加

返回 [维护指南目录](README.md)。本指南仅描述后续操作，本次没有添加照片。

## 1. 确认实际数据来源

当前展示名单是 `photo-gallery.js` 顶部的 `photoNames` 数组。每一个不带扩展名的名称都会映射为：

```text
assets/photos/thumb/<名称>.webp    照片球和网格使用
assets/photos/full/<名称>.webp     点击照片后，查看器才加载
```

`raw/photos/` 是原图存档，不是网页直接读取的位置。2026-09-27 核对时，展示名单有 21 项，而原图、缩略图、高清图目录各有 31 个文件：有资源不等于已上架。不要为新增一张照片而把目录内其他未列入名单的照片自动全部加入。

仓库目前没有照片批量生成脚本，也没有自动扫描照片目录的步骤。README 中关于“21 张原图”的描述是历史简述，维护时以 `photoNames` 和实际引用路径为准。

## 2. 准备名称和两份 WebP

为照片选一个唯一、稳定的名称，例如 `2026-autumn-river-01`，建议使用小写英文字母、数字和短横线。后续三个位置必须严格一致，包含大小写：

```text
assets/photos/thumb/2026-autumn-river-01.webp
assets/photos/full/2026-autumn-river-01.webp
photoNames 中的 '2026-autumn-river-01'
```

可保留原图在 `raw/photos/`，但网页展示只依赖这两份 WebP 和名单。原图若提交到此公开仓库，也会成为可访问的文件，应只放入本次确定要公开保存的原图。

使用支持 WebP 的图片工具导出，先校正方向、保持原始宽高比，再缩小并压缩。以下是后续新增照片的建议起点，并非已经核实的历史生成参数：缩略图最长边约 640 像素、质量约 80；高清图最长边约 2400 像素、质量约 85。根据照片细节和文件大小调整，避免无意义地放大原图。

如果已安装 ImageMagick，可在仓库根目录用以下示例生成两份文件。替换输入路径和名称，确认不会覆盖已有照片：

```powershell
magick 'raw/photos/2026-autumn-river-01.jpg' -auto-orient -resize '640x640>' -strip -quality 80 'assets/photos/thumb/2026-autumn-river-01.webp'
magick 'raw/photos/2026-autumn-river-01.jpg' -auto-orient -resize '2400x2400>' -strip -quality 85 'assets/photos/full/2026-autumn-river-01.webp'
```

这里先按方向信息旋正，再移除元数据。`magick` 属于可选工具，未安装时也可用图片编辑器完成相同导出；不要把 JPG 仅改扩展名冒充 WebP。此命令只是文档示例，本次未执行转换。

## 3. 将名称加入展示名单

编辑 `photo-gallery.js` 的 `photoNames`，在最后一项后加逗号，再追加新名称。例如当前最后一项之后：

```javascript
    'ead575459fc97b44a34edaba1391d991',
    '2026-autumn-river-01'
```

不要把 `assets/photos/` 或 `.webp` 写进名单，也不要重复添加名称。

当前代码会依据名单长度重新计算照片球布局，并用相同名单生成网格，因此追加后通常不需要改 HTML。名单顺序决定照片编号和网格顺序；新增照片也会使球面位置重新分布。

特别注意：代码中 `index === 19` 会给第 20 张照片添加 `tall` 样式。目前第 20 项是 `cd3778d87bc6d9ae61402ed6b9cd65e7`。默认在末尾追加可以保留这个对应关系。如果插入、删除或重排前面的照片，要同步检查该特殊样式是否仍对应原来想显示的照片。

## 4. 检查文件与名单

检查本次新增的两条路径均存在：

```powershell
Test-Path -LiteralPath 'assets/photos/thumb/2026-autumn-river-01.webp'
Test-Path -LiteralPath 'assets/photos/full/2026-autumn-river-01.webp'
```

两项均应为 `True`。另外核对图片能实际解码、方向正确、无重复名单，GitHub 上路径大小写与代码一致。可选地使用 `magick identify` 查看导出尺寸与格式。

## 5. 页面检查与发布

1. 打开本地 `index.html#photos`，查看旋转照片球中的新缩略图。
2. 打开 ARCHIVE 网格，确认新照片出现一次；再返回照片球。
3. 分别从球面和网格点击新照片，确认高清图能打开。缩略图正常并不说明高清图路径也正确。
4. 检查关闭查看器、手机竖屏、横竖图裁切、拖动与页面滚动是否正常。查看器支持点击背景和 Escape 关闭。
5. 按 [通用发布步骤](README.md#通用发布步骤) 提交两份 WebP 与 `photo-gallery.js`；原图存档仅在本次确实需要时一并提交。若 README 中的照片数量说明已过时，可同步维护文字。
6. 等 Pages 成功后，在 [线上照片页面](https://moriatyli.github.io/#photos) 再完成缩略图、网格和高清图检查。

## 更新、删除与排错

更新同一张照片时，用相同名称重新导出两份 WebP，无须新增名单项；发布后注意旧图片缓存。删除展示时先移除名单项，确认资源没有其他引用后再决定是否删除对应文件。

| 现象 | 排查方向 |
| --- | --- |
| 上传原图后页面不显示 | 是否生成了两份 WebP，并加入 `photoNames` |
| 有卡片但缩略图空白 | `thumb` 路径、名称、大小写、WebP 文件是否有效 |
| 缩略图正常，点击后空白 | `full` 文件是否存在、可解码且已推送 |
| 新图变成高卡片或原高卡片变了 | 是否改变了 `index === 19` 所对应的第 20 项 |
| 整个相册不出现 | 名单中是否漏逗号、引号或方括号；检查浏览器报错 |
| 一张图出现两次 | `photoNames` 是否重复，而不是只检查文件目录 |

若将来大幅删减照片，需注意球面位置使用 `photos.length - 1` 作为除数，当前实现不能直接按“只剩一张”的情形使用。大量新增时也要检查移动端布局与加载耗时，代码没有承诺固定最大数量。

