# 架构文档 — 宝宝成长记录

## 技术栈

| 层 | 技术 | 版本 | 说明 |
|---|---|---|---|
| 框架 | React | 18.3 | 函数组件 + Hooks |
| 语言 | TypeScript | 5.7 | 严格模式 |
| 构建 | Vite | 6.0 | 开发服务器 + 生产构建 |
| UI 组件 | MUI (Material UI) | 7.x | Button, Card, TextField, Dialog 等 |
| 图标 | lucide-react | 0.468 | SVG 图标库 |
| 样式 | TailwindCSS | 3.4 | 布局/间距/颜色工具类 |
| 主题 | @emotion/react + styled | 11.x | MUI 样式引擎 |
| 路由 | react-router-dom | 6.28 | HashRouter (适配静态部署) |
| 数据库 | Dexie (IndexedDB) | 4.0 | 本地持久化 |
| 响应式查询 | dexie-react-hooks | 1.1 | useLiveQuery |
| 表单 | react-hook-form | 7.54 | 非受控表单 |
| 校验 | zod | 3.24 | Schema 校验 |
| Toast | sonner | 1.7 | 轻量 toast 通知 |
| PWA | vite-plugin-pwa | 0.21 | Service Worker + manifest |
| 部署 | Cloudflare Pages | - | 静态站点托管 |

## 架构概览

```
┌─────────────────────────────────────────────────┐
│                    浏览器                        │
│  ┌──────────────────────────────────────────┐   │
│  │           React SPA (HashRouter)          │   │
│  │  ┌──────────────────────────────────┐    │   │
│  │  │         MUI ThemeProvider         │    │   │
│  │  │  ┌──────────┐  ┌──────────────┐  │    │   │
│  │  │  │  TabBar   │  │   Pages      │  │    │   │
│  │  │  │ (4 tabs)  │  │ (21 pages)   │  │    │   │
│  │  │  └──────────┘  └──────┬───────┘  │    │   │
│  │  └───────────────────────┼──────────┘    │   │
│  │                          │               │   │
│  │  ┌───────────────────────▼───────────┐   │   │
│  │  │     Dexie ORM (IndexedDB)         │   │   │
│  │  │  10 tables, useLiveQuery 响应式    │   │   │
│  │  └───────────────────────────────────┘   │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │       Service Worker (Workbox)            │   │
│  │       预缓存所有静态资源，离线可用         │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## 目录结构设计

```
src/
├── db/           # 数据层：Dexie 数据库定义 + 备份逻辑
├── lib/          # 工具层：主题、常量、同步逻辑、className 工具
├── components/   # 共享组件：Layout、TabBar、PageHeader、EmptyState
└── pages/        # 页面层：每个功能一个列表页 + 一个表单页
```

**原则**: 不使用 Redux 等重型状态管理。数据直接通过 `useLiveQuery` 从 IndexedDB 读取，写入后自动触发 UI 更新。

## 数据库设计

### Dexie 版本管理

```typescript
// Version 1: 初始 9 张表
this.version(1).stores({
  profiles:       '++id',
  dailyLogs:      '&date',              // date 为唯一主键
  feedEvents:     '++id, datetime',
  sleepEvents:    '++id, start, end',
  diaperEvents:   '++id, datetime',
  growthRecords:  '++id, date',
  vaccineRecords: '++id, date',
  milestones:     '++id, date',
  journalEntries: '++id, datetime',
});

// Version 2: 新增生病用药表
this.version(2).stores({
  illnessRecords: '++id, date',
});
```

### 表关系

```
profiles (1条)
    │
dailyLogs ──────── feedEvents (N条, 按 datetime 归属日期)
  (按日期)  ├────── sleepEvents (N条, 按 start 归属日期)
            └────── diaperEvents (N条, 按 datetime 归属日期)

growthRecords     (独立, 按日期)
vaccineRecords    (独立, 按日期)
milestones        (独立, 按日期)
journalEntries    (独立, 按 datetime)
illnessRecords    (独立, 按日期)
```

### 每日同步机制 (daily-sync.ts)

```
syncDailyLog(date: string)
  1. 查询当天 feedEvents (datetime.startsWith(date))
  2. 查询当天 diaperEvents (datetime.startsWith(date))
  3. 查询跨当天的 sleepEvents (start ≤ date ≤ end)
  4. 计算汇总:
     - milkTimes = feeds.length
     - milkTotalMl = sum(amountMl)
     - poopTimes = diapers.filter(kind='便').length
     - peeTimes = diapers.filter(kind='尿').length
     - sleepHours = sum(裁剪到当天范围的 sleep 时长)
  5. put DailyLog (保留原有 note 和 symptomsTags)
```

**调用时机**: FeedForm、SleepForm、DiaperForm 的 `onSubmit` 和 `handleDelete` 中。

## 路由设计

使用 **HashRouter** (URL 带 `#/`)，适配 Cloudflare Pages 等静态托管（无需服务端 URL 重写）。

