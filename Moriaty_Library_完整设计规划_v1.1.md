# MORIATY LIBRARY  
## 六边形个人文章图书馆完整设计规划 v1.1

> 文档性质：产品设计 / UI-UX / 信息架构 / 技术实现 / 内容治理 / 隐私安全综合规格  
> 项目目标：将经过隐私审查、适合公开的个人文章构建为一个六边形空间中的数字图书馆。  
> 核心原则：**网站是公开思想文库，不是私人文件库。任何日记、年度计划、年度报告、私人通信及含个人隐私的材料，不进入网站系统。**

---

# 0. 项目摘要

Moriaty Library 是一个以“图书馆”为核心隐喻的个人文章展示网站。

传统博客使用：

- 列表
- 卡片
- 时间线
- 标签页

本项目则将内容映射为：

- **文章 = 一本书**
- **主题分类 = 一个书架**
- **六个主题 = 六边形空间中的六面书架**
- **标签关系 = 星图中的连线**
- **文章之间的关系 = 星座**
- **阅读文章 = 从书架抽出一本书并打开**

用户进入网站时，不是在“浏览博客”，而是在进入一座漂浮于黑色宇宙中的私人思想图书馆。

整体视觉关键词：

> **纯黑宇宙 / 胡桃木 / 黄铜 / 古典图书馆 / 星图 / 私人档案馆 / 极简未来主义**

---

# 1. 项目目标

## 1.1 主要目标

建立一个长期可扩展的个人文章数字图书馆，用于：

1. 展示经过筛选的公开文章；
2. 将文章按六大主题进行空间化组织；
3. 支持探索式浏览与高效率检索；
4. 通过视觉系统建立独特个人品牌；
5. 支持未来持续新增文章；
6. 支持文章版本管理；
7. 支持文章标签关系图谱；
8. 支持后续扩展为“思想星图”。

---

## 1.2 非目标

本项目不应成为：

- 私人文件备份系统；
- 日记系统；
- 云盘；
- 项目资料仓库；
- 私人通信档案；
- 个人敏感数据数据库；
- 所有 Markdown 文件的无筛选镜像。

**只有通过隐私审查并确认适合公开的文章，才能进入网站生产环境。**

---

# 2. 核心设计理念

整个项目建立在四层隐喻之上。

## 2.1 第一层：书

每篇公开文章表现为一本实体书。

书籍具备：

- 书名
- 书脊短标题
- 颜色
- 高度
- 厚度
- 出版时间
- 标签
- 文章类型
- 阅读时间

---

## 2.2 第二层：书架

一个书架代表一个一级主题领域。

文章通过主题分类进入对应书架。

---

## 2.3 第三层：六边形空间

六个书架组成六边形。

用户位于六边形中央。

用户通过左右拖动、滚轮、触控板或键盘旋转视角。

因此：

**用户不是“切换页面”，而是“转身看向另一个书架”。**

---

## 2.4 第四层：星图

背景中的星空不是永久的纯装饰元素。

长期目标：

- 一颗星 = 一篇文章；
- 星星位置 = 主题 / 时间 / 标签关系；
- 星星连线 = 内容之间的关联；
- 星座 = 一组思想主题。

从而形成：

```text
文章
 ↓
书
 ↓
星
 ↓
思想节点
```

---

# 3. 内容安全与隐私边界

这是整个系统最高优先级的规则。

---

## 3.1 核心原则

采用：

# Allowlist-first

而不是：

# Upload-everything-then-hide

即：

```text
完整私人文章库
        │
        ▼
本地内容审查
        │
        ├── EXCLUDED
        │      └── 永不上传网站
        │
        ├── REVIEW
        │      └── 人工确认
        │
        ▼
      PUBLIC
        │
        ▼
Moriaty Library
```

---

# 4. 必须排除的网站内容

以下内容原则上不得进入网站生产系统。

## 4.1 日记

包括：

- Diary
- Daily Notes
- 私人日志
- 日常记录
- 情绪记录
- 私人事件流水

无论是否计划“设为仅自己可见”，都不上传。

---

## 4.2 年度计划

包括：

- 年度个人目标
- 学习计划
- 工作计划
- 财务计划
- 私人行动计划
- 年度规划

---

## 4.3 年度总结 / 年度报告

包括含有：

- 私人经历
- 个人关系
- 私人行程
- 个人财务
- 未公开项目
- 学校 / 工作内部信息

的年度报告。

---

## 4.4 私人通信

包括：

- 私人来信
- 私人回信
- 聊天记录
- 邮件
- 私信
- 私人关系材料

