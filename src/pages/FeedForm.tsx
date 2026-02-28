import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { db } from "@/db";
import { syncDailyLog } from "@/lib/daily-sync";
import { FEED_TYPES, FEED_SIDES } from "@/lib/constants";
import { PageHeader } from "@/components/PageHeader";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";

const feedSchema = z.object({
  datetime: z.string().min(1, "请选择时间"),
  type: z.enum(FEED_TYPES, { required_error: "请选择类型" }),
  amountMl: z.coerce.number().min(0).optional().or(z.literal("")),
  durationMin: z.coerce.number().min(0).optional().or(z.literal("")),
  side: z.enum(FEED_SIDES),
  spitUp: z.boolean(),
  burpOk: z.boolean(),
  note: z.string(),
});

type FeedFormData = z.infer<typeof feedSchema>;

function nowLocal() {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm");
}

export default function FeedForm() {
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
  } = useForm<FeedFormData>({
    resolver: zodResolver(feedSchema),
    defaultValues: {
      datetime: nowLocal(),
      type: undefined,
      amountMl: "",
      durationMin: "",
      side: "双",
      spitUp: false,
      burpOk: false,
      note: "",
    },
  });

  useEffect(() => {
    if (!isEdit) return;
    db.feedEvents.get(Number(id)).then((ev) => {
      if (!ev) return;
      reset({
        datetime: ev.datetime.slice(0, 16),
        type: ev.type,
        amountMl: ev.amountMl ?? "",
        durationMin: ev.durationMin ?? "",
        side: ev.side,
        spitUp: ev.spitUp,
        burpOk: ev.burpOk,
        note: ev.note,
      });
    });
  }, [id, isEdit, reset]);

  const onSubmit = async (data: FeedFormData) => {
    const payload = {
      datetime: data.datetime,
      type: data.type,
      amountMl: data.amountMl === "" ? undefined : Number(data.amountMl),
      durationMin: data.durationMin === "" ? undefined : Number(data.durationMin),
      side: data.side,
      spitUp: data.spitUp,
      burpOk: data.burpOk,
      note: data.note,
    };

    if (isEdit) {
      await db.feedEvents.update(Number(id), payload);
    } else {
      await db.feedEvents.add(payload as any);
    }

    await syncDailyLog(data.datetime.slice(0, 10));
    toast.success("保存成功");
    navigate(-1);
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    const ev = await db.feedEvents.get(Number(id));
    await db.feedEvents.delete(Number(id));
    if (ev) await syncDailyLog(ev.datetime.slice(0, 10));
    toast.success("已删除");
    navigate(-1);
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <PageHeader title="喂养记录" onBack={() => navigate(-1)} />

      <div className="px-4 mt-2">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <TextField
                label="时间"
                type="datetime-local"
                {...register("datetime")}
                InputLabelProps={{ shrink: true }}
                error={!!errors.datetime}
                helperText={errors.datetime?.message}
              />

              <TextField
                select
                label="类型"
                value={watch("type") ?? ""}
                onChange={(e) => setValue("type", e.target.value as any, { shouldValidate: true })}
                error={!!errors.type}
                helperText={errors.type?.message}
              >
                {FEED_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>

              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="奶量(ml)"
                  type="number"
                  inputProps={{ min: 0 }}
                  placeholder="可选"
                  {...register("amountMl")}
                />
                <TextField
                  label="时长(分钟)"
                  type="number"
                  inputProps={{ min: 0 }}
                  placeholder="可选"
                  {...register("durationMin")}
                />
              </div>

              <TextField
                select
                label="侧边"
                value={watch("side")}
                onChange={(e) => setValue("side", e.target.value as any, { shouldValidate: true })}
              >
                {FEED_SIDES.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>

              <FormControlLabel
                control={
                  <Switch
                    checked={watch("spitUp")}
                    onChange={(_, v) => setValue("spitUp", v)}
                  />
                }
                label="吐奶"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={watch("burpOk")}
                    onChange={(_, v) => setValue("burpOk", v)}
                  />
                }
                label="拍嗝成功"
              />

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
