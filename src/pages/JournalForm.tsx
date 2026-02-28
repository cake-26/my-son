import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/db";
import { MOOD_OPTIONS } from "@/lib/constants";
import {
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";

const schema = z.object({
  datetime: z.string().min(1, "请选择时间"),
  title: z.string().min(1, "请输入标题"),
  tagsStr: z.string(),
  context: z.string(),
  action: z.string(),
  result: z.string(),
  next: z.string(),
  mood: z.string(),
});

type FormData = z.infer<typeof schema>;

export default function JournalForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      datetime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      title: "",
      tagsStr: "",
      context: "",
      action: "",
      result: "",
      next: "",
      mood: "",
    },
  });

  useEffect(() => {
    if (!id) return;
    db.journalEntries.get(Number(id)).then((r) => {
      if (!r) return navigate("/journal", { replace: true });
      reset({
        datetime: r.datetime.slice(0, 16),
        title: r.title,
        tagsStr: r.tags.join(", "),
        context: r.context,
        action: r.action,
        result: r.result,
        next: r.next,
        mood: r.mood || "",
      });
    });
  }, [id, reset, navigate]);

  const onSubmit = async (data: FormData) => {
    const tags = data.tagsStr
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const record = {
      datetime: new Date(data.datetime).toISOString(),
      title: data.title,
      tags,
      context: data.context || "",
      action: data.action || "",
      result: data.result || "",
      next: data.next || "",
      mood: data.mood || undefined,
    };

    if (isEdit) {
      await db.journalEntries.update(Number(id), record);
      toast.success("已更新");
    } else {
      await db.journalEntries.add(record);
      toast.success("已保存");
    }
    navigate("/journal", { replace: true });
  };

  const handleDelete = async () => {
    await db.journalEntries.delete(Number(id));
    toast.success("已删除");
    navigate("/journal", { replace: true });
  };

  return (
    <div className="pb-24">
      <PageHeader
        title={isEdit ? "编辑心得" : "写心得"}
        onBack={() => navigate("/journal")}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 space-y-4">
        <Card className="rounded-xl">
          <CardContent className="p-4 space-y-4">
            <TextField
              label="时间 *"
              type="datetime-local"
              fullWidth
              {...register("datetime")}
              error={!!errors.datetime}
              helperText={errors.datetime?.message}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="标题 *"
              fullWidth
              placeholder="今天的主题..."
              {...register("title")}
              error={!!errors.title}
              helperText={errors.title?.message}
            />

            <TextField
              label="标签（逗号分隔）"
              fullWidth
              placeholder="例如 睡眠, 喂养, 情绪"
              {...register("tagsStr")}
            />

            <Controller
              name="mood"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="心情"
                  fullWidth
                  value={field.value}
                  onChange={field.onChange}
                >
                  <MenuItem value="">
                    <em>无</em>
                  </MenuItem>
                  {MOOD_OPTIONS.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardContent className="p-4 space-y-4">
            <TextField
              label="触发场景 — 发生了什么"
              multiline
              rows={3}
              fullWidth
              placeholder="描述发生了什么事情..."
              {...register("context")}
            />

            <TextField
              label="我做了什么"
              multiline
              rows={3}
              fullWidth
              placeholder="我的应对方式..."
              {...register("action")}
            />

            <TextField
              label="结果如何"
              multiline
              rows={3}
              fullWidth
              placeholder="最终结果..."
              {...register("result")}
            />

            <TextField
              label="下次怎么做"
              multiline
              rows={3}
              fullWidth
              placeholder="下次的改进计划..."
              {...register("next")}
            />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          {isEdit && (
            <>
              <IconButton onClick={() => setDeleteOpen(true)} className="flex-shrink-0">
                <Trash2 className="h-4 w-4 text-destructive" />
              </IconButton>
              <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
                <DialogTitle>确认删除</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    删除后无法恢复，确定要删除这篇心得吗？
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setDeleteOpen(false)}>取消</Button>
                  <Button color="error" onClick={handleDelete}>删除</Button>
                </DialogActions>
              </Dialog>
            </>
          )}
          <Button type="submit" variant="contained" className="flex-1 rounded-full" disabled={isSubmitting}>
            {isEdit ? "更新" : "保存"}
          </Button>
        </div>
      </form>
    </div>
  );
}
