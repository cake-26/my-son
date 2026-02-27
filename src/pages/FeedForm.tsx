import { useEffect } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
              <div className="flex flex-col gap-2">
                <Label htmlFor="datetime">时间</Label>
                <Input id="datetime" type="datetime-local" {...register("datetime")} />
                {errors.datetime && (
                  <p className="text-sm text-destructive">{errors.datetime.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>类型</Label>
                <Select
                  value={watch("type") ?? ""}
                  onValueChange={(v) => setValue("type", v as any, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {FEED_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="amountMl">奶量(ml)</Label>
                  <Input
                    id="amountMl"
                    type="number"
                    min={0}
                    placeholder="可选"
                    {...register("amountMl")}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="durationMin">时长(分钟)</Label>
                  <Input
                    id="durationMin"
                    type="number"
                    min={0}
                    placeholder="可选"
                    {...register("durationMin")}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>侧边</Label>
                <Select
                  value={watch("side")}
                  onValueChange={(v) => setValue("side", v as any, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择侧边" />
                  </SelectTrigger>
                  <SelectContent>
                    {FEED_SIDES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="spitUp">吐奶</Label>
                <Switch
                  id="spitUp"
                  checked={watch("spitUp")}
                  onCheckedChange={(v) => setValue("spitUp", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="burpOk">拍嗝成功</Label>
                <Switch
                  id="burpOk"
                  checked={watch("burpOk")}
                  onCheckedChange={(v) => setValue("burpOk", v)}
                />
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
