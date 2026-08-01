import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AuthBranding from "@/components/auth/AuthBranding";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export type AuthView = "login" | "register" | "forgot-password";

const Auth = () => {
  const [view, setView] = useState<AuthView>("login");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Only same-origin relative paths are accepted as a post-login destination.
  const rawNext = params.get("next") ?? "";
  const nextPath = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "";
  const returnUrl = nextPath ? `${window.location.origin}${nextPath}` : window.location.origin;

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "خطأ في تسجيل الدخول", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم تسجيل الدخول بنجاح" });
      if (nextPath) window.location.href = nextPath;
      else navigate("/seasons");
    }
  };

  const handleRegister = async (data: {
    millName: string;
    ownerName: string;
    phone: string;
    email: string;
    password: string;
  }) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          display_name: data.ownerName,
          mill_name: data.millName,
          phone: data.phone,
        },
        emailRedirectTo: returnUrl,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "خطأ في إنشاء الحساب", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "تحقق من بريدك الإلكتروني لتأكيد الحساب",
      });
      setView("login");
    }
  };

  const handleForgotPassword = async (email: string) => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم الإرسال", description: "تحقق من بريدك الإلكتروني لإعادة تعيين كلمة المرور" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" dir="rtl">
      {/* Branding Panel */}
      <AuthBranding />

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full max-w-md">
          {view === "login" && (
            <LoginForm loading={loading} onSubmit={handleLogin} onNavigate={setView} />
          )}
          {view === "register" && (
            <RegisterForm loading={loading} onSubmit={handleRegister} onNavigate={setView} />
          )}
          {view === "forgot-password" && (
            <ForgotPasswordForm loading={loading} onSubmit={handleForgotPassword} onNavigate={setView} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
