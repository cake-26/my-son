import { useLiveQuery } from "dexie-react-hooks";
import { format } from "date-fns";
import { Milk, Moon, Droplets, Plus, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { db } from "@/db";
import { PageHeader } from "@/components/PageHeader";

const today = () => format(new Date(), "yyyy-MM-dd");

export default function Records() {
  const navigate = useNavigate();
  const todayStr = today();

  const feeds = useLiveQuery(
    () =>
      db.feedEvents
        .where("datetime")
        .startsWith(todayStr)
        .reverse()
        .sortBy("datetime"),
    [todayStr],
  );

  const sleeps = useLiveQuery(
    () =>
      db.sleepEvents
        .orderBy("start")
        .reverse()
        .filter((s) => s.start.slice(0, 10) === todayStr)
        .toArray(),
    [todayStr],
  );

  const diapers = useLiveQuery(
    () =>
      db.diaperEvents
        .where("datetime")
        .startsWith(todayStr)
        .reverse()
        .sortBy("datetime"),
    [todayStr],
  );

  const recentFeeds = feeds?.slice(0, 5) ?? [];
  const recentSleeps = sleeps?.slice(0, 5) ?? [];
  const recentDiapers = diapers?.slice(0, 5) ?? [];

  const feedCount = feeds?.length ?? 0;
  const sleepCount = sleeps?.length ?? 0;
  const diaperCount = diapers?.length ?? 0;

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <PageHeader
        title="记录"
        action={
          <Button variant="text" size="small" onClick={() => navigate("/daily-log")}>
            今日汇总 <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        }
      />

      <div className="flex flex-col gap-4 px-4 mt-2">
        {/* 喂养 */}
        <Card>
          <Box className="flex flex-row items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <Milk className="h-5 w-5 text-orange-500" />
              <Typography variant="subtitle1" className="font-semibold">
                喂养记录
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">今日 {feedCount} 次</span>
              <Button size="small" variant="contained" onClick={() => navigate("/feed/new")}>
                <Plus className="h-4 w-4 mr-1" /> 添加
              </Button>
            </div>
          </Box>
          <CardContent>
            {recentFeeds.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">暂无记录</p>
            ) : (
              <ul className="divide-y">
                {recentFeeds.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded-md transition-colors"
                    onClick={() => navigate(`/feed/${f.id}/edit`)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-12">
                        {format(new Date(f.datetime), "HH:mm")}
                      </span>
                      <span className="text-sm">{f.type}</span>
                      {f.amountMl != null && (
                        <span className="text-xs text-muted-foreground">{f.amountMl}ml</span>
                      )}
                      {f.durationMin != null && (
                        <span className="text-xs text-muted-foreground">{f.durationMin}分钟</span>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* 睡眠 */}
        <Card>
          <Box className="flex flex-row items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-indigo-500" />
              <Typography variant="subtitle1" className="font-semibold">
                睡眠记录
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">今日 {sleepCount} 次</span>
              <Button size="small" variant="contained" onClick={() => navigate("/sleep/new")}>
                <Plus className="h-4 w-4 mr-1" /> 添加
              </Button>
            </div>
          </Box>
          <CardContent>
            {recentSleeps.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">暂无记录</p>
            ) : (
              <ul className="divide-y">
                {recentSleeps.map((s) => {
                  const startT = format(new Date(s.start), "HH:mm");
                  const endT = format(new Date(s.end), "HH:mm");
                  return (
                    <li
                      key={s.id}
                      className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded-md transition-colors"
                      onClick={() => navigate(`/sleep/${s.id}/edit`)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground w-24">
                          {startT} - {endT}
                        </span>
                        <span className="text-sm">{s.place}</span>
                        <span className="text-xs text-muted-foreground">{s.method}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* 排泄 */}
        <Card>
          <Box className="flex flex-row items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-sky-500" />
              <Typography variant="subtitle1" className="font-semibold">
                排泄记录
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">今日 {diaperCount} 次</span>
              <Button size="small" variant="contained" onClick={() => navigate("/diaper/new")}>
                <Plus className="h-4 w-4 mr-1" /> 添加
              </Button>
            </div>
          </Box>
          <CardContent>
            {recentDiapers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">暂无记录</p>
            ) : (
              <ul className="divide-y">
                {recentDiapers.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded-md transition-colors"
                    onClick={() => navigate(`/diaper/${d.id}/edit`)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-12">
                        {format(new Date(d.datetime), "HH:mm")}
                      </span>
                      <span className="text-sm">{d.kind}</span>
                      {d.kind === "便" && d.poopColor && (
                        <span className="text-xs text-muted-foreground">{d.poopColor}色</span>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