所有页面使用 `React.lazy()` + `Suspense` 懒加载，减少首屏加载体积。

### 路由规范

- 列表页: `/{resource}` (如 `/growth`, `/vaccines`)
- 新建页: `/{resource}/new`
- 编辑页: `/{resource}/:id/edit` (或 `/:date/edit` 对于 dailyLog)

## MUI 主题

定义在 `src/lib/theme.ts`，通过 `ThemeProvider` 在 `Layout.tsx` 中注入。

### 配色

| 角色 | 色值 | 用途 |
|------|------|------|
| Primary | #EA580C (暖橙) | 主按钮、高亮、活跃 tab |
| Secondary | #8DB48E (鼠尾绿) | 次要按钮 |
| Error | #DC2626 (红) | 删除、错误 |
| Background default | #FFF7ED (暖奶油) | 页面背景 |
| Background paper | #FFFBF5 (浅奶油) | 卡片背景 |
| Text primary | #3D3229 (暖深棕) | 主文字 |
| Text secondary | #78716C (灰棕) | 次要文字 |

### 组件定制

- **Button**: `borderRadius: 20`, 无文字大写
- **Card**: `borderRadius: 16`, 极轻阴影
- **TextField**: 默认 `size="small"`, `variant="outlined"`, `fullWidth`
- **Dialog**: `borderRadius: 16`
- **BottomNavigation**: 半透明 + 模糊背景

## 样式策略

**MUI + Tailwind 混合模式**:

- **MUI**: 用于交互组件 (Button, Card, TextField, Dialog, Switch, Chip, BottomNavigation)
- **Tailwind**: 用于布局和微调 (`flex`, `grid`, `gap-*`, `px-*`, `rounded-*`, `bg-*`, `text-*` 等)
- **CSS 变量**: `index.css` 中定义 shadcn 风格的 CSS 变量 (保留兼容性)

### 注意事项

- MUI CssBaseline 会重置部分浏览器默认样式
- Tailwind 的 preflight 可能与 MUI 冲突，当前无明显问题
- `className` 中混用 Tailwind 类和 MUI 的 sx prop 时，Tailwind 类优先级可能低于 MUI 内联样式

## 表单架构

所有表单统一使用:

```typescript
const { register, handleSubmit, setValue, watch, reset, control, formState: { errors, isSubmitting } }
  = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ... },
  });
```

### 表单组件映射

| 字段类型 | MUI 组件 | 用法 |
|---------|---------|------|
| 文本 | `TextField` | `{...register("field")}` |
| 数字 | `TextField type="number"` | `inputProps={{ min: 0 }}` |
| 日期 | `TextField type="date"` | `InputLabelProps={{ shrink: true }}` |
| 时间 | `TextField type="datetime-local"` | 同上 |
| 下拉选择 | `TextField select` + `MenuItem` | `value={watch("field")}` + `onChange` |
| 开关 | `FormControlLabel` + `Switch` | `checked={watch()}` + `onChange` |
| 多行文本 | `TextField multiline rows={3}` | `{...register("field")}` |
| 标签切换 | `Chip onClick` | `variant="filled"/"outlined"` 切换 |

### 删除确认

使用 MUI `Dialog` + `useState(false)` 模式:

```typescript
const [deleteOpen, setDeleteOpen] = useState(false);
// 触发: <Button onClick={() => setDeleteOpen(true)}>删除</Button>
// 确认: <Dialog open={deleteOpen}>...<Button onClick={handleDelete}>确认</Button></Dialog>
```

## PWA 配置

定义在 `vite.config.ts` 的 `VitePWA()` 插件:

- **registerType**: `autoUpdate` — 新 SW 就绪后自动激活
- **策略**: `generateSW` (Workbox 自动生成)
- **预缓存**: 所有 `.js`, `.css`, `.html`, `.ico`, `.png`, `.svg`, `.woff2`
- **Manifest**: `standalone` 模式, `portrait` 方向, 暖奶油色主题

### iOS 适配

```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="宝宝记录" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

TabBar 底部添加 `env(safe-area-inset-bottom)` 适配 iPhone 底部安全区。

## 备份机制

### 导出格式

```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-02-28T08:30:00.000Z",
  "profiles": [...],
  "dailyLogs": [...],
  "feedEvents": [...],
  "sleepEvents": [...],
  "diaperEvents": [...],
  "growthRecords": [...],
  "vaccineRecords": [...],
  "milestones": [...],
  "journalEntries": [...]
}
```

文件名: `baby-log-YYYYMMDD-HHmm.json`

### 导入流程

1. 用户选择 `.json` 文件
2. 前端解析并校验 `schemaVersion` 字段存在
3. Dialog 二次确认（警告覆盖）
4. Dexie 事务中: 清空所有表 → bulkAdd 导入数据

### 待修复

- `illnessRecords` 未纳入导出/导入（v2 新增表遗漏）
- `SCHEMA_VERSION` 常量仍为 1，应更新为 2
