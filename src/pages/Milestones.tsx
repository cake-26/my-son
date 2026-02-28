import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Plus, Star } from "lucide-react";
import { db } from "@/db";
import { Button, Card, CardContent, Chip } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";

export default function Milestones() {
  const navigate = useNavigate();
  const records = useLiveQuery(() =>
    db.milestones.orderBy("date").reverse().toArray(),
  );

  return (
    <div className="pb-24">
      <PageHeader
        title="里程碑"
        action={
          <Button component={Link} to="/milestones/new" size="small" variant="contained" className="rounded-full gap-1">
            <Plus className="h-4 w-4" />
            添加
          </Button>
        }
      />

      <div className="px-4 space-y-2">
        {records === undefined ? null : records.length === 0 ? (
          <EmptyState
            icon={<Star className="h-10 w-10" />}
            title="还没有里程碑"
            description="记录宝宝的每一个第一次"
            action={
              <Button component={Link} to="/milestones/new" size="small" variant="contained" className="rounded-full">
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
              onClick={() => navigate(`/milestones/${r.id}/edit`)}
            >
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">
                  {format(new Date(r.date + "T00:00:00"), "yyyy年M月d日")}
                </p>
                <p className="font-semibold text-sm">{r.title}</p>
                {r.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {r.description}
                  </p>
                )}
                {r.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
