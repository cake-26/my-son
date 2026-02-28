import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/db";
import {
  Button,
  Card,
  CardContent,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";

const schema = z.object({
  date: z.string().min(1, "请选择日期"),
  title: z.string().min(1, "请输入里程碑标题"),
  description: z.string(),
  tagsStr: z.string(),
});

type FormData = z.infer<typeof schema>;

export default function MilestoneForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      title: "",
      description: "",
      tagsStr: "",
    },
  });

  useEffect(() => {
    if (!id) return;
    db.milestones.get(Number(id)).then((r) => {
      if (!r) return navigate("/milestones", { replace: true });
      reset({
        date: r.date,
        title: r.title,
        description: r.description,
        tagsStr: r.tags.join(", "),
      });
    });
  }, [id, reset, navigate]);

  const onSubmit = async (data: FormData) => {
    const tags = data.tagsStr
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const record = {
      date: data.date,
      title: data.title,
      description: data.description || "",
      tags,
    };

    if (isEdit) {
      await db.milestones.update(Number(id), record);
      toast.success("已更新");
    } else {
      await db.milestones.add(record);
      toast.success("已保存");
    }
    navigate("/milestones", { replace: true });
  };

  const handleDelete = async () => {
    await db.milestones.delete(Number(id));
    toast.success("已删除");
    navigate("/milestones", { replace: true });
  };

  return (
    <div className="pb-24">
      <PageHeader
        title={isEdit ? "编辑里程碑" : "新增里程碑"}
        onBack={() => navigate("/milestones")}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 space-y-4">
        <Card className="rounded-xl">
          <CardContent className="p-4 space-y-4">
            <TextField
              label="日期 *"
              type="date"
              fullWidth
              {...register("date")}
              error={!!errors.date}
              helperText={errors.date?.message}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="里程碑标题 *"
              fullWidth
              placeholder="例如 第一次翻身"
              {...register("title")}
              error={!!errors.title}
              helperText={errors.title?.message}
            />

            <TextField
              label="详细描述"
              multiline
              rows={3}
              fullWidth
              placeholder="记录这个重要时刻..."
              {...register("description")}
            />

            <TextField
              label="标签（逗号分隔）"
              fullWidth
              placeholder="例如 大运动, 精细动作"
              {...register("tagsStr")}
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
                    删除后无法恢复，确定要删除这条里程碑吗？
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
