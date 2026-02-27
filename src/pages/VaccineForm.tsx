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
  name: z.string().min(1, "请输入疫苗名称"),
  reaction: z.string(),
  note: z.string(),
});

type FormData = z.infer<typeof schema>;

export default function VaccineForm() {
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
      name: "",
      reaction: "",
      note: "",
    },
  });

  useEffect(() => {
    if (!id) return;
    db.vaccineRecords.get(Number(id)).then((r) => {
      if (!r) return navigate("/vaccines", { replace: true });
      reset({
        date: r.date,
        name: r.name,
        reaction: r.reaction,
        note: r.note,
      });
    });
  }, [id, reset, navigate]);

  const onSubmit = async (data: FormData) => {
    const record = {
      date: data.date,
      name: data.name,
      reaction: data.reaction || "",
      note: data.note || "",
    };

    if (isEdit) {
      await db.vaccineRecords.update(Number(id), record);
      toast.success("已更新");
    } else {
      await db.vaccineRecords.add(record);
      toast.success("已保存");
    }
    navigate("/vaccines", { replace: true });
  };

  const handleDelete = async () => {
    await db.vaccineRecords.delete(Number(id));
    toast.success("已删除");
    navigate("/vaccines", { replace: true });
  };

  return (
    <div className="pb-24">
      <PageHeader
        title={isEdit ? "编辑疫苗记录" : "新增疫苗记录"}
        onBack={() => navigate("/vaccines")}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 space-y-4">
        <Card className="rounded-xl">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="date">接种日期 *</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name">疫苗名称 *</Label>
              <Input
                id="name"
                placeholder="例如 乙肝疫苗第一针"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reaction">接种反应</Label>
              <Textarea
                id="reaction"
                placeholder="接种后有什么反应..."
                rows={3}
                {...register("reaction")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note">备注</Label>
              <Textarea
                id="note"
                placeholder="可选备注..."
                rows={3}
                {...register("note")}
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
                    删除后无法恢复，确定要删除这条疫苗记录吗？
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
