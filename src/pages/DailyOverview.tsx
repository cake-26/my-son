import { useNavigate, useParams, Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { format } from "date-fns";
import { Calendar, Edit } from "lucide-react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { db } from "@/db";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";

export default function DailyOverview() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();

  const log = useLiveQuery(
    () => (date ? db.dailyLogs.get(date) : undefined),
    [date],
  );

  const feedEvents = useLiveQuery(
    () =>
      date
        ? db.feedEvents.where("datetime").startsWith(date).sortBy("datetime")
        : [],
    [date],
  );

  const diaperEvents = useLiveQuery(
    () =>
      date
        ? db.diaperEvents.where("datetime").startsWith(date).sortBy("datetime")
        : [],
    [date],
  );

  const sleepEvents = useLiveQuery(async () => {
    if (!date) return [];
    const all = await db.sleepEvents.toArray();
    return all.filter(
      (s) => s.start.slice(0, 10) === date || s.end.slice(0, 10) === date,
    );
  }, [date]);

  const hasData =
    log != null ||
    (feedEvents && feedEvents.length > 0) ||
    (diaperEvents && diaperEvents.length > 0) ||
    (sleepEvents && sleepEvents.length > 0);

  if (log === undefined && feedEvents === undefined) {
    // still loading
    return (
      <div className="pb-24">
        <PageHeader title="每日总览" subtitle={date} onBack={() => navigate(-1)} />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="pb-24">
        <PageHeader title="每日总览" subtitle={date} onBack={() => navigate(-1)} />
        <EmptyState
          icon={<Calendar className="h-10 w-10" />}
          title="暂无记录"
          description="当天还没有任何数据"
          action={
            <Button
              component={Link}
              to={`/daily-log/${date}/edit`}
              size="small"
              variant="contained"
            >
              去记录
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="pb-24">
      <PageHeader
        title="每日总览"
        subtitle={date}
        onBack={() => navigate(-1)}
        action={
          <Button
            component={Link}
            to={`/daily-log/${date}/edit`}
            size="small"
            variant="outlined"
            startIcon={<Edit className="h-4 w-4" />}
          >
            编辑
          </Button>
        }
      />

      <div className="px-4 space-y-4">
        {/* 基本数据 */}
        {log && (
          <Card variant="outlined" className="rounded-xl">
            <CardContent className="p-4 space-y-3">
              <Typography variant="subtitle2" className="font-semibold text-muted-foreground">
                基本数据
              </Typography>
              {(log.tempMorning != null || log.tempAfternoon != null) && (
                <div className="flex gap-4 text-sm">
                  {log.tempMorning != null && (
                    <span>体温上午：<strong>{log.tempMorning} °C</strong></span>
                  )}
                  {log.tempAfternoon != null && (
                    <span>体温下午：<strong>{log.tempAfternoon} °C</strong></span>
                  )}
                </div>
              )}
              {(log.jaundiceAMForehead != null ||
                log.jaundiceAMFace != null ||
                log.jaundiceAMChest != null) && (
                <div className="text-sm space-y-0.5">
                  <div className="text-muted-foreground text-xs">黄疸早（mg/dL）</div>
                  <div className="flex gap-4">
                    {log.jaundiceAMForehead != null && (
                      <span>额头 {log.jaundiceAMForehead}</span>
                    )}
                    {log.jaundiceAMFace != null && (
                      <span>脸 {log.jaundiceAMFace}</span>
                    )}
                    {log.jaundiceAMChest != null && (
                      <span>胸 {log.jaundiceAMChest}</span>
                    )}
                  </div>
                </div>
              )}
              {(log.jaundicePMForehead != null ||
                log.jaundicePMFace != null ||
                log.jaundicePMChest != null) && (
                <div className="text-sm space-y-0.5">
                  <div className="text-muted-foreground text-xs">黄疸晚（mg/dL）</div>
                  <div className="flex gap-4">
                    {log.jaundicePMForehead != null && (
                      <span>额头 {log.jaundicePMForehead}</span>
                    )}
                    {log.jaundicePMFace != null && (
                      <span>脸 {log.jaundicePMFace}</span>
                    )}
                    {log.jaundicePMChest != null && (
                      <span>胸 {log.jaundicePMChest}</span>
                    )}
                  </div>
                </div>
              )}
              {log.weightKg != null && (
                <div className="text-sm">
                  体重：<strong>{log.weightKg} kg</strong>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 沐浴 & 睡眠 */}
        {log && (
          <Card variant="outlined" className="rounded-xl">
            <CardContent className="p-4 space-y-3">
              <Typography variant="subtitle2" className="font-semibold text-muted-foreground">
                沐浴 & 睡眠
              </Typography>
              <div className="flex flex-wrap gap-2 items-center">
                {log.bath ? (
                  <Chip label={log.bath} size="small" color="primary" variant="filled" />
                ) : (
                  <Chip label="未洗" size="small" variant="outlined" />
                )}
                {log.sleepQuality ? (
                  <Chip label={`睡眠${log.sleepQuality}`} size="small" color="primary" variant="filled" />
                ) : null}
                <span className="text-sm">睡眠时长：{log.sleepHours} 小时</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 喂养汇总 */}
        {log && (
          <Card variant="outlined" className="rounded-xl">
            <CardContent className="p-4 space-y-2">
              <Typography variant="subtitle2" className="font-semibold text-muted-foreground">
                喂养汇总
              </Typography>
              <div className="text-sm space-y-1">
                {(log.formulaMl != null || log.formulaTimes != null) && (
                  <div>
                    奶粉：
                    {log.formulaMl != null && <strong>{log.formulaMl} ml</strong>}
                    {log.formulaTimes != null && <span> / {log.formulaTimes} 次</span>}
                  </div>
                )}
                {(log.breastMilkMl != null || log.breastMilkTimes != null) && (
                  <div>
                    母乳：
                    {log.breastMilkMl != null && <strong>{log.breastMilkMl} ml</strong>}
                    {log.breastMilkTimes != null && <span> / {log.breastMilkTimes} 次</span>}
                  </div>
                )}
                <div className="text-muted-foreground text-xs">
                  事件记录：{log.milkTotalMl} ml / {log.milkTimes} 次
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 排泄 */}
        {log && (
          <Card variant="outlined" className="rounded-xl">
            <CardContent className="p-4 space-y-2">
              <Typography variant="subtitle2" className="font-semibold text-muted-foreground">
                排泄
              </Typography>
              <div className="flex gap-4 text-sm">
                <span>大便：<strong>{log.poopTimes} 次</strong></span>
                <span>小便：<strong>{log.peeTimes} 次</strong></span>
              </div>
              {diaperEvents && diaperEvents.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  换尿片事件：{diaperEvents.length} 条
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        {/* 症状 */}
        {log && log.symptomsTags && log.symptomsTags.length > 0 && (
          <Card variant="outlined" className="rounded-xl">
            <CardContent className="p-4 space-y-3">
              <Typography variant="subtitle2" className="font-semibold text-muted-foreground">
                症状
              </Typography>
              <div className="flex flex-wrap gap-1">
                {log.symptomsTags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" color="warning" variant="outlined" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 备注 */}
        {log && log.note && (
          <Card variant="outlined" className="rounded-xl">
            <CardContent className="p-4 space-y-2">
              <Typography variant="subtitle2" className="font-semibold text-muted-foreground">
                备注
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {log.note}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* 喂养事件明细 */}
        {feedEvents && feedEvents.length > 0 && (
          <Card variant="outlined" className="rounded-xl">
            <CardContent className="p-4 space-y-2">
              <Typography variant="subtitle2" className="font-semibold text-muted-foreground">
                喂养事件明细
              </Typography>
              <div className="space-y-1">
                {feedEvents.map((e) => (
                  <div key={e.id} className="text-sm flex gap-2 items-center">
                    <span className="text-muted-foreground text-xs">
                      {e.datetime.length >= 16 ? e.datetime.slice(11, 16) : e.datetime}
                    </span>
                    <Chip label={e.type} size="small" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
                    {e.amountMl != null && <span>{e.amountMl} ml</span>}
                    {e.durationMin != null && <span>{e.durationMin} 分钟</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 排泄事件明细 */}
        {diaperEvents && diaperEvents.length > 0 && (
          <Card variant="outlined" className="rounded-xl">
            <CardContent className="p-4 space-y-2">
              <Typography variant="subtitle2" className="font-semibold text-muted-foreground">
                排泄事件明细
              </Typography>
              <div className="space-y-1">
                {diaperEvents.map((e) => (
                  <div key={e.id} className="text-sm flex gap-2 items-center">
                    <span className="text-muted-foreground text-xs">
                      {e.datetime.length >= 16 ? e.datetime.slice(11, 16) : e.datetime}
                    </span>
                    <Chip label={e.kind} size="small" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
                    {e.poopTexture && <span>{e.poopTexture}</span>}
                    {e.poopColor && <span>{e.poopColor}</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 睡眠事件明细 */}
        {sleepEvents && sleepEvents.length > 0 && (
          <Card variant="outlined" className="rounded-xl">
            <CardContent className="p-4 space-y-2">
              <Typography variant="subtitle2" className="font-semibold text-muted-foreground">
                睡眠事件明细
              </Typography>
              <div className="space-y-1">
                {sleepEvents.map((e) => {
                  const startTime = e.start.length >= 16 ? e.start.slice(11, 16) : e.start;
                  const endTime = e.end.length >= 16 ? e.end.slice(11, 16) : e.end;
                  return (
                    <div key={e.id} className="text-sm flex gap-2 items-center">
                      <span className="text-muted-foreground text-xs">
                        {startTime} – {endTime}
                      </span>
                      <Chip label={e.place} size="small" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