原则上全部进入 REVIEW 或 EXCLUDED。

---

## 4.5 个人敏感资料

包括：

- 地址
- 手机号
- 邮箱
- 身份证件
- 学号
- 工号
- 账号
- 密钥
- 密码
- 精确位置
- 私人健康信息
- 个人财务信息
- 尚未公开的商业资料
- 未公开合同
- 第三方个人身份信息

全部排除。

---

# 5. 网站内容状态

内容在“进入网站之前”只有三种状态：

## PUBLIC

确认允许公开。

可以：

- 入库
- 搜索
- 建立标签
- 进入星图
- 出现在书架

---

## REVIEW

疑似包含个人信息。

必须人工检查。

在确认前：

**不得进入生产数据库。**

---

## EXCLUDED

确认不允许公开。

不会：

- 上传服务器
- 建立数据库记录
- 出现在后台
- 进入全文索引
- 进入星图
- 进入统计
- 进入网站备份

---

# 6. 六大书架信息架构

建议使用以下六个一级书架。

---

## I · 思想 · 认知 · 自我

**THOUGHT & SELF**

内容：

- 哲学
- 认知
- 自我
- 心理
- 方法论
- 人生观察
- 价值问题

---

## II · 社会 · 文化 · 舆论

**SOCIETY & CULTURE**

内容：

- 社会观察
- 社会结构
- 性别议题
- 舆论研究
- 文化研究
- 新媒介
- 社会心理

---

## III · 政策 · 经济 · 治理

**POLICY & ECONOMY**

内容：

- 政策分析
- 宏观经济
- 公共治理
- 财政
- 教育治理
- 制度研究

---

## IV · 科技 · 数据 · 医疗

**TECHNOLOGY & RESEARCH**

内容：

- AI
- 软件
- 技术趋势
- 数据交易
- 医疗数据
- 医学研究
- 商业研究
- 技术项目

---

## V · 文学 · 创作

**LITERATURE & CREATION**

内容：

- 诗歌
- 小说
- 散文
- 文艺评论
- 影视评论
- 创作实验

---

## VI · 档案 · 学习 · 杂记

**ARCHIVE & NOTES**

注意：

**这里不是私人档案库。**

仅允许放入：

- 可公开的学习笔记
- 可公开的资料整理
- 公开性质的旧稿
- 不适合前五类但不存在隐私风险的随笔
- 公开研究材料

明确禁止：

- 日记
- 年度计划
- 年度报告
- 私人书信
- 个人敏感记录

---

# 7. 六边形空间结构

六个书架位于规则六边形六个面。

```text
                    I
              THOUGHT & SELF

             ╱              ╲

    VI                              II
ARCHIVE & NOTES                SOCIETY & CULTURE


    V                               III
LITERATURE                   POLICY & ECONOMY

             ╲              ╱

                    IV
            TECHNOLOGY & RESEARCH
```

每一个面之间：

```text
360° / 6 = 60°
```

对应角度：

```text
Shelf I      0°
Shelf II    60°
Shelf III  120°
Shelf IV   180°
Shelf V    240°
Shelf VI   300°
```

---

# 8. 页面基本交互

支持：

- 鼠标水平拖动
- 触控板左右滑动
- 鼠标滚轮
- 手机 Swipe
- 键盘方向键
- 左右导航按钮

交互过程：

```text
Drag
 ↓
Velocity
 ↓
Inertia
 ↓
Deceleration
 ↓
Snap to nearest 60°
```

用户松手之后，自动吸附最近的书架。

---

# 9. 首页视觉

背景：

```text
#000000
```

必须是真正纯黑。

不建议使用：

```text
#111111
#121212
#181818
```

作为主背景。

---

# 10. 星空系统

星空分为三层。

## Layer 1 — Stars

数量：

```text
300–600
```

透明度：

```text
0.08 – 0.18
```

少量高亮恒星：

```text
0.20 – 0.30
```

---

## Layer 2 — Constellation

星座连线透明度：

```text
0.03 – 0.08
```

视觉应更接近：

- 古典星图
- 天文学图册
- 天球图

而不是：

- Cyberpunk HUD
- 科幻仪表盘

---

## Layer 3 — Nebula

非常弱的：

- 噪点
- 暗雾
- 星云
- 局部光晕

透明度：

```text
< 5%
```

---

# 11. 书架视觉系统

材质：

**Walnut / 胡桃木**

建议色彩：

