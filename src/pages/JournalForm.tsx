import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/db";
import { MOOD_OPTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
            <div className="space-y-1.5">
              <Label htmlFor="datetime">时间 *</Label>
              <Input id="datetime" type="datetime-local" {...register("datetime")} />
              {errors.datetime && (
                <p className="text-xs text-destructive">{errors.datetime.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title">标题 *</Label>
              <Input id="title" placeholder="今天的主题..." {...register("title")} />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tagsStr">标签（逗号分隔）</Label>
              <Input
                id="tagsStr"
                placeholder="例如 睡眠, 喂养, 情绪"
                {...register("tagsStr")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mood">心情</Label>
              <Controller
                name="mood"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择心情（可选）" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOOD_OPTIONS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="context">触发场景 — 发生了什么</Label>
              <Textarea
                id="context"
                placeholder="描述发生了什么事情..."
                rows={3}
                {...register("context")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="action">我做了什么</Label>
              <Textarea
                id="action"
                placeholder="我的应对方式..."
                rows={3}
                {...register("action")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="result">结果如何</Label>
              <Textarea
                id="result"
                placeholder="最终结果..."
                rows={3}
                {...register("result")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="next">下次怎么做</Label>
              <Textarea
                id="next"
                placeholder="下次的改进计划..."
                rows={3}
                {...register("next")}
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
                    删除后无法恢复，确定要删除这篇心得吗？
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
