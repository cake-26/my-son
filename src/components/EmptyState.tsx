import { Typography, Box } from "@mui/material";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Box className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <Box sx={{ color: "text.secondary", mb: 2 }}>{icon}</Box>
      <Typography variant="subtitle1" fontWeight={500}>{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 240 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 2.5 }}>{action}</Box>}
    </Box>
  );
}
