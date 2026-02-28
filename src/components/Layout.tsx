import { Outlet } from "react-router-dom";
import { TabBar } from "@/components/TabBar";
import { Toaster } from "sonner";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/lib/theme";

export function Layout() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative">
        <main className="flex-1 overflow-y-auto pb-20 no-scrollbar">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
        <TabBar />
        <Toaster position="top-center" richColors closeButton />
      </div>
    </ThemeProvider>
  );
}
