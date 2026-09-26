$ErrorActionPreference = 'Stop'

$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$sourceRoot = Join-Path $repoRoot 'Ariticle_written'
$dataRoot = Join-Path $repoRoot 'data'
$catalogPath = Join-Path $dataRoot 'articles.js'
$reviewPath = Join-Path $dataRoot 'review-needed.json'
$utf8 = [Text.UTF8Encoding]::new($false)

$shelves = [ordered]@{
    thought = @('自我','认知','哲学','心理','意识','思想','价值','人性','冥想','命理','方法论','人生','真实','正义','人的特征','成功','愚蠢')
    society = @('社会','文化','舆论','性别','女性','媒介','传播','群体','信任','阶级','婚姻','群众','自由','主义','行为','人类社会','时代','安全','信任','苏超','文化自信')
    policy = @('政策','经济','治理','政府','财政','教育','制度','发展','产业','工业','工作会议','公共','行政','学校','改革','劳动','苏北')
    technology = @('AI','科技','数据','医疗','医学','卫健','健康','技术','软件','算力','工程','数字','模型','研究','harness')
    literature = @('诗','词','小说','散文','影评','读后感','观后感','文学','电影','组诗','创作','诗改','春游','夏夜','奔月','风雅','檄文','唐探','哪吒','前缘阕','快乐','烟花棒')
}

$tagRules = @(
    @{ name = '社会'; terms = @('社会','阶级','群众','公共') },
    @{ name = '文化'; terms = @('文化','文学','传统文化') },
    @{ name = '性别'; terms = @('性别','女性','婚姻','女性主义') },
    @{ name = '舆论'; terms = @('舆论','媒体','传播') },
    @{ name = '教育'; terms = @('教育','学校','学生') },
    @{ name = '治理'; terms = @('治理','政策','政府','制度') },
    @{ name = '经济'; terms = @('经济','财政','产业','工业化') },
    @{ name = '数据'; terms = @('数据','数字','算力') },
    @{ name = '医疗'; terms = @('医疗','卫健','健康','医学') },
    @{ name = 'AI'; terms = @('AI','人工智能','harness') },
    @{ name = '认知'; terms = @('认知','心理','意识','自我') },
    @{ name = '哲学'; terms = @('哲学','价值','人性','命理') },
    @{ name = '诗歌'; terms = @('诗','词','组诗','诗改') },
    @{ name = '影视'; terms = @('电影','观后感','读后感','影评') }
)

function Normalize-Title([string]$value) {
    $value = $value.Normalize([Text.NormalizationForm]::FormC).Trim()
    $value = $value -replace '^\s*#+\s*', ''
    $value = $value -replace '(?i)\.(pdf|docx|xlsx|pptx|txt)$', ''
    $value = $value -replace '\s*\(\d+\)\s*$', ''
    $value = $value -replace '\s+[0-9a-fA-F]{32}\s*$', ''
    $value = $value -replace '^([1-9])(?=[\p{IsCJKUnifiedIdeographs}])', ''
    $value = $value -replace '[*_`~]+', ''
    $value = $value -replace '[\p{Zs}\t\r\n]+', ' '
    $value = $value -replace '^[|｜·—\-_:：]+', ''
    $value = $value -replace '[|｜]+$', ''
    return $value.Trim(' ',"`t",'·','—','-','_','：',':')
}

function Get-BookId([string]$sourceName) {
    $sha = [Security.Cryptography.SHA256]::Create()
    try {
        $bytes = $utf8.GetBytes(('Ariticle_written/' + $sourceName.Normalize([Text.NormalizationForm]::FormC)).ToLowerInvariant())
        return [Convert]::ToHexString($sha.ComputeHash($bytes)).ToLowerInvariant().Substring(0, 12)
    }
    finally {
        $sha.Dispose()
    }
}

function Get-CanonicalTitle([string]$sourceName, [string]$markdown) {
    $stem = [IO.Path]::GetFileNameWithoutExtension($sourceName)
    $title = Normalize-Title $stem
    $prefix = $markdown.Substring(0, [Math]::Min(1600, $markdown.Length))
    $heading = [regex]::Match($prefix, '(?m)^\s{0,3}#\s+(.+?)\s*#*\s*$')
    if ($heading.Success) {
        $headingTitle = Normalize-Title $heading.Groups[1].Value
        if ($headingTitle.Length -ge 2 -and $headingTitle.Length -le 100 -and $headingTitle -notmatch '^(MORIATY LIBRARY|目录|Contents)$') {
            $title = $headingTitle
        }
    }
    return $title
}

function Get-Shelf([string]$title) {
    foreach ($shelfId in $shelves.Keys) {
        foreach ($term in $shelves[$shelfId]) {
            if ($title.IndexOf($term, [StringComparison]::OrdinalIgnoreCase) -ge 0) { return $shelfId }
        }
    }
    return 'archive'
}

function Get-ArticleType([string]$title) {
    if ($title -match '诗|词|组诗|诗改') { return 'POETRY' }
    if ($title -match '观后感|读后感|影评|书评') { return 'REVIEW' }
    if ($title -match '报告|汇总|总结|调研|可行性分析') { return 'REPORT' }
    if ($title -match '研究|理论|机制|制度|范式|简述') { return 'THEORY' }
    return 'ESSAY'
}

