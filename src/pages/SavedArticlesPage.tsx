
import { Navbar } from "@/components/layout/Navbar";
import { SavedArticles } from "@/components/saved/SavedArticles";

export default function SavedArticlesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Artigos Salvos</h1>
        <SavedArticles />
      </div>
    </div>
  );
}
