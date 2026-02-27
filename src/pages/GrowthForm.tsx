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

const schema = z
  .object({
    date: z.string().min(1, "请选择日期"),
    weightKg: z.coerce.number().min(0, "不能为负数").optional().or(z.literal("")),
    heightCm: z.coerce.number().min(0, "不能为负数").optional().or(z.literal("")),
    headCm: z.coerce.number().min(0, "不能为负数").optional().or(z.literal("")),
    note: z.string(),
  })
  .refine(
    (d) =>
      (d.weightKg !== "" && d.weightKg != null) ||
      (d.heightCm !== "" && d.heightCm != null) ||
      (d.headCm !== "" && d.headCm != null),
    { message: "请至少填写一项测量数据", path: ["weightKg"] },
  );

type FormData = z.infer<typeof schema>;

export default function GrowthForm() {
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
      weightKg: "",
      heightCm: "",
      headCm: "",
      note: "",
    },
  });

  useEffect(() => {
    if (!id) return;
    db.growthRecords.get(Number(id)).then((r) => {
      if (!r) return navigate("/growth", { replace: true });
      reset({
        date: r.date,
        weightKg: r.weightKg ?? "",
        heightCm: r.heightCm ?? "",
        headCm: r.headCm ?? "",
        note: r.note,
      });
    });
  }, [id, reset, navigate]);

  const onSubmit = async (data: FormData) => {
    const record = {
      date: data.date,
      weightKg: data.weightKg === "" ? undefined : Number(data.weightKg),
      heightCm: data.heightCm === "" ? undefined : Number(data.heightCm),
      headCm: data.headCm === "" ? undefined : Number(data.headCm),
      note: data.note || "",
    };

    if (isEdit) {
      await db.growthRecords.update(Number(id), record);
      toast.success("已更新");
    } else {
      await db.growthRecords.add(record);
      toast.success("已保存");
    }
    navigate("/growth", { replace: true });
  };

  const handleDelete = async () => {
    await db.growthRecords.delete(Number(id));
    toast.success("已删除");
    navigate("/growth", { replace: true });
  };

  return (
    <div className="pb-24">
      <PageHeader
        title={isEdit ? "编辑成长记录" : "新增成长记录"}
        onBack={() => navigate("/growth")}
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
              <Label htmlFor="weightKg">体重 (kg)</Label>
              <Input
                id="weightKg"
                type="number"
                step="0.01"
                inputMode="decimal"
                placeholder="例如 4.50"
                {...register("weightKg")}
              />
              {errors.weightKg && (
                <p className="text-xs text-destructive">
                  {errors.weightKg.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="heightCm">身长 (cm)</Label>
              <Input
                id="heightCm"
                type="number"
                step="0.1"
                inputMode="decimal"
                placeholder="例如 52.0"
                {...register("heightCm")}
              />
              {errors.heightCm && (
                <p className="text-xs text-destructive">
                  {errors.heightCm.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="headCm">头围 (cm)</Label>
              <Input
                id="headCm"
                type="number"
                step="0.1"
                inputMode="decimal"
                placeholder="例如 35.0"
                {...register("headCm")}
              />
              {errors.headCm && (
                <p className="text-xs text-destructive">
                  {errors.headCm.message}
                </p>
              )}
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
                    删除后无法恢复，确定要删除这条成长记录吗？
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
