import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import {
  Calendar,
  TrendingUp,
  Syringe,
  Star,
  BookOpen,
  Database,
  ChevronRight,
} from "lucide-react";
import { db } from "@/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const schema = z.object({
  name: z.string().min(1, "请输入宝宝姓名"),
  nickname: z.string(),
  birthDate: z.string().min(1, "请选择出生日期"),
  birthTime: z.string(),
  gender: z.enum(["male", "female", ""]),
});

type FormData = z.infer<typeof schema>;

const NAV_LINKS = [
  { to: "/daily-log", icon: Calendar, label: "每日记录", color: "text-orange-500" },
  { to: "/growth", icon: TrendingUp, label: "成长记录", color: "text-green-500" },
  { to: "/vaccines", icon: Syringe, label: "疫苗记录", color: "text-blue-500" },
  { to: "/milestones", icon: Star, label: "里程碑", color: "text-amber-500" },
  { to: "/journal", icon: BookOpen, label: "育儿心得", color: "text-purple-500" },
  { to: "/backup", icon: Database, label: "备份管理", color: "text-gray-500" },
] as const;

export default function ProfilePage() {
  const navigate = useNavigate();
  const profile = useLiveQuery(() =>
    db.profiles.toArray().then((ps) => ps[0]),
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      nickname: "",
      birthDate: "",
      birthTime: "",
      gender: "",
    },
  });

  useEffect(() => {
    if (!profile) return;
    reset({
      name: profile.name,
      nickname: profile.nickname || "",
      birthDate: profile.birthDate,
      birthTime: profile.birthTime || "",
      gender: profile.gender || "",
    });
  }, [profile, reset]);

  const onSubmit = async (data: FormData) => {
    const record = {
      name: data.name,
      nickname: data.nickname || undefined,
      birthDate: data.birthDate,
      birthTime: data.birthTime || undefined,
      gender: (data.gender || undefined) as "male" | "female" | undefined,
    };

    if (profile?.id) {
      await db.profiles.put({ ...record, id: profile.id });
    } else {
      await db.profiles.add(record);
    }
    toast.success("已保存");
  };

  return (
    <div className="pb-24">
      <PageHeader title="我的" />

      <div className="px-4 space-y-4">
        {/* Profile Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="rounded-xl">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground">宝宝信息</h3>

              <div className="space-y-1.5">
                <Label htmlFor="name">姓名 *</Label>
                <Input id="name" placeholder="宝宝的名字" {...register("name")} />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nickname">昵称</Label>
                <Input id="nickname" placeholder="宝宝的小名" {...register("nickname")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="birthDate">出生日期 *</Label>
                <Input id="birthDate" type="date" {...register("birthDate")} />
                {errors.birthDate && (
                  <p className="text-xs text-destructive">{errors.birthDate.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="birthTime">出生时间</Label>
                <Input id="birthTime" type="time" {...register("birthTime")} />
              </div>

              <div className="space-y-1.5">
                <Label>性别</Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择性别（可选）" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">男</SelectItem>
                        <SelectItem value="female">女</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
                保存信息
              </Button>
            </CardContent>
          </Card>
        </form>

        {/* Navigation Links */}
        <Card className="rounded-xl overflow-hidden">
          <CardContent className="p-0">
            {NAV_LINKS.map((link, i) => (
              <button
                key={link.to}
                type="button"
                onClick={() => navigate(link.to)}
                className={`flex items-center gap-3 w-full px-4 py-3.5 text-left hover:bg-accent/50 transition-colors ${
                  i < NAV_LINKS.length - 1 ? "border-b" : ""
                }`}
              >
                <link.icon className={`h-5 w-5 ${link.color} flex-shrink-0`} />
                <span className="text-sm font-medium flex-1">{link.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
