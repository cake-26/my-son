import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, Milk, Baby, Droplets, Moon, Plus } from "lucide-react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import { db } from "@/db";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";

const DAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"] as const;

export default function DailyLog() {
  const navigate = useNavigate();
  const logs = useLiveQuery(() =>
    db.dailyLogs.orderBy("date").reverse().toArray(),
  );

  return (
    <div className="pb-24">
      <PageHeader
        title="每日记录"
        action={
          <Button
            component={Link}
            to="/daily-log/new"
            size="small"
            variant="contained"
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            新增
          </Button>
        }
      />

      <div className="px-4 space-y-2">
        {!logs?.length ? (
          <EmptyState
            icon={<Calendar className="h-10 w-10" />}
            title="暂无每日记录"
            description="每天记录一次，跟踪宝宝的成长"
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
          logs.map((log) => {
            const d = new Date(log.date + "T00:00:00");
            return (
              <Card
                key={log.date}
                className="rounded-xl border shadow-sm cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => navigate(`/daily-log/${log.date}/edit`)}
              >
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      {format(d, "yyyy-MM-dd")}{" "}
                      <span className="text-muted-foreground font-normal">
                        周{DAY_LABELS[d.getDay()]}
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Milk className="h-3.5 w-3.5 text-orange-400" />
                      {log.milkTotalMl} ml
                    </span>
                    <span className="flex items-center gap-1">
                      <Baby className="h-3.5 w-3.5 text-green-400" />
                      喂奶 {log.milkTimes} 次
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplets className="h-3.5 w-3.5 text-blue-400" />
                      便 {log.poopTimes} / 尿 {log.peeTimes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Moon className="h-3.5 w-3.5 text-purple-400" />
                      {log.sleepHours} 小时
                    </span>
                  </div>

                  {log.symptomsTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {log.symptomsTags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{ fontSize: "10px", height: 20 }}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
