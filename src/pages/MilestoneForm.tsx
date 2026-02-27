import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
            <div className="space-y-1.5">
              <Label htmlFor="date">日期 *</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title">里程碑标题 *</Label>
              <Input
                id="title"
                placeholder="例如 第一次翻身"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">详细描述</Label>
              <Textarea
                id="description"
                placeholder="记录这个重要时刻..."
                rows={3}
                {...register("description")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tagsStr">标签（逗号分隔）</Label>
              <Input
                id="tagsStr"
                placeholder="例如 大运动, 精细动作"
                {...register("tagsStr")}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          {isEdit && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="outline" size="icon" className="flex-shrink-0">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                  <AlertDialogDescription>
                    删除后无法恢复，确定要删除这条里程碑吗？
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    删除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button type="submit" className="flex-1 rounded-full" disabled={isSubmitting}>
            {isEdit ? "更新" : "保存"}
          </Button>
        </div>
      </form>
    </div>
  );
}
