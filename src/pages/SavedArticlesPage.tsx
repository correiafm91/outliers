
import { Navbar } from "@/components/layout/Navbar";
import { SavedArticles } from "@/components/saved/SavedArticles";
import { Footer } from "@/components/layout/Footer";

export default function SavedArticlesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-8">Artigos Salvos</h1>
        <SavedArticles />
      </div>
      <Footer />
    </div>
  );
}
