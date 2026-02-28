import { useLiveQuery } from "dexie-react-hooks";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Plus, BookOpen, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { db } from "@/db";
import {
  Button,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
} from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";

export default function Journal() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const entries = useLiveQuery(() =>
    db.journalEntries.orderBy("datetime").reverse().toArray(),
  );

  const allTags = useMemo(() => {
    if (!entries) return [];
    const set = new Set<string>();
    entries.forEach((e) => e.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    if (!entries) return undefined;
    let list = entries;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((e) => e.title.toLowerCase().includes(q));
    }
    if (activeTag) {
      list = list.filter((e) => e.tags.includes(activeTag));
    }
    return list;
  }, [entries, search, activeTag]);

  return (
    <div className="pb-24">
      <PageHeader
        title="育儿心得"
        action={
          <Button component={Link} to="/journal/new" size="small" variant="contained" className="rounded-full gap-1">
            <Plus className="h-4 w-4" />
            添加
          </Button>
        }
      />

      <div className="px-4 space-y-3">
        <TextField
          placeholder="搜索标题..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search className="h-4 w-4 text-muted-foreground" />
              </InputAdornment>
            ),
          }}
        />

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant={activeTag === tag ? "filled" : "outlined"}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className="cursor-pointer"
              />
            ))}
          </div>
        )}

        {filtered === undefined ? null : filtered.length === 0 ? (
          entries?.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-10 w-10" />}
              title="还没有育儿心得"
              description="记录育儿路上的思考与成长"
              action={
                <Button component={Link} to="/journal/new" size="small" variant="contained" className="rounded-full">
                  <Plus className="h-4 w-4 mr-1" />
                  写心得
                </Button>
              }
            />
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              没有匹配的记录
            </p>
          )
        ) : (
          <div className="space-y-2">
            {filtered.map((e) => (
              <Card
                key={e.id}
                className="rounded-xl cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => navigate(`/journal/${e.id}/edit`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground mb-1">
                        {format(new Date(e.datetime), "yyyy年M月d日 HH:mm")}
                      </p>
                      <p className="font-semibold text-sm flex items-center gap-1.5">
                        {e.title}
                        {e.mood && <span className="text-base">{e.mood}</span>}
                      </p>
                    </div>
                  </div>
                  {e.context && (
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                      {e.context}
                    </p>
                  )}
                  {e.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {e.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
