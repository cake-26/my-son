import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/db";
import { SYMPTOM_OPTIONS } from "@/lib/constants";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  milkTimes: z.coerce.number().min(0),
  milkTotalMl: z.coerce.number().min(0),
  poopTimes: z.coerce.number().min(0),
  peeTimes: z.coerce.number().min(0),
  sleepHours: z.coerce.number().min(0),
  note: z.string(),
});

type FormValues = z.infer<typeof schema>;

export default function DailyLogForm() {
  const { date: dateParam } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const isEdit = !!dateParam;
  const [symptomsTags, setSymptomsTags] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: dateParam ?? format(new Date(), "yyyy-MM-dd"),
      milkTimes: 0,
      milkTotalMl: 0,
      poopTimes: 0,
      peeTimes: 0,
      sleepHours: 0,
      note: "",
    },
  });

  useEffect(() => {
    if (!dateParam) return;
    db.dailyLogs.get(dateParam).then((log) => {
      if (!log) return;
      reset({
        date: log.date,
        milkTimes: log.milkTimes,
        milkTotalMl: log.milkTotalMl,
        poopTimes: log.poopTimes,
        peeTimes: log.peeTimes,
        sleepHours: log.sleepHours,
        note: log.note,
      });
      setSymptomsTags(log.symptomsTags);
    });
  }, [dateParam, reset]);

  function toggleSymptom(tag: string) {
    setSymptomsTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  async function onSubmit(data: FormValues) {
    await db.dailyLogs.put({
      ...data,
      symptomsTags,
    });
    toast.success("保存成功");
    navigate(-1);
  }

  async function onDelete() {
    if (!dateParam) return;
    await db.dailyLogs.delete(dateParam);
    toast.success("已删除");
    navigate(-1);
  }

  return (
    <div className="pb-24">
      <PageHeader
        title={isEdit ? "编辑记录" : "每日记录"}
        subtitle={dateParam}
        onBack={() => navigate(-1)}
        action={
          isEdit ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive">
                  <Trash2 className="h-4 w-4" />
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
                  <AlertDialogAction onClick={onDelete}>删除</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : undefined
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 space-y-5">
        {/* Date */}
        <div className="space-y-1.5">
          <Label htmlFor="date">日期</Label>
          <Input
            id="date"
            type="date"
            {...register("date")}
            disabled={isEdit}
            className="rounded-lg"
          />
          {errors.date && (
            <p className="text-xs text-destructive">{errors.date.message}</p>
          )}
        </div>

        {/* Milk row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="milkTimes">喂奶次数</Label>
            <Input
              id="milkTimes"
              type="number"
              min={0}
              {...register("milkTimes")}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="milkTotalMl">总奶量 (ml)</Label>
            <Input
              id="milkTotalMl"
              type="number"
              min={0}
              {...register("milkTotalMl")}
              className="rounded-lg"
            />
          </div>
        </div>

        {/* Poop & Pee row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="poopTimes">便便次数</Label>
            <Input
              id="poopTimes"
              type="number"
              min={0}
              {...register("poopTimes")}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="peeTimes">尿尿次数</Label>
            <Input
              id="peeTimes"
              type="number"
              min={0}
              {...register("peeTimes")}
              className="rounded-lg"
            />
          </div>
        </div>

        {/* Sleep */}
        <div className="space-y-1.5">
          <Label htmlFor="sleepHours">睡眠时长 (小时)</Label>
          <Input
            id="sleepHours"
            type="number"
            min={0}
            step={0.5}
            {...register("sleepHours")}
            className="rounded-lg"
          />
        </div>

        {/* Symptoms */}
        <div className="space-y-2">
          <Label>症状标记</Label>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_OPTIONS.map((opt) => (
              <Badge
                key={opt}
                variant={symptomsTags.includes(opt) ? "default" : "outline"}
                className="cursor-pointer select-none rounded-full px-3 py-1 text-xs transition-colors"
                onClick={() => toggleSymptom(opt)}
              >
                {opt}
              </Badge>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="space-y-1.5">
          <Label htmlFor="note">备注</Label>
          <Textarea
            id="note"
            rows={3}
            {...register("note")}
            placeholder="今天的特别记录…"
            className="rounded-lg resize-none"
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl h-11"
        >
          {isSubmitting ? "保存中…" : "保存"}
        </Button>
      </form>
    </div>
  );
}