| 类型 | 色值 |
|---|---|
| 极暗木纹 | `#1D120D` |
| 深胡桃木 | `#382219` |
| 主胡桃木 | `#4B2E21` |
| 高光 | `#674532` |
| 木边 | `#806047` |

---

# 12. 黄铜元素

书架分类牌可以采用：

```text
#A58A58
```

或类似低饱和暗金。

禁止：

```text
#FFD700
```

这样的高饱和纯金。

---

# 13. 单书架结构

推荐：

```text
4 层
```

单面容量建议：

```text
30–40 本
```

不要强制填满。

留白是设计的一部分。

示意：

```text
╔══════════════════════════════╗
║      SOCIETY & CULTURE       ║
║                              ║
║ ██ █ ███ ██ ███ █ ███       ║
╠══════════════════════════════╣
║ █ ███ ██ ██ ███ ██ █        ║
╠══════════════════════════════╣
║ ██ ██ █████ █ ██ ███        ║
╠══════════════════════════════╣
║ █ ████ ██ █ ███ █ ██        ║
╚══════════════════════════════╝
```

---

# 14. 书籍视觉系统

每篇文章是一本文献对象。

必须具备：

```text
title
spine_title
shelf
type
tags
written_at
published_at
word_count
reading_time
color_seed
height_seed
width
```

---

# 15. 书脊尺寸

书高：

```text
170px – 235px
```

书宽：

```text
22px – 56px
```

文章长度与书厚度弱相关。

推荐使用：

```text
log(word_count)
```

而不是线性关系。

避免长篇文章出现极端宽度。

---

# 16. 书籍颜色

不能使用真正随机 RGB。

采用：

# Seeded Random Palette

以：

```text
article.id
```

或：

```text
slug
```

作为随机种子。

同一篇文章每次访问必须保持相同颜色。

---

# 17. 推荐书籍色域

可使用：

- 深酒红
- 暗红棕
- 栗色
- 暗赭
- 墨绿
- 森林绿
- 深蓝
- 海军蓝
- 蓝灰
- 暗紫
- 梅紫
- 深灰
- 灰褐

HSL 推荐范围：

```text
Saturation: 22% – 48%
Lightness:  22% – 40%
```

禁止：

- 荧光
- 高饱和红
- 高饱和蓝
- 鲜艳粉色
- 纯黄色
- 彩虹渐变

---

# 18. 书脊排版

中文：

```css
writing-mode: vertical-rl;
text-orientation: upright;
```

字体推荐：

- 思源宋体
- Noto Serif CJK SC

英文：

允许旋转 90°。

---

# 19. 书脊短标题

由于很多文章标题较长，需要：

```text
spine_title
```

例如：

完整标题：

```text
山西订婚强奸案舆情爆发，一条曲线讲明白极端性别主义的演变与未来
```

书脊可显示：

```text
订婚案舆情
```

完整标题仅在 Hover 信息卡中出现。

---

# 20. Hover 交互

普通状态：

书与其他书平齐。

Hover：

```css
transform:
    translateZ(32px)
    translateY(-4px)
    scale(1.06);
```

亮度：

```text
+20% ～ 30%
```

增加轻微暖光。

动画：

```text
180–240ms
```

缓动：

```text
cubic-bezier(.2,.8,.2,1)
```

---

# 21. Hover 信息卡

Hover 后显示：

```text
工业帝国

SOCIAL THEORY
2026

社会结构 / 工业化 / 教育

7,000 字
18 MIN

OPEN BOOK →
```

视觉：

**Old Library Index Card**

而不是传统 Tooltip。

---

# 22. 点击一本书

点击书籍后执行：

# Pull Book Animation

阶段：

1. 书脊亮起；
2. 书向前抽出；
3. 周围书籍变暗；
4. 书架背景失焦；
5. 书旋转；
6. 封面朝向用户；
7. 放大；
8. 展开；
9. 进入阅读器。

建议总时长：

```text
650–900ms
```

---

# 23. Reduced Motion

必须支持：

```css
@media (prefers-reduced-motion: reduce)
```

启用后：

- 禁用复杂旋转；
- 禁用抽书动画；
- 直接 Fade；
- 保留功能。

---

# 24. 阅读器

名称建议：

# Archive Reader

阅读页不强制模拟实体书双页。

原因：

长篇中文文章需要良好阅读效率。

---

# 25. 阅读模式

提供两种主题。

## NIGHT

```text
background: #050505
text:       #D8D2C7
```

---

## PAPER

```text
background: #E8E0D1
text:       #24211D
```

---

# 26. 阅读正文尺寸

最大宽度：

