
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Crops from "./pages/Crops";
import Production from "./pages/Production";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Contacts from "./pages/Contacts";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen w-full bg-background" dir="rtl">
            <AppSidebar />
            <div className="flex flex-col min-h-screen transition-all duration-300 ease-in-out mr-0 md:mr-64 peer-data-[state=collapsed]/sidebar:md:mr-14">
              <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-40">
                <div className="flex items-center gap-4">
                  <h1 className="text-lg font-semibold text-foreground">نظام إدارة معاصر الزيتون</h1>
                </div>
                <SidebarTrigger />
              </header>
              <main className="flex-1 overflow-auto p-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/crops" element={<Crops />} />
                  <Route path="/production" element={<Production />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
