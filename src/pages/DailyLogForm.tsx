import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import { db } from "@/db";
import { SYMPTOM_OPTIONS } from "@/lib/constants";
import { PageHeader } from "@/components/PageHeader";

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
  const [deleteOpen, setDeleteOpen] = useState(false);

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
            <IconButton
              color="error"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </IconButton>
          ) : undefined
        }
      />

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            删除后无法恢复，确定要删除这条记录吗？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>取消</Button>
          <Button variant="contained" color="error" onClick={onDelete}>
            删除
          </Button>
        </DialogActions>
      </Dialog>

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 space-y-5">
        {/* Date */}
        <TextField
          label="日期"
          type="date"
          fullWidth
          size="small"
          disabled={isEdit}
          slotProps={{ inputLabel: { shrink: true } }}
          error={!!errors.date}
          helperText={errors.date?.message}
          {...register("date")}
        />

        {/* Milk row */}
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="喂奶次数"
            type="number"
            fullWidth
            size="small"
            slotProps={{ htmlInput: { min: 0 } }}
            {...register("milkTimes")}
          />
          <TextField
            label="总奶量 (ml)"
            type="number"
            fullWidth
            size="small"
            slotProps={{ htmlInput: { min: 0 } }}
            {...register("milkTotalMl")}
          />
        </div>

        {/* Poop & Pee row */}
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="便便次数"
            type="number"
            fullWidth
            size="small"
            slotProps={{ htmlInput: { min: 0 } }}
            {...register("poopTimes")}
          />
          <TextField
            label="尿尿次数"
            type="number"
            fullWidth
            size="small"
            slotProps={{ htmlInput: { min: 0 } }}
            {...register("peeTimes")}
          />
        </div>

        {/* Sleep */}
        <TextField
          label="睡眠时长 (小时)"
          type="number"
          fullWidth
          size="small"
          slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
          {...register("sleepHours")}
        />

        {/* Symptoms */}
        <div className="space-y-2">
          <Typography variant="body2" className="font-medium">
            症状标记
          </Typography>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_OPTIONS.map((opt) => (
              <Chip
                key={opt}
                label={opt}
                size="small"
                variant={symptomsTags.includes(opt) ? "filled" : "outlined"}
                color={symptomsTags.includes(opt) ? "primary" : "default"}
                onClick={() => toggleSymptom(opt)}
                className="cursor-pointer select-none"
              />
            ))}
          </div>
        </div>

        {/* Note */}
        <TextField
          label="备注"
          multiline
          rows={3}
          fullWidth
          size="small"
          placeholder="今天的特别记录…"
          {...register("note")}
        />

        {/* Submit */}
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          fullWidth
          className="h-11"
        >
          {isSubmitting ? "保存中…" : "保存"}
        </Button>
      </form>
    </div>
  );
}
