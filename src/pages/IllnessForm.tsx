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

const schema = z.object({
  date: z.string().min(1, "请选择日期"),
  symptoms: z.string().min(1, "请输入症状描述"),
  medicines: z.string(),
  dosage: z.string(),
  doctor: z.string(),
  note: z.string(),
});

type FormData = z.infer<typeof schema>;

export default function IllnessForm() {
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
      symptoms: "",
      medicines: "",
      dosage: "",
      doctor: "",
      note: "",
    },
  });

  useEffect(() => {
    if (!id) return;
    db.illnessRecords.get(Number(id)).then((r) => {
      if (!r) return navigate("/illness", { replace: true });
      reset({
        date: r.date,
        symptoms: r.symptoms,
        medicines: r.medicines,
        dosage: r.dosage,
        doctor: r.doctor,
        note: r.note,
      });
    });
  }, [id, reset, navigate]);

  const onSubmit = async (data: FormData) => {
    const record = {
      date: data.date,
      symptoms: data.symptoms,
      medicines: data.medicines || "",
      dosage: data.dosage || "",
      doctor: data.doctor || "",
      note: data.note || "",
    };

    if (isEdit) {
      await db.illnessRecords.update(Number(id), record);
      toast.success("已更新");
    } else {
      await db.illnessRecords.add(record);
      toast.success("已保存");
    }
    navigate("/illness", { replace: true });
  };

  const handleDelete = async () => {
    await db.illnessRecords.delete(Number(id));
    toast.success("已删除");
    navigate("/illness", { replace: true });
  };

  return (
    <div className="pb-24">
      <PageHeader
        title={isEdit ? "编辑生病用药记录" : "新增生病用药记录"}
        onBack={() => navigate("/illness")}
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
              label="症状描述 *"
              fullWidth
              placeholder="例如：发烧 38.5°C，流鼻涕"
              InputLabelProps={{ shrink: true }}
              {...register("symptoms")}
              error={!!errors.symptoms}
              helperText={errors.symptoms?.message}
            />

            <TextField
              label="药物名称"
              fullWidth
              placeholder="例如：布洛芬、小儿氨酚黄那敏"
              InputLabelProps={{ shrink: true }}
              {...register("medicines")}
            />

            <TextField
              label="用药剂量 / 频次"
              fullWidth
              placeholder="例如：5ml，每日三次"
              InputLabelProps={{ shrink: true }}
              {...register("dosage")}
            />

            <TextField
              label="就诊医生"
              fullWidth
              placeholder="医生姓名或科室"
              InputLabelProps={{ shrink: true }}
              {...register("doctor")}
            />

            <TextField
              label="备注"
              multiline
              rows={3}
              fullWidth
              placeholder="其他注意事项..."
              InputLabelProps={{ shrink: true }}
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
                    删除后无法恢复，确定要删除这条记录吗？
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
