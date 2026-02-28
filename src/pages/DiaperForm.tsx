import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { db } from "@/db";
import { syncDailyLog } from "@/lib/daily-sync";
import { DIAPER_KINDS, POOP_TEXTURES, POOP_COLORS } from "@/lib/constants";
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

const diaperSchema = z.object({
  datetime: z.string().min(1, "请选择时间"),
  kind: z.enum(DIAPER_KINDS, { required_error: "请选择类型" }),
  poopTexture: z.enum(POOP_TEXTURES).optional().or(z.literal("")),
  poopColor: z.enum(POOP_COLORS).optional().or(z.literal("")),
  note: z.string(),
});

type DiaperFormData = z.infer<typeof diaperSchema>;

function nowLocal() {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm");
}

export default function DiaperForm() {
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
  } = useForm<DiaperFormData>({
    resolver: zodResolver(diaperSchema),
    defaultValues: {
      datetime: nowLocal(),
      kind: undefined,
      poopTexture: "",
      poopColor: "",
      note: "",
    },
  });

  useEffect(() => {
    if (!isEdit) return;
    db.diaperEvents.get(Number(id)).then((ev) => {
      if (!ev) return;
      reset({
        datetime: ev.datetime.slice(0, 16),
        kind: ev.kind,
        poopTexture: ev.poopTexture ?? "",
        poopColor: ev.poopColor ?? "",
        note: ev.note,
      });
    });
  }, [id, isEdit, reset]);

  const kindVal = watch("kind");
  const isPoop = kindVal === "便";

  const onSubmit = async (data: DiaperFormData) => {
    const payload = {
      datetime: data.datetime,
      kind: data.kind,
      poopTexture: isPoop && data.poopTexture !== "" ? data.poopTexture : undefined,
      poopColor: isPoop && data.poopColor !== "" ? data.poopColor : undefined,
      note: data.note,
    };

    if (isEdit) {
      await db.diaperEvents.update(Number(id), payload);
    } else {
      await db.diaperEvents.add(payload as any);
    }

    await syncDailyLog(data.datetime.slice(0, 10));
    toast.success("保存成功");
    navigate(-1);
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    const ev = await db.diaperEvents.get(Number(id));
    await db.diaperEvents.delete(Number(id));
    if (ev) await syncDailyLog(ev.datetime.slice(0, 10));
    toast.success("已删除");
    navigate(-1);
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <PageHeader title="排泄记录" onBack={() => navigate(-1)} />

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
                value={watch("kind") ?? ""}
                onChange={(e) => setValue("kind", e.target.value as any, { shouldValidate: true })}
                error={!!errors.kind}
                helperText={errors.kind?.message}
              >
                {DIAPER_KINDS.map((k) => (
                  <MenuItem key={k} value={k}>{k}</MenuItem>
                ))}
              </TextField>

              {isPoop && (
                <>
                  <TextField
                    select
                    label="质地"
                    value={watch("poopTexture") ?? ""}
                    onChange={(e) =>
                      setValue("poopTexture", e.target.value as any, { shouldValidate: true })
                    }
                  >
                    {POOP_TEXTURES.map((t) => (
                      <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="颜色"
                    value={watch("poopColor") ?? ""}
                    onChange={(e) =>
                      setValue("poopColor", e.target.value as any, { shouldValidate: true })
                    }
                  >
                    {POOP_COLORS.map((c) => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </TextField>
                </>
              )}

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