```text
720–820px
```

中文正文：

```text
line-height: 1.8–2.0
```

字体：

```text
16–19px
```

桌面端推荐：

```text
18px
```

---

# 27. 阅读页结构

```text
← BACK TO LIBRARY

II / SOCIETY & CULTURE


工业帝国

Li Moriaty
2026.02.16

社会结构 · 工业化 · 教育

────────────────────

正文正文正文正文正文正文
正文正文正文正文正文正文

────────────────────

← PREVIOUS BOOK

RETURN TO SHELF

NEXT BOOK →
```

---

# 28. 返回书架

从阅读器返回时必须保存：

- 当前书架
- 六边形角度
- 书架层级
- 当前滚动位置

避免用户返回首页之后重新定位。

---

# 29. 搜索系统

右上角：

```text
⌕ SEARCH
```

点击后：

- 背景变暗；
- 搜索界面居中；
- 支持全文搜索。

---

# 30. 搜索字段

至少搜索：

- title
- spine_title
- excerpt
- tags
- article_type
- full_text

---

# 31. Index 模式

艺术化首页不能取代传统索引。

因此需要：

```text
INDEX
```

点击后：

```text
ALL VOLUMES

XXX BOOKS
2023—2026
```

允许按照：

- Shelf
- Year
- Tag
- Type
- Title

浏览。

原则：

> **书架用于探索，Index 用于寻找。**

---

# 32. 顶部导航

首页尽量克制。

左：

```text
MORIATY LIBRARY
```

右：

```text
SEARCH
INDEX
```

不推荐传统：

```text
首页 / 关于 / 博客 / 联系
```

---

# 33. 底部分类导航

```text
● ○ ○ ○ ○ ○

THOUGHT & SELF
思想 · 认知 · 自我
```

随着旋转更新。

---

# 34. 技术路线

推荐：

## Framework

```text
Next.js
```

## UI

```text
React
TypeScript
```

## Animation

```text
Motion / Framer Motion
```

## Gesture

```text
@use-gesture/react
```

## 3D

第一阶段：

```text
CSS 3D Transform
```

而不是 Three.js。

---

# 35. 为什么不直接用 Three.js 构建全部书架

CSS 3D 优势：

- 书名仍是 DOM；
- SEO 更好；
- 文本清晰；
- Accessibility 更好；
- 交互实现简单；
- 调试方便；
- 移动端性能更容易控制。

Three.js 建议只用于后续：

**思想星图。**

---

# 36. CSS 3D 参数建议

```text
perspective:
1000–1400px

hex radius:
520–920px

shelf width:
min(82vw, 1100px)

shelf height:
min(72vh, 760px)
```

核心容器：

```css
transform-style: preserve-3d;
```

---

# 37. 后端架构

推荐：

```text
Next.js
    │
    ├── PostgreSQL
    │
    ├── Object Storage
    │
    └── Admin CMS
```

---

# 38. Article 数据结构

示例：

```ts
Article {
  id: string
  slug: string

  title: string
  spineTitle: string
  subtitle?: string
  excerpt?: string

  contentMarkdown: string

  shelfId: string
  articleType: ArticleType

  tags: Tag[]

  writtenAt?: Date
  publishedAt?: Date

  wordCount: number
  readingTime: number

  status: "draft" | "published"

  featured: boolean
  shelfOrder: number

  spineColorSeed: string
  bookHeightSeed: string
  bookWidth: number

  createdAt: Date
  updatedAt: Date
}
```

---

# 39. ArticleVersion

```ts
ArticleVersion {
  id: string
  articleId: string

  sourceFilename: string
  sourceFormat: string
  sourceHash: string

  versionNumber: number

  contentMarkdown: string

  importedAt: Date
}
```

---

# 40. 版本策略

不同导出格式但内容一致的文件：

```text
XXX.docx.md
XXX.md
```

不应该显示成两本书。

而应该：

```text
XXX

v1
 └─ DOCX Export

v2
 └─ Markdown
```

---

# 41. 重复检测

导入程序需要计算：

```text
SHA-256
```

同时进行：

- exact duplicate detection
- normalized text comparison
- title similarity
- semantic similarity

分类：

```text
EXACT_DUPLICATE

VERSION_VARIANT

UNIQUE
```

---

# 42. 图片处理

现有 Markdown 中如果存在：

```text
data:image/...;base64
```

不能直接长期保留。

导入时执行：

```text
Base64
 ↓
Decode
 ↓
Image File
 ↓
WebP / PNG
 ↓
Object Storage
 ↓
Replace Markdown URL
```

