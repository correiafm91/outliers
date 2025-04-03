
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import BlogsPage from "./pages/BlogsPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import ProfilePage from "./pages/ProfilePage";
import NewArticlePage from "./pages/NewArticlePage";
import EditArticlePage from "./pages/EditArticlePage";
import SearchPage from "./pages/SearchPage";
import SavedArticlesPage from "./pages/SavedArticlesPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { state: { from: location.pathname } });
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  return user ? <>{children}</> : null;
};

// Brazilian time setter for all routes
const BrazilianTimeSetter = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Set Brazilian Portuguese for the app
    document.documentElement.lang = 'pt-BR';
    
    // Set the timezone using Intl
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
    
    console.log(`Horário atual em São Paulo: ${formatter.format(new Date())}`);
  }, []);

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrazilianTimeSetter>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/blogs" 
                element={
                  <ProtectedRoute>
                    <BlogsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/blog/:id" 
                element={
                  <ProtectedRoute>
                    <BlogDetailPage />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/profile/:id" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/saved-articles" 
                element={
                  <ProtectedRoute>
                    <SavedArticlesPage />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/new-article" 
                element={
                  <ProtectedRoute>
                    <NewArticlePage />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/edit-article/:id" 
                element={
                  <ProtectedRoute>
                    <EditArticlePage />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/search" 
                element={
                  <ProtectedRoute>
                    <SearchPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </BrazilianTimeSetter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
