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
import {
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";

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
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="rounded-xl">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground">宝宝信息</h3>

              <TextField
                label="姓名 *"
                fullWidth
                placeholder="宝宝的名字"
                {...register("name")}
                error={!!errors.name}
                helperText={errors.name?.message}
              />

              <TextField
                label="昵称"
                fullWidth
                placeholder="宝宝的小名"
                {...register("nickname")}
              />

              <TextField
                label="出生日期 *"
                type="date"
                fullWidth
                {...register("birthDate")}
                error={!!errors.birthDate}
                helperText={errors.birthDate?.message}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="出生时间"
                type="time"
                fullWidth
                {...register("birthTime")}
                InputLabelProps={{ shrink: true }}
              />

              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="性别"
                    fullWidth
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <MenuItem value="">
                      <em>未选择</em>
                    </MenuItem>
                    <MenuItem value="male">男</MenuItem>
                    <MenuItem value="female">女</MenuItem>
                  </TextField>
                )}
              />

              <Button type="submit" variant="contained" fullWidth className="rounded-full" disabled={isSubmitting}>
                保存信息
              </Button>
            </CardContent>
          </Card>
        </form>

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