---

# 43. 图片目录示例

```text
/articles/
    industrial-empire/
        img-001.webp
        img-002.webp
```

---

# 44. 内容导入管线

完整流程：

```text
私人原始文件
      │
      ▼
Privacy Scanner
      │
 ┌────┴────┐
 │         │
 ▼         ▼
EXCLUDED  REVIEW
           │
           ▼
      Manual Review
           │
           ▼
         PUBLIC
           │
           ▼
Markdown Parser
           │
           ▼
Duplicate Detector
           │
           ▼
Version Resolver
           │
           ▼
Asset Extractor
           │
           ▼
Metadata Generator
           │
           ▼
Human Approval
           │
           ▼
Production Database
```

---

# 45. 自动生成的 Metadata

允许程序自动生成：

- 字数
- 阅读时间
- slug
- 推荐标签
- 摘要
- 文章类型候选
- 分类候选

但最终：

**一级分类和隐私判断由人工确认。**

---

# 46. 文章类型系统

建议：

```text
ESSAY
THEORY
REPORT
NOTE
POETRY
FICTION
REVIEW
PROJECT
SOURCE
```

不要加入：

```text
DIARY
PRIVATE_LETTER
PERSONAL_PLAN
```

因为这些类型根本不应进入网站。

---

# 47. Tag 系统

一级分类只有六个。

复杂关系通过 Tag 描述。

例如：

```text
社会结构
工业化
教育
治理
现代化
AI
数据
医疗
媒体
认知
哲学
```

---

# 48. Tag 与星图

未来：

```text
共同 Tag 越多
      ↓
文章关系越强
      ↓
星图距离越近
```

例如：

```text
工业帝国
   │
   ├── 社会结构
   ├── 教育
   └── 工业化
```

可与同类文章形成星座。

---

# 49. 星图数据模型

后续可以建立：

```ts
ArticleRelation {
  sourceArticleId: string
  targetArticleId: string

  relationType:
    | "tag"
    | "citation"
    | "series"
    | "semantic"

  weight: number
}
```

---

# 50. 后台 CMS

路径：

```text
/admin
```

功能：

- 新建文章
- 上传 Markdown
- 批量上传
- 编辑标题
- 编辑 spine_title
- 设置 Shelf
- 编辑 Tag
- 设置 Type
- 设置日期
- 修改排序
- 自定义书脊颜色
- 版本管理
- 图片管理
- 预览
- 发布

---

# 51. 后台不应该包含私人文件

这一点非常重要。

后台 CMS 不等于私人文件库。

**EXCLUDED 文件连后台都不能进入。**

---

# 52. 移动端设计

移动端仍然保持六边形理念。

但是：

- 透视降低；
- 只突出当前书架；
- Swipe 切换；
- 自动吸附。

---

# 53. 移动端书籍交互

由于没有 Hover：

第一次点击：

```text
Select Book
```

显示信息。

第二次点击：

```text
Open Book
```

---

# 54. 移动端阅读器

文章阅读器使用传统纵向阅读。

不要在手机上模拟双页书。

---

# 55. 性能策略

首页目标：

- 星星 ≤ 600；
- 星空使用 Canvas；
- 不为每颗星建立 DOM；
- 非当前书架降低细节；
- 图片 Lazy Load；
- 纹理压缩；
- 字体 Subset；
- 文章正文 SSR。

---

# 56. 首屏性能

目标：

```text
LCP < 2.5 s
CLS < 0.1
INP < 200 ms
```

在合理网络环境下作为目标。

---

# 57. Accessibility

支持：

```text
Tab
Enter
Esc
←
→
```

每本书：

```html
aria-label="文章标题"
```

---

# 58. SEO

文章使用独立 URL。

例如：

```text
/book/industrial-empire
```

书架：

```text
/library/society
```

---

# 59. Metadata

每篇公开文章包含：

```text
title
description
author
datePublished
dateModified
keywords
canonical
OpenGraph
```

---

# 60. Sitemap

自动生成：

```text
/sitemap.xml
```

仅包含：

**PUBLIC 已发布文章。**

---

# 61. robots

不得索引：

```text
/admin
/api/internal
```

不存在任何私人文章 URL。

---

# 62. 推荐项目目录

