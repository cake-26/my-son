import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import { db } from "@/db";
import { SYMPTOM_OPTIONS } from "@/lib/constants";
import { PageHeader } from "@/components/PageHeader";

const optNum = z.preprocess(
  (v) => (v === "" || v == null ? undefined : Number(v)),
  z.number().optional(),
);

const schema = z.object({
  date: z.string().min(1, "请选择日期"),
  tempMorning: optNum,
  tempAfternoon: optNum,
  jaundiceAMForehead: optNum,
  jaundiceAMFace: optNum,
  jaundiceAMChest: optNum,
  jaundicePMForehead: optNum,
  jaundicePMFace: optNum,
  jaundicePMChest: optNum,
  weightKg: optNum,
  sleepHours: z.coerce.number().min(0),
  formulaMl: optNum,
  breastMilkMl: optNum,
  formulaTimes: optNum,
  breastMilkTimes: optNum,
  poopTimes: z.coerce.number().min(0),
  peeTimes: z.coerce.number().min(0),
  note: z.string(),
});

type FormValues = z.infer<typeof schema>;

export default function DailyLogForm() {
  const { date: dateParam } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const isEdit = !!dateParam;
  const [symptomsTags, setSymptomsTags] = useState<string[]>([]);
  const [bath, setBath] = useState<"游泳" | "洗澡" | "">("");
  const [sleepQuality, setSleepQuality] = useState<"佳" | "一般" | "">("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [existingMilkTimes, setExistingMilkTimes] = useState(0);
  const [existingMilkMl, setExistingMilkMl] = useState(0);
  const [existingPoop, setExistingPoop] = useState(0);
  const [existingPee, setExistingPee] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: dateParam ?? format(new Date(), "yyyy-MM-dd"),
      sleepHours: 0,
      poopTimes: 0,
      peeTimes: 0,
      note: "",
    },
  });

  useEffect(() => {
    if (!dateParam) return;
    db.dailyLogs.get(dateParam).then((log) => {
      if (!log) return;
      reset({
        date: log.date,
        tempMorning: log.tempMorning,
        tempAfternoon: log.tempAfternoon,
        jaundiceAMForehead: log.jaundiceAMForehead,
        jaundiceAMFace: log.jaundiceAMFace,
        jaundiceAMChest: log.jaundiceAMChest,
        jaundicePMForehead: log.jaundicePMForehead,
        jaundicePMFace: log.jaundicePMFace,
        jaundicePMChest: log.jaundicePMChest,
        weightKg: log.weightKg,
        sleepHours: log.sleepHours,
        formulaMl: log.formulaMl,
        breastMilkMl: log.breastMilkMl,
        formulaTimes: log.formulaTimes,
        breastMilkTimes: log.breastMilkTimes,
        poopTimes: log.poopTimes,
        peeTimes: log.peeTimes,
        note: log.note,
      });
      setBath(log.bath ?? "");
      setSleepQuality(log.sleepQuality ?? "");
      setSymptomsTags(log.symptomsTags ?? []);
      setExistingMilkTimes(log.milkTimes);
      setExistingMilkMl(log.milkTotalMl);
      setExistingPoop(log.poopTimes);
      setExistingPee(log.peeTimes);
    });
  }, [dateParam, reset]);

  function toggleSymptom(tag: string) {
    setSymptomsTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  async function onSubmit(data: FormValues) {
    const existing = await db.dailyLogs.get(data.date);
    await db.dailyLogs.put({
      ...(existing ?? {}),
      date: data.date,
      milkTimes: existing?.milkTimes ?? 0,
      milkTotalMl: existing?.milkTotalMl ?? 0,
      poopTimes: data.poopTimes,
      peeTimes: data.peeTimes,
      sleepHours: data.sleepHours,
      note: data.note,
      symptomsTags,
      tempMorning: data.tempMorning,
      tempAfternoon: data.tempAfternoon,
      jaundiceAMForehead: data.jaundiceAMForehead,
      jaundiceAMFace: data.jaundiceAMFace,
      jaundiceAMChest: data.jaundiceAMChest,
      jaundicePMForehead: data.jaundicePMForehead,
      jaundicePMFace: data.jaundicePMFace,
      jaundicePMChest: data.jaundicePMChest,
      bath,
      weightKg: data.weightKg,
      sleepQuality,
      formulaMl: data.formulaMl,
      breastMilkMl: data.breastMilkMl,
      formulaTimes: data.formulaTimes,
      breastMilkTimes: data.breastMilkTimes,
    });
    toast.success("保存成功");
    navigate("/daily-log");
  }

  async function onDelete() {
    if (!dateParam) return;
    await db.dailyLogs.delete(dateParam);
    toast.success("已删除");
    navigate("/daily-log");
  }

  return (
    <div className="pb-24">
      <PageHeader
        title={isEdit ? "编辑记录" : "每日记录"}
        subtitle={dateParam}
        onBack={() => navigate(-1)}
        action={
          isEdit ? (
            <IconButton color="error" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" />
            </IconButton>
          ) : undefined
        }
      />

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            删除后无法恢复，确定要删除这条记录吗？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>取消</Button>
          <Button variant="contained" color="error" onClick={onDelete}>
            删除
          </Button>
        </DialogActions>
      </Dialog>

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 space-y-4">
        {/* 日期 */}
        <Card variant="outlined" className="rounded-xl">
          <CardContent className="p-4 space-y-3">
            <Typography variant="subtitle2" className="font-semibold text-muted-foreground">
              日期
            </Typography>
            <TextField
              label="日期"
              type="date"
              fullWidth
              size="small"
              disabled={isEdit}
              slotProps={{ inputLabel: { shrink: true } }}
              error={!!errors.date}
              helperText={errors.date?.message}
              {...register("date")}
            />

          </CardContent>
        </Card>

        {/* 体温 */}
        <Card variant="outlined" className="rounded-xl">
          <CardContent className="p-4 space-y-3">
            <Typography variant="subtitle2" className="font-semibold text-muted-foreground">
              体温 °C
            </Typography>
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="上午"
                type="number"
                fullWidth
                size="small"
                placeholder="36.5"
                slotProps={{ htmlInput: { step: 0.1 }, inputLabel: { shrink: true } }}
                {...register("tempMorning")}
              />
              <TextField
                label="下午"
                type="number"
                fullWidth
                size="small"
                placeholder="36.5"
                slotProps={{ htmlInput: { step: 0.1 }, inputLabel: { shrink: true } }}
                {...register("tempAfternoon")}
              />
            </div>
          </CardContent>
        </Card>

        {/* 黄疸 */}
        <Card variant="outlined" className="rounded-xl">
          <CardContent className="p-4 space-y-3">
            <Typography variant="subtitle2" className="font-semibold text-muted-foreground">
              黄疸 mg/dL
            </Typography>
            <div className="space-y-2">
              <Typography variant="caption" color="text.secondary">
                早（上午）
              </Typography>
              <div className="grid grid-cols-3 gap-2">
                <TextField
                  label="额头"
                  type="number"
                  size="small"
                  fullWidth
                  slotProps={{
                    htmlInput: { step: 0.1 },
                    inputLabel: { style: { fontSize: 12 }, shrink: true },
                  }}
                  {...register("jaundiceAMForehead")}
                />
                <TextField
                  label="脸"
                  type="number"
                  size="small"
                  fullWidth
                  slotProps={{
                    htmlInput: { step: 0.1 },
                    inputLabel: { style: { fontSize: 12 }, shrink: true },
                  }}
                  {...register("jaundiceAMFace")}
                />
                <TextField
                  label="胸"
                  type="number"
                  size="small"
                  fullWidth
                  slotProps={{
                    htmlInput: { step: 0.1 },
                    inputLabel: { style: { fontSize: 12 }, shrink: true },
                  }}
                  {...register("jaundiceAMChest")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Typography variant="caption" color="text.secondary">
                晚（下午）
              </Typography>
              <div className="grid grid-cols-3 gap-2">
                <TextField
                  label="额头"
                  type="number"
                  size="small"
                  fullWidth
                  slotProps={{
                    htmlInput: { step: 0.1 },
                    inputLabel: { style: { fontSize: 12 }, shrink: true },
                  }}
                  {...register("jaundicePMForehead")}
                />
                <TextField
                  label="脸"
                  type="number"
                  size="small"
                  fullWidth
                  slotProps={{
                    htmlInput: { step: 0.1 },
                    inputLabel: { style: { fontSize: 12 }, shrink: true },
                  }}
                  {...register("jaundicePMFace")}
                />
                <TextField
                  label="胸"
                  type="number"
                  size="small"
                  fullWidth
                  slotProps={{
                    htmlInput: { step: 0.1 },
                    inputLabel: { style: { fontSize: 12 }, shrink: true },
                  }}
                  {...register("jaundicePMChest")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 沐浴 & 体重 */}
        <Card variant="outlined" className="rounded-xl">
          <CardContent className="p-4 space-y-3">
            <Typography variant="subtitle2" className="font-semibold text-muted-foreground">
              沐浴 & 体重
            </Typography>
            <div className="space-y-2">
              <Typography variant="caption" color="text.secondary">
                沐浴方式
              </Typography>
              <div className="flex gap-2 flex-wrap">
                {(["游泳", "洗澡", "未洗"] as const).map((opt) => {
                  const val = opt === "未洗" ? "" : opt;
                  const selected = bath === val;
                  return (
                    <Chip
                      key={opt}
                      label={opt}
                      size="small"
                      variant={selected ? "filled" : "outlined"}
                      color={selected ? "primary" : "default"}
                      onClick={() => setBath(selected ? "" : (val as "游泳" | "洗澡" | ""))}
                      className="cursor-pointer select-none"
                    />
                  );
                })}
              </div>
            </div>
            <TextField
              label="体重 (kg)"
              type="number"
              fullWidth
              size="small"
              slotProps={{ htmlInput: { step: 0.01 }, inputLabel: { shrink: true } }}
              {...register("weightKg")}
            />
          </CardContent>
        </Card>

        {/* 睡眠 */}
        <Card variant="outlined" className="rounded-xl">
          <CardContent className="p-4 space-y-3">
            <Typography variant="subtitle2" className="font-semibold text-muted-foreground">
              睡眠
            </Typography>
            <div className="space-y-2">
              <Typography variant="caption" color="text.secondary">
                睡眠质量
              </Typography>
              <div className="flex gap-2">
                {(["佳", "一般"] as const).map((opt) => {
                  const selected = sleepQuality === opt;
                  return (
                    <Chip
                      key={opt}
                      label={opt}
                      size="small"
                      variant={selected ? "filled" : "outlined"}
                      color={selected ? "primary" : "default"}
                      onClick={() => setSleepQuality(selected ? "" : opt)}
                      className="cursor-pointer select-none"
                    />
                  );
                })}
              </div>
            </div>
            <TextField
              label="睡眠时长 (小时)"
              type="number"
              fullWidth
              size="small"
              slotProps={{ htmlInput: { min: 0, step: 0.5 }, inputLabel: { shrink: true } }}
              {...register("sleepHours")}
            />
          </CardContent>
        </Card>

        {/* 喂养 */}
        <Card variant="outlined" className="rounded-xl">
          <CardContent className="p-4 space-y-3">
            <Typography variant="subtitle2" className="font-semibold text-muted-foreground">
              喂养
            </Typography>
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="奶粉量 (ml)"
                type="number"
                fullWidth
                size="small"
                slotProps={{ htmlInput: { min: 0 }, inputLabel: { shrink: true } }}
                {...register("formulaMl")}
              />
              <TextField
                label="奶粉次数"
                type="number"
                fullWidth
                size="small"
                slotProps={{ htmlInput: { min: 0 }, inputLabel: { shrink: true } }}
                {...register("formulaTimes")}
              />
              <TextField
                label="母乳量 (ml)"
                type="number"
                fullWidth
                size="small"
                slotProps={{ htmlInput: { min: 0 }, inputLabel: { shrink: true } }}
                {...register("breastMilkMl")}
              />
              <TextField
                label="母乳次数"
                type="number"
                fullWidth
                size="small"
                slotProps={{ htmlInput: { min: 0 }, inputLabel: { shrink: true } }}
                {...register("breastMilkTimes")}
              />
            </div>
            {isEdit && (
              <Typography variant="caption" color="text.secondary">
                事件记录：{existingMilkTimes} 次 / {existingMilkMl} ml
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* 大便 & 小便 */}
        <Card variant="outlined" className="rounded-xl">
          <CardContent className="p-4 space-y-3">
            <Typography variant="subtitle2" className="font-semibold text-muted-foreground">
              大便 & 小便
            </Typography>
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="便便次数"
                type="number"
                fullWidth
                size="small"
                slotProps={{ htmlInput: { min: 0 }, inputLabel: { shrink: true } }}
                {...register("poopTimes")}
              />
              <TextField
                label="尿尿次数"
                type="number"
                fullWidth
                size="small"
                slotProps={{ htmlInput: { min: 0 }, inputLabel: { shrink: true } }}
                {...register("peeTimes")}
              />
            </div>
            {isEdit && (
              <Typography variant="caption" color="text.secondary">
                事件记录：便 {existingPoop} 次 / 尿 {existingPee} 次
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* 症状标记 */}
        <Card variant="outlined" className="rounded-xl">
          <CardContent className="p-4 space-y-3">
            <Typography variant="subtitle2" className="font-semibold text-muted-foreground">
              症状标记
            </Typography>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_OPTIONS.map((opt) => (
                <Chip
                  key={opt}
                  label={opt}
                  size="small"
                  variant={symptomsTags.includes(opt) ? "filled" : "outlined"}
                  color={symptomsTags.includes(opt) ? "primary" : "default"}
                  onClick={() => toggleSymptom(opt)}
                  className="cursor-pointer select-none"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 其他备注 */}
        <Card variant="outlined" className="rounded-xl">
          <CardContent className="p-4 space-y-3">
            <Typography variant="subtitle2" className="font-semibold text-muted-foreground">
              其他备注
            </Typography>
            <TextField
              label="备注"
              multiline
              rows={3}
              fullWidth
              size="small"
              placeholder="今天的特别记录…"
              slotProps={{ inputLabel: { shrink: true } }}
              {...register("note")}
            />
          </CardContent>
        </Card>

        {/* 保存 */}
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          fullWidth
          className="h-11"
        >
          {isSubmitting ? "保存中…" : "保存"}
        </Button>
      </form>
    </div>
  );
}
