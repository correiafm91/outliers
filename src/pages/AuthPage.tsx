
import { useEffect } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // Redirect to home if user is already authenticated
    if (user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  // Set Brazilian timezone
  useEffect(() => {
    document.documentElement.lang = 'pt-BR';
    document.title = 'Outliers - Login';
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="animate-pulse">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center p-4">
        <AuthForm />
      </div>
    </div>
  );
}
