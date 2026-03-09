import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SeasonProvider, useSeason } from "@/contexts/SeasonContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Queue from "./pages/Queue";
import Invoices from "./pages/Invoices";
import Customers from "./pages/Customers";
import Workers from "./pages/Workers";
import OilTrading from "./pages/OilTrading";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import LandingPage from "./pages/LandingPage";
import Seasons from "./pages/Seasons";
import SeasonSetup from "./pages/SeasonSetup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const SeasonGate = () => {
  const { activeSeason, loading } = useSeason();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <p className="text-muted-foreground text-lg">جارٍ التحميل...</p>
      </div>
    );
  }

  if (!activeSeason) {
    return <Navigate to="/seasons" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background" dir="rtl">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <HeaderBar />
          <main className="flex-1 overflow-auto p-6">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/queue" element={<Queue />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/workers" element={<Workers />} />
              <Route path="/oil-trading" element={<OilTrading />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const HeaderBar = () => {
  const { user, signOut } = useAuth();
  const { activeSeason } = useSeason();
  const navigate = useNavigate();

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">نظام إدارة معاصر الزيتون</h1>
        {activeSeason && (
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-accent text-sm px-3 py-1"
            onClick={() => navigate("/seasons")}
          >
            <Calendar className="h-3.5 w-3.5 me-1.5" />
            {activeSeason.name}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground hidden md:block">
          {user?.email}
        </span>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4 me-1" />
          خروج
        </Button>
        <SidebarTrigger />
      </div>
    </header>
  );
};

const ProtectedLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <p className="text-muted-foreground text-lg">جارٍ التحميل...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SeasonProvider>
      <Routes>
        <Route path="/seasons" element={<Seasons />} />
        <Route path="/seasons/new" element={<SeasonSetup />} />
        <Route path="/seasons/edit/:id" element={<SeasonSetup />} />
        <Route path="/*" element={<SeasonGate />} />
      </Routes>
    </SeasonProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
