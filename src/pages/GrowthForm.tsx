import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/db";
import {
  Button,
  Card,
  CardContent,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";

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
  const [deleteOpen, setDeleteOpen] = useState(false);

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
            <TextField
              label="日期 *"
              type="date"
              fullWidth
              {...register("date")}
              error={!!errors.date}
              helperText={errors.date?.message}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="体重 (kg)"
              type="number"
              fullWidth
              inputProps={{ step: "0.01", inputMode: "decimal" }}
              placeholder="例如 4.50"
              {...register("weightKg")}
              error={!!errors.weightKg}
              helperText={errors.weightKg?.message}
            />

            <TextField
              label="身长 (cm)"
              type="number"
              fullWidth
              inputProps={{ step: "0.1", inputMode: "decimal" }}
              placeholder="例如 52.0"
              {...register("heightCm")}
              error={!!errors.heightCm}
              helperText={errors.heightCm?.message}
            />

            <TextField
              label="头围 (cm)"
              type="number"
              fullWidth
              inputProps={{ step: "0.1", inputMode: "decimal" }}
              placeholder="例如 35.0"
              {...register("headCm")}
              error={!!errors.headCm}
              helperText={errors.headCm?.message}
            />

            <TextField
              label="备注"
              multiline
              rows={3}
              fullWidth
              placeholder="可选备注..."
              {...register("note")}
            />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          {isEdit && (
            <>
              <IconButton onClick={() => setDeleteOpen(true)} className="flex-shrink-0">
                <Trash2 className="h-4 w-4 text-destructive" />
              </IconButton>
              <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
                <DialogTitle>确认删除</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    删除后无法恢复，确定要删除这条成长记录吗？
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setDeleteOpen(false)}>取消</Button>
                  <Button color="error" onClick={handleDelete}>删除</Button>
                </DialogActions>
              </Dialog>
            </>
          )}
          <Button type="submit" variant="contained" className="flex-1 rounded-full" disabled={isSubmitting}>
            {isEdit ? "更新" : "保存"}
          </Button>
        </div>
      </form>
    </div>
  );
}
