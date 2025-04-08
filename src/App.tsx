
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";

import Index from "@/pages/Index";
import BlogsPage from "@/pages/BlogsPage";
import BlogDetailPage from "@/pages/BlogDetailPage";
import ProfilePage from "@/pages/ProfilePage";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/NotFound";
import SearchPage from "@/pages/SearchPage";
import NewArticlePage from "@/pages/NewArticlePage";
import SavedArticlesPage from "@/pages/SavedArticlesPage";
import EditArticlePage from "@/pages/EditArticlePage";

import "./App.css";

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/blog/:id" element={<BlogDetailPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/new-article" element={<NewArticlePage />} />
            <Route path="/edit-article/:id" element={<EditArticlePage />} />
            <Route path="/saved-articles" element={<SavedArticlesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
