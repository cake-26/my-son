import { Link, useLocation } from "react-router-dom";
import { Home, ClipboardList, TrendingUp, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "首页", icon: Home },
  { to: "/records", label: "记录", icon: ClipboardList },
  { to: "/growth", label: "成长", icon: TrendingUp },
  { to: "/profile", label: "我的", icon: User },
] as const;

export function TabBar() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-lg border-t z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 text-[10px] transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
