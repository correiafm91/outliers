
import { useEffect } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const navigate = useNavigate();
  
  // Placeholder - will be replaced with Supabase auth
  const isAuthenticated = false;
  
  useEffect(() => {
    // Redirect to home if user is already authenticated
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center p-4">
        <AuthForm />
      </div>
    </div>
  );
}
