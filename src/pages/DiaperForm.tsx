import { useEffect } from "react";
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
                  value={watch("kind") ?? ""}
                  onValueChange={(v) => setValue("kind", v as any, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIAPER_KINDS.map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.kind && (
                  <p className="text-sm text-destructive">{errors.kind.message}</p>
                )}
              </div>

              {isPoop && (
                <>
                  <div className="flex flex-col gap-2">
                    <Label>质地</Label>
                    <Select
                      value={watch("poopTexture") ?? ""}
                      onValueChange={(v) =>
                        setValue("poopTexture", v as any, { shouldValidate: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="可选" />
                      </SelectTrigger>
                      <SelectContent>
                        {POOP_TEXTURES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>颜色</Label>
                    <Select
                      value={watch("poopColor") ?? ""}
                      onValueChange={(v) =>
                        setValue("poopColor", v as any, { shouldValidate: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="可选" />
                      </SelectTrigger>
                      <SelectContent>
                        {POOP_COLORS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

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
