import { useEffect } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

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
              <div className="flex flex-col gap-2">
                <Label htmlFor="start">开始时间</Label>
                <Input id="start" type="datetime-local" {...register("start")} />
                {errors.start && (
                  <p className="text-sm text-destructive">{errors.start.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="end">结束时间</Label>
                <Input id="end" type="datetime-local" {...register("end")} />
                {errors.end && (
                  <p className="text-sm text-destructive">{errors.end.message}</p>
                )}
              </div>

              {duration && (
                <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                  睡眠时长：{duration}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label>地点</Label>
                <Select
                  value={watch("place") ?? ""}
                  onValueChange={(v) => setValue("place", v as any, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择地点" />
                  </SelectTrigger>
                  <SelectContent>
                    {SLEEP_PLACES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.place && (
                  <p className="text-sm text-destructive">{errors.place.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>入睡方式</Label>
                <Select
                  value={watch("method") ?? ""}
                  onValueChange={(v) => setValue("method", v as any, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择方式" />
                  </SelectTrigger>
                  <SelectContent>
                    {SLEEP_METHODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.method && (
                  <p className="text-sm text-destructive">{errors.method.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="note">备注</Label>
                <Textarea id="note" placeholder="可选" rows={3} {...register("note")} />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  保存
                </Button>
                {isEdit && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="destructive">
                        删除
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                          删除后无法恢复，确定要删除这条记录吗？
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>确认删除</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
