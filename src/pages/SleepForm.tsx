import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, differenceInMinutes } from "date-fns";
import { toast } from "sonner";
import { db } from "@/db";
import { syncDailyLog } from "@/lib/daily-sync";
import { SLEEP_PLACES, SLEEP_METHODS } from "@/lib/constants";
import { PageHeader } from "@/components/PageHeader";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";

const sleepSchema = z
  .object({
    start: z.string().min(1, "请选择开始时间"),
    end: z.string().min(1, "请选择结束时间"),
    place: z.enum(SLEEP_PLACES, { required_error: "请选择地点" }),
    method: z.enum(SLEEP_METHODS, { required_error: "请选择方式" }),
    note: z.string(),
  })
  .refine((d) => !d.start || !d.end || d.end >= d.start, {
    message: "结束时间不能早于开始时间",
    path: ["end"],
  });

type SleepFormData = z.infer<typeof sleepSchema>;

function nowLocal() {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm");
}

function formatDuration(start: string, end: string) {
  const mins = differenceInMinutes(new Date(end), new Date(start));
  if (mins < 0) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}小时${m}分钟`;
}

export default function SleepForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SleepFormData>({
    resolver: zodResolver(sleepSchema),
    defaultValues: {
      start: nowLocal(),
      end: "",
      place: undefined,
      method: undefined,
      note: "",
    },
  });

  useEffect(() => {
    if (!isEdit) return;
    db.sleepEvents.get(Number(id)).then((ev) => {
      if (!ev) return;
      reset({
        start: ev.start.slice(0, 16),
        end: ev.end.slice(0, 16),
        place: ev.place,
        method: ev.method,
        note: ev.note,
      });
    });
  }, [id, isEdit, reset]);

  const startVal = watch("start");
  const endVal = watch("end");
  const duration = startVal && endVal ? formatDuration(startVal, endVal) : null;

  const onSubmit = async (data: SleepFormData) => {
    const payload = {
      start: data.start,
      end: data.end,
      place: data.place,
      method: data.method,
      note: data.note,
    };

    if (isEdit) {
      await db.sleepEvents.update(Number(id), payload);
    } else {
      await db.sleepEvents.add(payload as any);
    }

    await syncDailyLog(data.start.slice(0, 10));
    toast.success("保存成功");
    navigate(-1);
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    const ev = await db.sleepEvents.get(Number(id));
    await db.sleepEvents.delete(Number(id));
    if (ev) await syncDailyLog(ev.start.slice(0, 10));
    toast.success("已删除");
    navigate(-1);
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <PageHeader title="睡眠记录" onBack={() => navigate(-1)} />

      <div className="px-4 mt-2">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <TextField
                label="开始时间"
                type="datetime-local"
                {...register("start")}
                InputLabelProps={{ shrink: true }}
                error={!!errors.start}
                helperText={errors.start?.message}
              />

              <TextField
                label="结束时间"
                type="datetime-local"
                {...register("end")}
                InputLabelProps={{ shrink: true }}
                error={!!errors.end}
                helperText={errors.end?.message}
              />

              {duration && (
                <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                  睡眠时长：{duration}
                </div>
              )}

              <TextField
                select
                label="地点"
                value={watch("place") ?? ""}
                onChange={(e) => setValue("place", e.target.value as any, { shouldValidate: true })}
                error={!!errors.place}
                helperText={errors.place?.message}
              >
                {SLEEP_PLACES.map((p) => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="入睡方式"
                value={watch("method") ?? ""}
                onChange={(e) => setValue("method", e.target.value as any, { shouldValidate: true })}
                error={!!errors.method}
                helperText={errors.method?.message}
              >
                {SLEEP_METHODS.map((m) => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </TextField>

              <TextField
                label="备注"
                multiline
                rows={3}
                placeholder="可选"
                {...register("note")}
              />

              <div className="flex flex-col gap-2 pt-2">
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  保存
                </Button>
                {isEdit && (
                  <Button
                    type="button"
                    variant="contained"
                    color="error"
                    onClick={() => setDeleteOpen(true)}
                  >
                    删除
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>删除后无法恢复，确定要删除这条记录吗？</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>取消</Button>
          <Button color="error" onClick={handleDelete}>确认删除</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