```text
moriaty-library/
│
├── app/
│   ├── page.tsx
│   │
│   ├── library/
│   │   └── [shelf]/
│   │
│   ├── book/
│   │   └── [slug]/
│   │
│   ├── index/
│   │
│   ├── search/
│   │
│   ├── admin/
│   │
│   └── api/
│
├── components/
│   ├── library/
│   │   ├── HexLibrary.tsx
│   │   ├── Bookshelf.tsx
│   │   ├── ShelfLabel.tsx
│   │   ├── Book.tsx
│   │   ├── BookSpine.tsx
│   │   └── BookTooltip.tsx
│   │
│   ├── background/
│   │   ├── StarField.tsx
│   │   └── Constellation.tsx
│   │
│   ├── reader/
│   │   └── ArticleReader.tsx
│   │
│   └── search/
│
├── lib/
│   ├── articles/
│   ├── privacy/
│   ├── import/
│   ├── color/
│   ├── search/
│   └── db/
│
├── prisma/
│   └── schema.prisma
│
├── public/
│   ├── texture/
│   └── fonts/
│
└── scripts/
    ├── import-articles.ts
    ├── detect-private.ts
    ├── detect-duplicates.ts
    └── migrate-assets.ts
```

---

# 63. Design Tokens

```css
:root {
  --black: #000000;

  --paper: #E8E0D1;
  --text-night: #D8D2C7;
  --text-dark: #24211D;

  --walnut-900: #1D120D;
  --walnut-800: #382219;
  --walnut-700: #4B2E21;
  --walnut-500: #674532;
  --walnut-300: #806047;

  --brass: #A58A58;
}
```

---

# 64. 字体体系

建议：

## Logo / 英文标题

Serif：

- EB Garamond
- Cormorant Garamond
- Libre Baskerville

## 中文书名 / 正文

- 思源宋体
- Noto Serif CJK SC

## UI

- Inter
- system-ui

---

# 65. 动画设计原则

所有动画遵循：

```text
Slow enough to feel physical
Fast enough to remain useful
```

即：

**有物理感，但不拖慢操作。**

---

# 66. 禁止的视觉方向

不要：

- Cyberpunk
- Neon
- Glassmorphism
- 彩虹色
- 大面积渐变
- 科幻 HUD
- 大量悬浮按钮
- 卡片瀑布流
- 博客模板感
- 过度拟真 3D
- 游戏化 UI

---

# 67. 推荐视觉风格

关键词：

```text
Celestial Library

Walnut Archive

Astronomical Atlas

Old University Library

Private Study

Museum Archive

Modern Minimalism
```

---

# 68. 页面首次进入

推荐流程：

```text
0 ms
Pure Black

200 ms
Stars Fade In

450 ms
Shelf Silhouette Appears

700 ms
Walnut Texture Appears

900 ms
Books Fade In

1100 ms
Shelf Label Appears

1300 ms
Navigation Appears
```

注意：

不做长 Intro。

用户应在：

```text
< 1.5 s
```

左右获得可操作界面。

---

# 69. 首页文案

建议极简：

```text
MORIATY LIBRARY
Archive of Thought
```

底部：

```text
XXX VOLUMES · 6 COLLECTIONS
```

具体书籍数量由隐私审查完成后自动统计。

---

# 70. 关于页面

如果需要 About，不要放首页导航首位。

可以通过：

```text
MORIATY LIBRARY
```

Logo 菜单进入。

内容只介绍：

- 图书馆理念
- 作者简介
- 内容范围
- 更新说明

不得披露私人信息。

---

# 71. 内容统计

允许公开统计：

```text
Books
Collections
Words
Years
Tags
```

例如：

```text
112 BOOKS
6 COLLECTIONS
420K WORDS
2023—2026
```

数字应从生产数据库自动计算。

---

# 72. 隐私扫描规则

本地脚本可进行初筛。

关键词：

```text
手机号
身份证
邮箱
地址
学号
工号
密码
token
secret
api key
住址
病历
日记
计划
年度报告
来信
回信
```

但自动扫描不能替代人工判断。

---

# 73. 第三方隐私

特别需要检测：

- 他人姓名
- 联系方式
- 私人对话
- 未公开身份信息
- 私人评价
- 私人关系信息

即使不是作者本人隐私，也不能直接公开。

---

# 74. 内容清洗

公开文章可能仍需要：

```text
姓名 → 匿名
单位内部编号 → 删除
私人联系方式 → 删除
私人日期地点 → 泛化
截图敏感信息 → 打码
```

完成后才能进入 PUBLIC。

---

# 75. 发布流程

```text
Local Draft

↓

Privacy Review

↓

Content Cleanup

↓

Metadata Review

↓

Preview

↓

Publish
```

---

# 76. 永不自动发布

ZIP 批量导入后：

