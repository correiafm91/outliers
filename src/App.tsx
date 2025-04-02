
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import BlogsPage from "./pages/BlogsPage";
import BlogDetailPage from "./pages/BlogDetailPage";

const queryClient = new QueryClient();

// This is a placeholder - will be replaced with Supabase auth
const isAuthenticated = true; // Set to true for now to test pages

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          
          <Route 
            path="/" 
            element={
              <AuthRoute>
                <Index />
              </AuthRoute>
            } 
          />
          
          <Route 
            path="/blogs" 
            element={
              <AuthRoute>
                <BlogsPage />
              </AuthRoute>
            } 
          />
          
          <Route 
            path="/blog/:id" 
            element={
              <AuthRoute>
                <BlogDetailPage />
              </AuthRoute>
            } 
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
