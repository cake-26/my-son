import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate } from "react-router-dom";
import { format, differenceInDays, subDays } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Baby, Milk, Moon, Droplets, Plus, FileDown, Calendar } from "lucide-react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { db } from "@/db";
import { EmptyState } from "@/components/EmptyState";
import { downloadBackup } from "@/db/backup";

const DAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"] as const;

function weekdayLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return `周${DAY_LABELS[d.getDay()]}`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const profile = useLiveQuery(() =>
    db.profiles.toArray().then((ps) => ps[0]),
  );

  const today = format(new Date(), "yyyy-MM-dd");
  const todayLog = useLiveQuery(() => db.dailyLogs.get(today), [today]);

  const sevenDaysAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");
  const recentLogs = useLiveQuery(
    () =>
      db.dailyLogs
        .where("date")
        .between(sevenDaysAgo, today, true, true)
        .reverse()
        .sortBy("date"),
    [sevenDaysAgo, today],
  );

  const daysSinceBirth =
    profile?.birthDate
      ? differenceInDays(new Date(), new Date(profile.birthDate + "T00:00:00")) + 1
      : null;

  const stats = [
    {
      label: "奶量",
      value: todayLog?.milkTotalMl ?? 0,
      unit: "ml",
      icon: Milk,
      bg: "bg-orange-50",
      iconColor: "text-orange-500",
    },
    {
      label: "喂奶",
      value: todayLog?.milkTimes ?? 0,
      unit: "次",
      icon: Baby,
      bg: "bg-green-50",
      iconColor: "text-green-500",
    },
    {
      label: "便便",
      value: todayLog?.poopTimes ?? 0,
      unit: "次",
      icon: Droplets,
      bg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      label: "睡眠",
      value: todayLog?.sleepHours ?? 0,
      unit: "小时",
      icon: Moon,
      bg: "bg-purple-50",
      iconColor: "text-purple-500",
    },
  ];

  return (
    <div className="px-4 pt-4 pb-24 space-y-5">
      {/* Baby Card */}
      {profile ? (
        <Link to="/profile" style={{ textDecoration: "none" }}>
          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-0 rounded-2xl shadow-sm" elevation={0}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex items-center justify-center h-14 w-14 rounded-full bg-white/70 shadow-sm">
                <Baby className="h-7 w-7 text-orange-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-foreground truncate">
                  {profile.name}
                  {profile.nickname && (
                    <span className="text-muted-foreground font-normal text-sm ml-1">
                      ({profile.nickname})
                    </span>
                  )}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(profile.birthDate + "T00:00:00"), "yyyy年M月d日")}
                  {daysSinceBirth != null && (
                    <span className="ml-2 text-orange-600 font-medium">
                      出生第 {daysSinceBirth} 天
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ) : (
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-0 rounded-2xl shadow-sm" elevation={0}>
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <Baby className="h-10 w-10 text-orange-300" />
            <p className="text-sm text-muted-foreground">还没有添加宝宝信息</p>
            <Button
              component={Link}
              to="/profile"
              size="small"
              variant="contained"
            >
              设置宝宝信息
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Today's Stats */}
      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-2.5">今日概览</h3>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`${s.bg} rounded-xl p-3 flex items-center gap-3`}
            >
              <s.icon className={`h-5 w-5 ${s.iconColor} flex-shrink-0`} />
              <div>
                <p className="text-lg font-semibold leading-tight">
                  {s.value}
                  <span className="text-xs font-normal text-muted-foreground ml-0.5">
                    {s.unit}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-2.5">快捷操作</h3>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          <Button
            variant="outlined"
            size="small"
            className="flex-shrink-0 gap-1.5"
            onClick={() => navigate(`/daily-log/${today}/edit`)}
          >
            <Calendar className="h-3.5 w-3.5" />
            记录今天
          </Button>
          <Button
            variant="outlined"
            size="small"
            className="flex-shrink-0 gap-1.5"
            onClick={() => navigate("/feed/new")}
          >
            <Plus className="h-3.5 w-3.5" />
            喂一次奶
          </Button>
          <Button
            variant="outlined"
            size="small"
            className="flex-shrink-0 gap-1.5"
            onClick={() => downloadBackup()}
          >
            <FileDown className="h-3.5 w-3.5" />
            导出备份
          </Button>
        </div>
      </section>

      {/* Recent 7 Days */}
      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-2.5">最近 7 天</h3>
        {!recentLogs?.length ? (
          <EmptyState
            icon={<Calendar className="h-10 w-10" />}
            title="暂无记录"
            description="开始记录宝宝的每一天吧"
            action={
              <Button
                component={Link}
                to="/daily-log/new"
                size="small"
                variant="contained"
              >
                <Plus className="h-4 w-4 mr-1" />
                新增记录
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <Card
                key={log.date}
                className="rounded-xl border shadow-sm cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => navigate(`/daily-log/${log.date}/edit`)}
              >
                <CardContent className="flex items-center justify-between p-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-medium w-20 flex-shrink-0">
                      {format(new Date(log.date + "T00:00:00"), "MM-dd")}{" "}
                      <span className="text-muted-foreground text-xs">
                        {weekdayLabel(log.date)}
                      </span>
                    </span>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Milk className="h-3 w-3 text-orange-400" />
                        {log.milkTotalMl}ml
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Baby className="h-3 w-3 text-green-400" />
                        {log.milkTimes}次
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Droplets className="h-3 w-3 text-blue-400" />
                        {log.poopTimes}次
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Moon className="h-3 w-3 text-purple-400" />
                        {log.sleepHours}h
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