**所有文章默认 Draft。**

系统不能自动：

```text
import → publish
```

必须：

```text
import → review → approve → publish
```

---

# 77. 开发阶段

## Phase 0 — 内容治理

完成：

- 隐私扫描；
- 日记等排除；
- 私人书信排除或人工审查；
- 重复文件识别；
- 版本合并；
- 公开内容 Allowlist。

---

## Phase 1 — 数据层

完成：

- PostgreSQL；
- Article；
- ArticleVersion；
- Shelf；
- Tag；
- Asset；
- Importer。

---

## Phase 2 — 基础阅读网站

先实现：

- Article 页面；
- Index；
- Search；
- SEO。

确保内容系统稳定。

---

## Phase 3 — 六边形书架

实现：

- CSS 3D；
- 六面书架；
- Mouse Drag；
- Touch Swipe；
- Snap；
- Book Hover。

---

## Phase 4 — 高级动画

实现：

- Pull Book；
- Reader Transition；
- Return Animation；
- Shelf State Restore。

---

## Phase 5 — Star Map

实现：

- Article Nodes；
- Tag Relationship；
- Semantic Relationship；
- Constellations。

---

## Phase 6 — 管理后台

完善：

- 上传；
- 版本；
- 分类；
- 标签；
- 发布；
- 预览。

---

# 78. MVP

第一版必须具备：

- 六个书架；
- 黑色背景；
- 星空；
- 胡桃木；
- 随机稳定书脊颜色；
- Hover；
- 六边形旋转；
- Article Reader；
- Search；
- Index；
- Markdown 导入；
- 隐私 Allowlist；
- Responsive；
- SEO。

---

# 79. MVP 不需要

第一版暂不需要：

- 登录系统；
- 社交账号；
- 评论；
- 点赞；
- AI 聊天；
- 用户收藏；
- 真 3D 模型；
- WebGL 书架；
- 动态星座算法；
- 推荐系统。

---

# 80. 第二阶段扩展

可以增加：

## Constellation View

点击：

```text
CONSTELLATION
```

六个书架退入黑暗。

文章变为星星。

形成完整思想地图。

---

# 81. Timeline View

提供：

```text
TIME
```

查看文章随时间的发展。

用于观察：

- 思想演变
- 主题变化
- 写作密度

---

# 82. Series

支持文章系列。

例如：

```text
DATA SERIES

Volume I
Volume II
Volume III
```

书脊使用统一视觉。

---

# 83. Citation

未来文章之间可以显式建立：

```text
引用
回应
延伸
修订
前作
后续
```

关系。

---

# 84. 推荐系统

后期可以根据：

- Tag
- Semantic Embedding
- 引用关系

推荐：

```text
RELATED BOOKS
```

---

# 85. 系统安全

生产服务器只保存：

**已通过公开审查的数据。**

因此即使发生：

- 搜索 API Bug
- 权限 Bug
- 索引泄露
- 数据备份泄露

风险仍被显著降低。

核心理念：

# Data Minimization

---

# 86. 备份策略

生产数据库：

仅公开文章。

私人完整文章库：

仅保留在用户自己的安全存储环境。

两者物理隔离。

---

# 87. 部署建议

可采用：

```text
Vercel
+
PostgreSQL
+
S3 Compatible Storage
```

或：

```text
Self-hosted VPS
+
Next.js
+
PostgreSQL
+
MinIO
```

---

# 88. 推荐第一版架构

如果追求开发速度：

```text
Vercel
Supabase PostgreSQL
Cloudflare R2
Next.js
```

如果追求长期完全控制：

```text
VPS
Docker
Next.js
PostgreSQL
MinIO
Nginx
```

---

# 89. 验收标准：内容

上线前必须满足：

- [ ] 所有日记被排除；
- [ ] 所有年度个人计划被排除；
- [ ] 所有含隐私的年度报告被排除；
- [ ] 私人通信已经人工审查；
- [ ] 不存在电话、地址、邮箱等敏感信息；
- [ ] 不存在 API Key / Token / Password；
- [ ] 所有公开文章经过 Allowlist；
- [ ] 重复文件已合并。

---

# 90. 验收标准：视觉

- [ ] 背景为纯黑；
- [ ] 星空不抢主体；
- [ ] 书架为胡桃木；
- [ ] 六书架组成明确六边形；
- [ ] 书籍颜色低饱和；
- [ ] 没有彩虹感；
- [ ] 没有 Cyberpunk 感；
- [ ] 当前书架视觉层级明确。

---

# 91. 验收标准：交互

