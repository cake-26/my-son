# 产品文档 — 宝宝成长记录

## 产品定位

面向新生儿父母的**离线优先**成长记录工具。通过 PWA 技术实现"添加到主屏幕"后像原生 App 一样使用，所有数据存储在浏览器本地 IndexedDB 中，无需注册、无需联网。

## 目标用户

- 新生儿（0-12 月）的父母
- 需要在碎片化时间快速记录喂养、睡眠、排泄等数据
- 希望回顾和分析宝宝的成长趋势
- 注重数据隐私，不愿将宝宝数据上传服务器

## 功能模块

### 1. Dashboard 首页 (`/`)

首页作为信息枢纽，一屏展示最重要的数据：

- **宝宝卡片**: 姓名、昵称、出生日期、出生第 X 天。未设置时展示引导卡片
- **今日概览**: 2×2 网格统计卡 — 奶量(ml)、喂奶(次)、便便(次)、睡眠(小时)
- **快捷操作**: 横向滚动按钮 — 记录今天、喂一次奶、导出备份
- **最近 7 天**: 日志卡片列表，点击进入编辑

### 2. 每日汇总 DailyLog (`/daily-log`)

以日期为主键的汇总视图，字段包括：

| 字段 | 类型 | 说明 |
|------|------|------|
| date | YYYY-MM-DD | 主键 |
| milkTimes | number | 喂奶次数 |
| milkTotalMl | number | 总奶量 ml |
| poopTimes | number | 便便次数 |
| peeTimes | number | 尿尿次数 |
| sleepHours | number | 睡眠小时 |
| note | string | 备注 |
| symptomsTags | string[] | 症状标记 |

**自动汇总**: 喂养/睡眠/排泄事件保存时自动计算并更新对应日期的 DailyLog。

**症状标记选项**: 吐奶、胀气、红屁股、鼻塞、黄疸观察、发热、湿疹、腹泻

### 3. 事件级记录 (`/records`)

事件记录总览页，分三个区域展示今日的喂养、睡眠、排泄事件，每区最多展示 5 条最近记录。

#### 3.1 喂养 FeedEvent (`/feed/new`, `/feed/:id/edit`)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| datetime | datetime-local | 是 | 喂奶时间 |
| type | 母乳/奶粉/混合 | 是 | 喂养类型 |
| amountMl | number | 否 | 奶量 ml |
| durationMin | number | 否 | 时长分钟 |
| side | 左/右/双/无 | 是 | 侧边 |
| spitUp | boolean | 是 | 是否吐奶 |
| burpOk | boolean | 是 | 拍嗝是否成功 |
| note | string | 否 | 备注 |

#### 3.2 睡眠 SleepEvent (`/sleep/new`, `/sleep/:id/edit`)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| start | datetime-local | 是 | 入睡时间 |
| end | datetime-local | 是 | 醒来时间 |
| place | 床/抱/推车/其他 | 是 | 睡觉地点 |
| method | 奶睡/抱睡/自主入睡/其他 | 是 | 入睡方式 |
| note | string | 否 | 备注 |

表单中实时显示计算出的睡眠时长。

#### 3.3 排泄 DiaperEvent (`/diaper/new`, `/diaper/:id/edit`)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| datetime | datetime-local | 是 | 时间 |
| kind | 便/尿 | 是 | 类型 |
| poopTexture | 稀/糊/成形/硬 | 否 | 便便质地 (仅 kind=便 时显示) |
| poopColor | 黄/绿/黑/红 | 否 | 便便颜色 (仅 kind=便 时显示) |
| note | string | 否 | 备注 |

### 4. 成长记录 Growth (`/growth`)

按日期记录体重(kg)、身长(cm)、头围(cm)，至少填写一项。列表按日期倒序展示。

### 5. 疫苗记录 Vaccines (`/vaccines`)

记录接种日期、疫苗名称、接种反应和备注。

### 6. 里程碑 Milestones (`/milestones`)

记录宝宝的"第一次"：日期、标题（如"第一次翻身"）、描述、标签。

### 7. 生病用药 Illness (`/illness`)

记录生病日期、症状、用药、剂量、就诊医生和备注。(v2 新增)

### 8. 育儿心得 Journal (`/journal`)

结构化反思记录：

| 字段 | 说明 |
|------|------|
| title | 标题 |
| tags | 标签（逗号分隔输入） |
| context | 触发场景 — 发生了什么 |
| action | 我做了什么 |
| result | 结果如何 |
| next | 下次怎么做 |
| mood | 心情 (😊😐😢😤😴🥰) |

支持按标题搜索和按标签筛选。

### 9. 个人中心 Profile (`/profile`)

- 宝宝信息管理（姓名、昵称、出生日期/时间、性别）
- 各功能模块导航入口（7 个入口卡片）

### 10. 备份管理 Backup (`/backup`)

- **导出**: 一键导出所有数据为 JSON 文件（`baby-log-YYYYMMDD-HHmm.json`）
- **导入**: 选择 JSON 文件，二次确认后覆盖式导入
- 备份包含 `schemaVersion` 和 `exportedAt` 元数据

## 底部导航

| Tab | 路由 | 图标 | 说明 |
|-----|------|------|------|
| 首页 | `/` | Home | Dashboard 仪表盘 |
| 记录 | `/records` | ClipboardList | 事件记录总览 |
| 成长 | `/growth` | TrendingUp | 成长记录列表 |
| 我的 | `/profile` | User | 个人中心 |

## UX 设计原则

- **移动端优先**: `max-w-md` (448px) 居中，适配手机屏幕
- **iOS 友好**: safe-area padding、standalone 模式、apple-touch-icon
- **快速录入**: 默认填入当前时间，最少必填字段
- **操作确认**: 删除操作使用 Dialog 二次确认
- **即时反馈**: 保存/删除成功后 toast 提示
- **空状态友好**: 每个列表页在无数据时展示图标 + 引导文案 + 操作按钮
- **离线可用**: PWA Service Worker 预缓存所有静态资源

## 数据流

```
用户录入事件 (Feed/Sleep/Diaper)
         │
         ▼
   保存到 IndexedDB
         │
         ▼
  syncDailyLog(date)  ──→  自动更新 DailyLog 汇总
         │
         ▼
  Dashboard useLiveQuery ──→  实时刷新 UI
```
