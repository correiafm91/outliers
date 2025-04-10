
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";

import IndexPage from "@/pages/Index";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/NotFound";
import BlogsPage from "@/pages/BlogsPage";
import BlogDetailPage from "@/pages/BlogDetailPage";
import ProfilePage from "@/pages/ProfilePage";
import NewArticlePage from "@/pages/NewArticlePage";
import EditArticlePage from "@/pages/EditArticlePage";
import SavedArticlesPage from "@/pages/SavedArticlesPage";
import SearchPage from "@/pages/SearchPage";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blog/:id" element={<BlogDetailPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/new-article" element={<NewArticlePage />} />
          <Route path="/edit-article/:id" element={<EditArticlePage />} />
          <Route path="/saved-articles" element={<SavedArticlesPage />} />
          <Route path="/saved" element={<SavedArticlesPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
