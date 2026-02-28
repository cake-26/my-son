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
  name: z.string().min(1, "请输入疫苗名称"),
  reaction: z.string(),
  note: z.string(),
});

type FormData = z.infer<typeof schema>;

export default function VaccineForm() {
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
            <TextField
              label="接种日期 *"
              type="date"
              fullWidth
              {...register("date")}
              error={!!errors.date}
              helperText={errors.date?.message}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="疫苗名称 *"
              fullWidth
              placeholder="例如 乙肝疫苗第一针"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <TextField
              label="接种反应"
              multiline
              rows={3}
              fullWidth
              placeholder="接种后有什么反应..."
              {...register("reaction")}
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
                    删除后无法恢复，确定要删除这条疫苗记录吗？
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
