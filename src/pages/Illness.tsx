import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Plus, Stethoscope } from "lucide-react";
import { db } from "@/db";
import { Button, Card, CardContent } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";

export default function Illness() {
  const navigate = useNavigate();
  const records = useLiveQuery(() =>
    db.illnessRecords.orderBy("date").reverse().toArray(),
  );

  return (
    <div className="pb-24">
      <PageHeader
        title="生病用药"
        action={
          <Button component={Link} to="/illness/new" size="small" variant="contained" className="rounded-full gap-1">
            <Plus className="h-4 w-4" />
            添加
          </Button>
        }
      />

      <div className="px-4 space-y-2">
        {records === undefined ? null : records.length === 0 ? (
          <EmptyState
            icon={<Stethoscope className="h-10 w-10" />}
            title="还没有生病用药记录"
            description="记录宝宝生病和用药情况"
            action={
              <Button component={Link} to="/illness/new" size="small" variant="contained" className="rounded-full">
                <Plus className="h-4 w-4 mr-1" />
                新增记录
              </Button>
            }
          />
        ) : (
          records.map((r) => (
            <Card
              key={r.id}
              className="rounded-xl cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => navigate(`/illness/${r.id}/edit`)}
            >
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  {format(new Date(r.date + "T00:00:00"), "yyyy年M月d日")}
                </p>
                <p className="font-semibold text-sm">{r.symptoms}</p>
                {r.medicines && (
                  <p className="text-xs text-red-600 mt-1">
                    用药：{r.medicines}
                  </p>
                )}
                {r.dosage && (
                  <p className="text-xs text-muted-foreground mt-1">
                    剂量：{r.dosage}
                  </p>
                )}
                {r.note && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {r.note}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
