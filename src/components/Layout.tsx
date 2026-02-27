import { Outlet } from "react-router-dom";
import { TabBar } from "@/components/TabBar";
import { Toaster } from "sonner";

export function Layout() {
  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-background relative">
      <main className="flex-1 overflow-y-auto pb-20 no-scrollbar">
        <div className="page-enter">
          <Outlet />
        </div>
      </main>
      <TabBar />
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}
