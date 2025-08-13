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
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <header className="h-14 border-b border-border bg-background flex items-center px-4">
                <SidebarTrigger />
                <div className="mr-4">
                  <h1 className="text-lg font-semibold">نظام إدارة معاصر الزيتون</h1>
                </div>
              </header>
              <main className="flex-1 overflow-auto">
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
