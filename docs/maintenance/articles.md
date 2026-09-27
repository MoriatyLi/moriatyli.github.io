# 文章添加与同步

返回 [维护指南目录](README.md)。以下步骤基于当前站点实现，命令在完整仓库根目录执行。

## 1. 了解实际加载关系

`Ariticle_written/*.md` → `scripts/generate-catalog.ps1` → `data/articles.js` → `index.html` / `app.js` → 书架、Search、Index 和阅读器。

`Ariticle_written` 是仓库现有拼写，请保持一致。网页实际读取 `window.MORIATY_ARTICLES`，目录中包含正文；浏览器不会自动扫描 Markdown 文件，也不会在打开文章时重新读取源文件。因此新增和修改原文后都要同步生成目录。

## 2. 放入原文

将 UTF-8 Markdown 放到 `Ariticle_written/` 的直接下一层。当前脚本不递归扫描子目录。文件名尽量稳定：文章 ID 由路径和文件名生成，改名会改变 ID、链接和书脊标签映射。

网页标题优先采用正文前 1600 字符内符合规则的 H1（长度 2–100）；否则采用清理后的文件名。推荐写法：

```markdown
# 文章完整标题

正文……
```

当前脚本没有解析 YAML front matter 的逻辑，不要假设写入 `title:`、`date:`、`tags:` 即可指定网站元数据。也不要把操作说明放进文章目录，它会被当成文章扫描。

## 3. 计算 ID，补上必填书脊短名

在 PowerShell 7 中运行下面的片段，只替换第一行文件名，包含 `.md`，不要带上目录前缀：

```powershell
$sourceName = '新文章.md'
$normalizedName = $sourceName.Normalize([Text.NormalizationForm]::FormC)
$idInput = ('Ariticle_written/' + $normalizedName).ToLowerInvariant()
$sha = [Security.Cryptography.SHA256]::Create()
try {
    $bytes = [Text.Encoding]::UTF8.GetBytes($idInput)
    $bookId = [Convert]::ToHexString($sha.ComputeHash($bytes)).ToLowerInvariant().Substring(0, 12)
    $bookId
} finally {
    $sha.Dispose()
}
```

编辑 `scripts/generate-catalog.ps1` 顶部的 `$spineLabels`，在已有条目之间加入一行，将示例 ID 替换成实际输出：

```powershell
    '实际的12位ID' = '书脊短名'
```

书脊短名应易读且不超过 6 个字符。缺少映射会报 `Missing curated spine label`，超过长度会报 `Spine label exceeds six characters`；两者都会使本次生成失败。不能只看到旧目录还在，就认为新文章已生成成功。

本次已登记的两篇文章可作参照：

| 原文 | ID | 书脊短名 | 书架 |
| --- | --- | --- | --- |
| `公平.md` | `a0c24b6306ee` | 公平正义 | `thought` |
| `从静态互利到动态依赖_交换能力存量与合作共赢的跨期经济学模型.md` | `77b7e070bb9a` | 动态依赖 | `policy` |

## 4. 检查分类规则

`$shelves` 按顺序匹配文章标题中的关键词，首次命中即确定书架；它不读取全文来判断书架。

| 值 | 对应方向 |
| --- | --- |
| `thought` | 思想、认知、自我 |
| `society` | 社会、文化、群体 |
| `policy` | 政策、经济、治理 |
| `technology` | 科技、数据、医疗 |
| `literature` | 文学、创作 |
| `archive` | 未匹配时的档案、学习、杂记 |

如果标题无法命中合适规则，可在对应关键词列表中补充有针对性的词。本次为《公平》加入了 `thought` 的“公平”关键词。规则改动会影响所有匹配标题，应检查生成后的分类变化。

类型由 `Get-ArticleType` 按标题关键词生成；标签来自标题和正文前 3200 字符，按 `$tagRules` 顺序最多取 4 个。需要长期调整时修改生成规则，避免仅改 `data/articles.js`，否则下次生成会覆盖。

