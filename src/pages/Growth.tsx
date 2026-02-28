import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Plus, Ruler } from "lucide-react";
import { db } from "@/db";
import { Button, Card, CardContent } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";

export default function Growth() {
  const navigate = useNavigate();
  const records = useLiveQuery(() =>
    db.growthRecords.orderBy("date").reverse().toArray(),
  );

  return (
    <div className="pb-24">
      <PageHeader
        title="成长记录"
        action={
          <Button component={Link} to="/growth/new" size="small" variant="contained" className="rounded-full gap-1">
            <Plus className="h-4 w-4" />
            添加
          </Button>
        }
      />

      <div className="px-4 space-y-2">
        {records === undefined ? null : records.length === 0 ? (
          <EmptyState
            icon={<Ruler className="h-10 w-10" />}
            title="还没有成长记录"
            description="记录宝宝的体重、身长和头围"
            action={
              <Button component={Link} to="/growth/new" size="small" variant="contained" className="rounded-full">
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
              onClick={() => navigate(`/growth/${r.id}/edit`)}
            >
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1.5">
                  {format(new Date(r.date + "T00:00:00"), "yyyy年M月d日")}
                </p>
                <div className="flex gap-4 text-sm">
                  {r.weightKg != null && (
                    <span>
                      体重{" "}
                      <span className="font-semibold text-orange-600">
                        {r.weightKg}
                      </span>{" "}
                      kg
                    </span>
                  )}
                  {r.heightCm != null && (
                    <span>
                      身长{" "}
                      <span className="font-semibold text-green-600">
                        {r.heightCm}
                      </span>{" "}
                      cm
                    </span>
                  )}
                  {r.headCm != null && (
                    <span>
                      头围{" "}
                      <span className="font-semibold text-blue-600">
                        {r.headCm}
                      </span>{" "}
                      cm
                    </span>
                  )}
                </div>
                {r.note && (
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">
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
