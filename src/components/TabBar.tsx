import { useLocation, useNavigate } from "react-router-dom";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import { Home, ClipboardList, TrendingUp, User } from "lucide-react";

const tabs = [
  { to: "/", label: "首页", icon: <Home size={22} /> },
  { to: "/records", label: "记录", icon: <ClipboardList size={22} /> },
  { to: "/growth", label: "成长", icon: <TrendingUp size={22} /> },
  { to: "/profile", label: "我的", icon: <User size={22} /> },
];

export function TabBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const currentIdx = tabs.findIndex(({ to }) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to)
  );

  return (
    <Paper
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50"
      elevation={3}
      sx={{ borderRadius: 0, pb: "env(safe-area-inset-bottom)" }}
    >
      <BottomNavigation
        value={currentIdx}
        onChange={(_, idx) => navigate(tabs[idx].to)}
        showLabels
      >
        {tabs.map((t) => (
          <BottomNavigationAction key={t.to} label={t.label} icon={t.icon} />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