if (-not (Test-Path -LiteralPath $sourceRoot -PathType Container)) { throw "Source directory not found: $sourceRoot" }
New-Item -ItemType Directory -Path $dataRoot -Force | Out-Null

$records = [Collections.Generic.List[object]]::new()
$review = [Collections.Generic.List[object]]::new()
$seen = @{}
$sourceFiles = @(Get-ChildItem -LiteralPath $sourceRoot -File -Filter '*.md' | Sort-Object Name)

foreach ($file in $sourceFiles) {
    $markdown = [IO.File]::ReadAllText($file.FullName, [Text.Encoding]::UTF8)
    $title = Get-CanonicalTitle $file.Name $markdown
    $mojibake = ($title -match '[�锟]') -or ($title -match 'Ã[\p{L}]|Â[\p{L}]|â(?:€™|€.)')
    if ([string]::IsNullOrWhiteSpace($title) -or $mojibake) {
        $review.Add([pscustomobject]@{ sourceFilename = $file.Name; titleCandidate = $title; reason = 'Title is empty or has ambiguous text encoding.' })
        continue
    }

    $sourceHash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    $dedupeKey = $title + [char]0x1f + $sourceHash
    if ($seen.ContainsKey($dedupeKey)) {
        $records[$seen[$dedupeKey]].sourceFiles.Add($file.Name)
        continue
    }

    $visibleText = [regex]::Replace($markdown, 'data:image/[^;\s]+;base64,[A-Za-z0-9+/=\r\n]+', ' [Image] ')
    $tags = [Collections.Generic.List[string]]::new()
    $tagText = $title + "`n" + $visibleText.Substring(0, [Math]::Min(3200, $visibleText.Length))
    foreach ($rule in $tagRules) {
        foreach ($term in $rule.terms) {
            if ($tagText.IndexOf($term, [StringComparison]::OrdinalIgnoreCase) -ge 0) {
                if (-not $tags.Contains($rule.name)) { $tags.Add($rule.name) }
                break
            }
        }
        if ($tags.Count -ge 4) { break }
    }

    $cjkCount = [regex]::Matches($visibleText, '[\p{IsCJKUnifiedIdeographs}]').Count
    $latinWords = [regex]::Matches($visibleText, '[A-Za-z0-9]+').Count
    $wordCount = $cjkCount + $latinWords
    $dateMatch = [regex]::Match(($title + "`n" + $visibleText.Substring(0, [Math]::Min(2400, $visibleText.Length))), '(?<!\d)(?:19|20)\d{2}(?!\d)')
    $plainExcerpt = [regex]::Replace($visibleText, '(?m)^\s*#{1,6}\s*|\*\*|__|[*_`~>|]', '')
    $plainExcerpt = [regex]::Replace($plainExcerpt, '\[[^\]]*\]\([^)]*\)|https?://\S+', ' ')
    $plainExcerpt = [regex]::Replace($plainExcerpt, '[\p{Zs}\t\r\n]+', ' ').Trim()
    if ($plainExcerpt.Length -gt 180) { $plainExcerpt = $plainExcerpt.Substring(0, 180).Trim() + '…' }

    $record = [pscustomobject]@{
        id = (Get-BookId $file.Name)
        slug = ''
        title = $title
        displayTitle = $title
        sourceFiles = [Collections.Generic.List[string]]::new()
        shelf = (Get-Shelf $title)
        type = (Get-ArticleType $title)
        year = if ($dateMatch.Success) { $dateMatch.Value } else { '' }
        tags = @($tags.ToArray())
        excerpt = $plainExcerpt
        wordCount = $wordCount
        readingTime = [Math]::Max(1, [Math]::Ceiling($wordCount / 400))
        markdown = $markdown
        spineColorSeed = (Get-BookId $file.Name)
    }
    $record.sourceFiles.Add($file.Name)
    $seen[$dedupeKey] = $records.Count
    $records.Add($record)
}

$collisions = $records | Group-Object -Property title | Where-Object Count -gt 1
foreach ($collision in $collisions) {
    $ordered = @($collision.Group | Sort-Object id)
    for ($index = 0; $index -lt $ordered.Count; $index++) {
        $ordered[$index].displayTitle = '{0} · 版本 {1}' -f $ordered[$index].title, ($index + 1)
    }
}
foreach ($record in $records) { $record.slug = 'book-' + $record.id }

$catalogJson = ConvertTo-Json -InputObject @($records.ToArray()) -Depth 8 -Compress
$catalogJson = $catalogJson.Replace('<', '\u003c')
$catalogJson = $catalogJson.Replace([string][char]0x2028, '\u2028').Replace([string][char]0x2029, '\u2029')
$catalogJs = "window.MORIATY_ARTICLES = $catalogJson;`n"
[IO.File]::WriteAllText($catalogPath, $catalogJs, $utf8)
[IO.File]::WriteAllText($reviewPath, (ConvertTo-Json -InputObject @($review.ToArray()) -Depth 4), $utf8)

Write-Output ('Catalog generated: {0} entries from {1} source files.' -f $records.Count, $sourceFiles.Count)
Write-Output ('Titles needing manual review: {0}.' -f $review.Count)
foreach ($group in ($records | Group-Object shelf | Sort-Object Name)) {
    Write-Output ('{0}: {1}' -f $group.Name, $group.Count)
}
