$ErrorActionPreference = 'Stop'

$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$sourceRoot = Join-Path $repoRoot 'Ariticle_written'
$dataRoot = Join-Path $repoRoot 'data'
$catalogPath = Join-Path $dataRoot 'articles.js'
$reviewPath = Join-Path $dataRoot 'review-needed.json'
$utf8 = [Text.UTF8Encoding]::new($false)
$excludedSourceNames = @(
    '数聚新潮——医疗健康合成数据交易的经纪商培育创业模式.md'
)
$spineLabels = @{
    'e58d2dae3eff' = '战火人性'
    'c9ff0862802a' = '晚婚与麻木'
    '8b135c3d4f39' = '自我调校'
    '9b6beb79c1f0' = '财政预期'
    '370a4875fac8' = '节庆时论'
    '38a3948e36a2' = '数据交易'
    '010af8af87e3' = '北方项目'
    '5df4ae9a9390' = '数据流通'
    'e4c9dc37934e' = '女性主义'
    '7a3081ab2a62' = '合成数据'
    '9641c0407963' = '数据合规'
    '4467965a75ed' = '数据保护'
    '3845b52633e7' = '法治比较'
    '826e40735f1c' = '医疗法治'
    '8f7f2ff5aa86' = '卫健数智化'
    'c5b4b0736c91' = '经济观察'
    '8ef18a26d0a7' = '女性自主'
    '88c697d6f833' = '健康数据'
    '266687582635' = '自由选择'
    'b050917f65c3' = '自我压抑'
    '8c1cb2f494f9' = '致远方文明'
    'cc0152e6535a' = '叙事与创新'
    '09055ddb6aa7' = '群众舆情'
    '93c53ea7c2cf' = '苏北新生'
    'c95456c97715' = '政府之大'
    'ba001f38b4c2' = '安全与阴谋'
    '87be9060ca73' = '社会演进'
    '940b09983833' = '拆解主义'
    'a0b5ef238ba6' = '抽象幻觉'
    'cdc239e7ddda' = '浮板模型'
    '36133afcfe53' = '工业化路'
    '65b5b4909f78' = '青春自述'
    'a05b95e29cbe' = '人工智能'
    '2934c8c1e5d4' = '思想对谈'
    '893ca599df81' = '日常之乐'
    'e3561c9c4a8d' = '认识自己'
    '41f0a1986f07' = '流量与资本'
    '6a62c118bf14' = '理想与现实'
    '2ba2893ac3de' = '经济前瞻'
    '6d66986b22fe' = '问题可见'
    '2c7904651037' = '决策边界'
    'a6a2f8f2b225' = '奋斗与阶级'
    '305a31b6a647' = '数据资产'
    'f0a6cdc8c4f2' = '无我之思'
    'ba31ded8018c' = '命理决策'
    '54fded1c5059' = '神话与悲剧'
    '1a8c87e6739b' = '事件哀悼'
    '8c877d19887a' = '宫廷前缘'
    '13d3ad485039' = '人的特征'
    '50096e5629cd' = '直抒胸臆'
    '50e12a9da880' = '成功与意义'
    'c9c57f50ed53' = '性别舆情'
    '02fa955d7fc2' = '红楼宿命'
    'db980e4b085a' = '信任与撕裂'
    '23005553ed3d' = '行为传播'
    '413cb4095695' = '日常观察'
    '6d2a558bc78e' = '历史叙事'
    '80925562f239' = '数字航数'
    '0b67b36f1b36' = '女权开题'
    'ba0b74bb23ee' = '卫健调研'
    '1945b2b3c1f8' = '卫健调研'
    '1a8e69b810a8' = '健康数据'
    '2147e323b626' = '交易生态'
    '40e68a944ece' = '数据再分配'
    'd17d9e77af6f' = '工作价值'
    '8c71acad45fe' = '群体与权力'
    '674cbc15dc9d' = '宽进严出'
    'd9a06696a8fc' = '讨伐檄文'
    '366434dde720' = '夏夜诗情'
    'ea2ad33d752a' = '翻新悖论'
    'c582269b60b4' = '媒介与权威'
    '65b73f7a2d5a' = '信任三层'
    '9b22e1f46ace' = '性别与阶级'
    '7e01ea40361d' = '火光入思'
    '8d98cb742b43' = '传统双创'
    '0262cf266e45' = '易术阐释'
    '22937bd1aa0b' = '主体能力'
    'e89d6a12784b' = '来信对谈'
    '990d188bd6bd' = '人性与性别'
    '9c56b128870e' = '还世界于人'
    'affa17d6a0c4' = '文化自信'
    'a721704521f4' = '正义何在'
    '9c91990717af' = '社会学范式'
    '14a7b97e186c' = '经济会议'
    '82cdf5d6aca5' = '中医申遗'
    '9d1ccf478886' = '反贪读史'
    'a0c24b6306ee' = '公平正义'
    '77b7e070bb9a' = '动态依赖'
    '0fc372f1199a' = '罪与可能'
    '0ea38506d0b2' = '诗心难译'
    '6800968224da' = '权威与真相'
    '2b903fd6db01' = '政局机遇'
}

$shelves = [ordered]@{
    thought = @('公平','自我','认知','哲学','心理','意识','思想','价值','人性','冥想','命理','方法论','人生','真实','正义','人的特征','成功','愚蠢')
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
$sourceFiles = @(Get-ChildItem -LiteralPath $sourceRoot -File -Filter '*.md' |
    Where-Object { $_.Name -notin $excludedSourceNames } |
    Sort-Object Name)

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
    $chineseCharCount = $cjkCount
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
        chineseCharCount = $chineseCharCount
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
foreach ($record in $records) {
    $record.slug = 'book-' + $record.id
    if (-not $spineLabels.ContainsKey($record.id)) {
        throw "Missing curated spine label for '$($record.displayTitle)' ($($record.id))."
    }
    $record | Add-Member -NotePropertyName spineLabel -NotePropertyValue $spineLabels[$record.id]
    if ($record.spineLabel.Length -gt 6) {
        throw "Spine label exceeds six characters: '$($record.spineLabel)' for '$($record.displayTitle)'."
    }
}

$catalogJson = ConvertTo-Json -InputObject @($records.ToArray()) -Depth 8 -Compress
$catalogJson = $catalogJson.Replace('<', '\u003c')
$catalogJson = $catalogJson.Replace([string][char]0x2028, '\u2028').Replace([string][char]0x2029, '\u2029')
$catalogJs = "window.MORIATY_ARTICLES = $catalogJson;`n"
[IO.File]::WriteAllText($catalogPath, $catalogJs, $utf8)
[IO.File]::WriteAllText($reviewPath, (ConvertTo-Json -InputObject @($review.ToArray()) -Depth 4), $utf8)

Write-Output ('Catalog generated: {0} entries from {1} source files.' -f $records.Count, $sourceFiles.Count)
Write-Output ('Excluded by owner request: {0} source file(s).' -f $excludedSourceNames.Count)
Write-Output ('Titles needing manual review: {0}.' -f $review.Count)
foreach ($group in ($records | Group-Object shelf | Sort-Object Name)) {
    Write-Output ('{0}: {1}' -f $group.Name, $group.Count)
}
