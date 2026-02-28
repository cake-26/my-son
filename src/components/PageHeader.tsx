import { Typography, IconButton, Box } from "@mui/material";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  onBack?: () => void;
}

export function PageHeader({ title, subtitle, action, onBack }: PageHeaderProps) {
  return (
    <Box
      component="header"
      className="sticky top-0 z-10 px-4 py-3"
      sx={{ bgcolor: "rgba(255,247,237,0.8)", backdropFilter: "blur(8px)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 min-w-0">
          {onBack && (
            <IconButton size="small" onClick={onBack} sx={{ ml: -1 }}>
              <ChevronLeft size={20} />
            </IconButton>
          )}
          <div className="min-w-0">
            <Typography variant="h6" fontWeight={600} noWrap sx={{ lineHeight: 1.3, fontSize: "1.1rem" }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {subtitle}
              </Typography>
            )}
          </div>
        </div>
        {action && <div className="flex-shrink-0 ml-3">{action}</div>}
      </div>
    </Box>
  );
}