## 5. 生成目录

```powershell
pwsh -File scripts/generate-catalog.ps1
```

需要 PowerShell 7（命令名 `pwsh`），不建议改用 Windows PowerShell 5.1。脚本成功后会写入：

- `data/articles.js`：含元数据及正文的目录。
- `data/review-needed.json`：空标题或疑似乱码标题的复核名单；正常情况下为 `[]`。

脚本会跳过 `$excludedSourceNames` 中的文件。同标题且内容哈希相同的文件会合并到一条记录；同标题但内容不同会生成版本区分。因此目录条数不一定等于文件数，也不一定每次恰好增加上传数量。

不要删除或解除原有的排除规则来解决新文章不显示的问题。

## 6. 回读生成结果

以下片段只读取生成结果，不执行目录中的 JavaScript：

```powershell
$catalogText = Get-Content -LiteralPath 'data/articles.js' -Raw -Encoding UTF8
$catalogJson = $catalogText -replace '^\s*window\.MORIATY_ARTICLES\s*=\s*', '' -replace ';\s*$', ''
$records = @($catalogJson | ConvertFrom-Json)
$sourceName = '新文章.md'
$book = @($records | Where-Object { $_.sourceFiles -contains $sourceName })
if ($book.Count -ne 1) { throw '未找到唯一的新文章记录，请检查复核名单、去重和文件名。' }
$book | Select-Object id, slug, title, displayTitle, shelf, type, year, tags, spineLabel, wordCount, readingTime
Get-Content -LiteralPath 'data/review-needed.json' -Raw -Encoding UTF8
```

确认正文非空、首尾完整，ID 无冲突，分类、标题、书脊短名正确。年份尤其要检查：当前规则从标题及正文前 2400 字符中提取第一个 19xx/20xx 年份，可能误把文献年份当成文章年份。例如本次经济学文章自动得到 `1962`，来源是 Arrow 的引用，并不代表写作日期。这是当前实现的限制；需要准确年份时，应先明确实际日期，再在生成器中增加明确的元数据规则或覆盖机制并重新生成。

## 7. 页面检查与发布

1. 打开本地 `index.html`，在 Library 的 Search 输入标题中的独特词。
2. 在 Index 中检查新条目与分类筛选，再点击进入正文。
3. 旋转到对应书架，检查短名和预览卡，再打开文章。
4. 确认阅读器的标题、正文首尾、目录（如有）、图片与链接正常。含公式的文章应另外查看公式显示；目录收录成功不代表公式排版已验证。
5. 当前文章深链接形式为 `#book-<ID>`，可直接打开或刷新验证。本次例子：[公平](https://moriatyli.github.io/#book-a0c24b6306ee)、[动态依赖](https://moriatyli.github.io/#book-77b7e070bb9a)。
6. 按 [通用发布步骤](README.md#通用发布步骤) 发布。提交范围应包含新原文、生成器规则（如有修改）、`data/articles.js`，以及发生变化的 `data/review-needed.json`。

如果只是修改既有文章：保持文件名稳定，修改原文后重新运行生成器，检查并一起提交原文和目录。

## 常见问题

| 现象 | 排查方向 |
| --- | --- |
| 原文在 GitHub，但网页没有 | 是否重新生成并提交 `data/articles.js`，Pages 是否部署了这次提交 |
| 生成报缺少书脊名 | 按报错中的 ID 补入 `$spineLabels`，然后重新生成 |
| 标题乱码或缺席 | 检查 UTF-8、首个 H1 和 `data/review-needed.json` |
| 出现在错误书架 | 检查标题关键词及 `$shelves` 的先后顺序 |
| 改名后旧链接失效 | ID 依赖源文件名；核对新 ID、标签映射和已有引用 |
| 年份变成旧年代 | 检查正文前部的引用年份，不要直接把它当成发布日期 |
| 本地正常但线上还是旧内容 | 核对推送分支、部署提交 SHA、部署结果，再排除浏览器缓存 |