- [ ] 鼠标可拖动；
- [ ] Trackpad 可切换；
- [ ] 手机可 Swipe；
- [ ] 键盘 ← → 可切换；
- [ ] 松手自动吸附 60°；
- [ ] Hover 书籍突出；
- [ ] 点击可以打开文章；
- [ ] 返回恢复原书架。

---

# 92. 验收标准：搜索

- [ ] 可搜标题；
- [ ] 可搜正文；
- [ ] 可搜标签；
- [ ] 可按书架过滤；
- [ ] 可按年份过滤；
- [ ] 可按类型过滤。

---

# 93. 验收标准：性能

- [ ] 手机端不卡顿；
- [ ] 旋转保持稳定；
- [ ] 星空不大量使用 DOM；
- [ ] 图片 Lazy Load；
- [ ] 非当前书架降低渲染负担。

---

# 94. 验收标准：隐私

最重要：

> **Production 中不得存在任何被判定为 EXCLUDED 的源文件或正文。**

不仅前台看不到。

而是：

**服务器根本不存在。**

---

# 95. 项目最终体验

用户进入网站。

看到：

```text
MORIATY LIBRARY
```

黑暗中逐渐出现星星。

胡桃木书架从黑暗中浮现。

鼠标横向拖动。

书架绕用户旋转。

当前分类：

```text
SOCIETY & CULTURE
社会 · 文化 · 舆论
```

用户把鼠标移动到某本书。

书脊：

- 提亮；
- 前移；
- 稍微放大。

索引卡出现。

点击。

书被抽出。

世界逐渐变暗。

书在屏幕中央打开。

文章出现。

阅读完成后：

```text
RETURN TO SHELF
```

书重新回到它原本的位置。

---

# 96. 项目一句话定义

> **Moriaty Library 是一座漂浮于黑色宇宙中的六边形数字图书馆，用实体书架的空间隐喻组织经过隐私筛选的个人公开文章，并最终通过星图呈现文章之间的思想关系。**

---

# 97. 最终设计原则

整个项目最终应始终遵守以下原则：

### 1. Content First
视觉必须服务于文章。

### 2. Privacy by Architecture
隐私不是“隐藏”，而是“根本不上传”。

### 3. Spatial, Not Gimmicky
六边形必须真正帮助理解内容结构。

### 4. Elegant, Not Flashy
高级感来自克制，而不是特效数量。

### 5. Searchable
艺术界面不能牺牲信息检索效率。

### 6. Durable
设计必须能够支撑未来数百甚至上千篇文章。

### 7. Deterministic
同一本书的位置、颜色和视觉属性保持稳定。

### 8. Human-curated
AI 可以辅助分类，但最终公开范围必须由人工决定。

---

# 98. 推荐下一步

正式进入开发前，按顺序完成：

```text
01
对全部源文件进行 Privacy Audit

02
生成 PUBLIC Allowlist

03
完成 Duplicate / Version Merge

04
生成 canonical article manifest

05
确认六个 Shelf 的文章分布

06
为长标题确定 spine_title

07
建立 Tags

08
输出 articles.json / database seed

09
建立首页低保真 Wireframe

10
开始 Next.js 项目
```

其中第 1–4 步应优先于任何前端开发。

因为：

> **先确定哪些内容真正属于 Moriaty Library，再决定这些书应该如何摆上书架。**

---

**Document Version:** 1.1  
**Project:** MORIATY LIBRARY  
**Design Direction:** Hexagonal Celestial Library  
**Core Privacy Model:** Allowlist-first / Data Minimization

---

# 99. 网页文章名称规整

原始文件名作为来源记录保留；写入网页时，必须生成独立的规范文章标题与 URL slug，不直接把来源文件名当成展示标题。

- 优先采用文章正文中的明确标题；没有标题时，才从文件名生成候选标题。
- 规范化 Unicode、空白和标点；移除导出副本后缀、末尾的 Notion/数据库 ID 等非标题噪声。
- 可可靠解码的乱码应修复后再进入网页；包含替换字符、疑似错误编码或无法可靠还原的名称必须进入人工 REVIEW，不得把乱码直接发布。
- URL slug 应使用稳定、URL 安全的规范名称或稳定 ID 生成，并检查冲突；标题修改不得静默改变已发布文章的 URL。
- ArticleVersion.sourceFilename 继续保存原始文件名，以便追溯来源；展示名、spine_title 和 slug 独立管理并经人工确认。

名称规整不代表内容审核通过，也不能改变 PUBLIC allowlist 与人工发布确认要求。
