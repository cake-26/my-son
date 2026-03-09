# 宝宝成长记录 (my-son)

新生儿成长记录离线 PWA 应用。完全本地存储，无服务器依赖。

## 快速参考

- **线上地址**: https://my-son.pages.dev
- **GitHub**: https://github.com/cake-26/my-son
- **技术栈**: React 18 + TypeScript + Vite 6 + MUI 7 + TailwindCSS 3 + Dexie 4
- **路由**: react-router-dom HashRouter
- **存储**: IndexedDB (Dexie ORM)
- **部署**: Cloudflare Pages (手动 `wrangler pages deploy dist`)

## 项目结构

```
src/
├── main.tsx                    # 入口
├── App.tsx                     # HashRouter + lazy 路由
├── index.css                   # Tailwind + CSS 变量
├── db/
│   ├── index.ts                # Dexie 数据库定义 (10 张表)
│   └── backup.ts               # JSON 导出/导入
├── lib/
│   ├── theme.ts                # MUI 主题 (暖橙色)
│   ├── constants.ts            # 枚举常量
│   ├── daily-sync.ts           # 事件→每日汇总同步
│   └── utils.ts                # cn() 工具函数
├── components/
│   ├── Layout.tsx              # ThemeProvider + TabBar + Toaster
│   ├── TabBar.tsx              # MUI BottomNavigation (4 tab)
│   ├── PageHeader.tsx          # 页面标题栏
│   └── EmptyState.tsx          # 空状态占位
└── pages/                      # 23 个页面 (列表 + 表单 + 总览)
    ├── Dashboard.tsx            # 首页仪表盘
    ├── Records.tsx              # 事件记录总览
    ├── DailyLog.tsx             # 每日记录列表
    ├── DailyLogForm.tsx         # 每日记录表单（体温/黄疸/沐浴/喂养/排泄等）
    ├── DailyOverview.tsx        # 每日总览只读页（/daily-log/:date）
    ├── FeedForm.tsx / SleepForm.tsx / DiaperForm.tsx
    ├── Growth.tsx / GrowthForm.tsx
    ├── Vaccines.tsx / VaccineForm.tsx
    ├── Milestones.tsx / MilestoneForm.tsx
    ├── Journal.tsx / JournalForm.tsx
    ├── Illness.tsx / IllnessForm.tsx
    ├── Profile.tsx              # 宝宝信息 + 导航入口
    └── Backup.tsx               # 备份管理
```

## 开发命令

```bash
npm run dev       # 启动开发服务器
npm run build     # 生产构建 (含 PWA Service Worker)
npm run preview   # 预览生产版本
```

## 部署命令

```bash
npm run build
wrangler pages deploy dist --project-name my-son --commit-message "deploy"
```

## 代码规范

- **UI 组件**: 统一使用 `@mui/material`，不使用 shadcn/ui
- **图标**: 统一使用 `lucide-react`，不使用 `@mui/icons-material`
- **布局**: Tailwind CSS 用于布局/间距/颜色 (`flex`, `grid`, `px-4`, `gap-3` 等)
- **表单**: `react-hook-form` + `zod` + `@hookform/resolvers/zod`
- **Toast**: `sonner` (Toaster 在 Layout 中)
- **数据查询**: `useLiveQuery` from `dexie-react-hooks` (响应式)
- **页面导出**: 所有页面使用 `export default function` (配合 lazy import)
- **路径别名**: `@/` 映射到 `src/`

## 数据库表 (Dexie, IndexedDB)

| 表 | 主键 | 用途 |
|---|---|---|
| profiles | ++id | 宝宝信息 (单条) |
| dailyLogs | &date | 每日汇总 (YYYY-MM-DD) |
| feedEvents | ++id, datetime | 喂养事件 |
| sleepEvents | ++id, start, end | 睡眠事件 |
| diaperEvents | ++id, datetime | 排泄事件 |
| growthRecords | ++id, date | 体重/身长/头围 |
| vaccineRecords | ++id, date | 疫苗接种 |
| milestones | ++id, date | 里程碑 |
| journalEntries | ++id, datetime | 育儿心得 |
| illnessRecords | ++id, date | 生病用药 (v2) |

### DailyLog 扩展字段（手动填写）

除自动汇总字段外，DailyLog 还包含手填可选字段：

| 字段 | 说明 |
|------|------|
| tempMorning / tempAfternoon | 体温上午/下午 (°C) |
| jaundiceAM/PMForehead/Face/Chest | 黄疸早晚额头/脸/胸 (mg/dL) |
| bath | 沐浴方式：游泳/洗澡/'' |
| weightKg | 当日体重 (kg) |
| sleepQuality | 睡眠质量：佳/一般/'' |
| formulaMl / formulaTimes | 奶粉量(ml) / 次数 |
| breastMilkMl / breastMilkTimes | 母乳量(ml) / 次数 |

## 关键机制

### 事件→每日汇总同步
保存/删除 FeedEvent、SleepEvent、DiaperEvent 后自动调用 `syncDailyLog(date)` 更新对应日期的 DailyLog 汇总数据。

### 备份格式
JSON 文件 `baby-log-YYYYMMDD-HHmm.json`，含 `schemaVersion` 和 `exportedAt`。导入为覆盖式。

## 已知问题

暂无

## 新增页面模式

添加新功能页面的标准步骤:
1. 在 `src/db/index.ts` 添加接口和表定义
2. 在 `src/pages/` 创建列表页 + 表单页 (参考 Growth.tsx / GrowthForm.tsx)
3. 在 `src/App.tsx` 添加路由 (lazy import)
4. 在 `src/pages/Profile.tsx` 的 NAV_LINKS 添加入口
5. 如需备份，更新 `src/db/backup.ts`
