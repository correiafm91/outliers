
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SavedArticle } from "@/types/profile";
import { useAuth } from "@/contexts/AuthContext";

export function SavedArticles() {
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSavedArticles();
    }
  }, [user]);

  const fetchSavedArticles = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("saved_articles")
        .select(`
          *,
          article:articles(*)
        `)
        .eq("user_id", user.id);

      if (error) throw error;

      setSavedArticles(data as SavedArticle[]);
    } catch (error: any) {
      console.error("Erro ao buscar artigos salvos:", error);
      toast.error("Erro ao carregar artigos salvos");
    } finally {
      setLoading(false);
    }
  };

  const removeSavedArticle = async (id: string) => {
    try {
      const { error } = await supabase
        .from("saved_articles")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSavedArticles(savedArticles.filter(item => item.id !== id));
      toast.success("Artigo removido dos salvos");
    } catch (error: any) {
      console.error("Erro ao remover artigo:", error);
      toast.error("Erro ao remover artigo dos salvos");
    }
  };

  if (loading) {
    return <p className="text-center py-8">Carregando artigos salvos...</p>;
  }

  if (savedArticles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum artigo salvo ainda.</p>
        <Button className="mt-4" onClick={() => navigate("/blogs")}>
          Explorar Artigos
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {savedArticles.map((saved) => (
        <Card key={saved.id} className="flex flex-col">
          {saved.article?.image_url && (
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={saved.article.image_url} 
                alt={saved.article.title}
                className="h-full w-full object-cover transition-all hover:scale-105"
              />
            </div>
          )}
          <CardHeader>
            <CardTitle className="line-clamp-2">{saved.article?.title}</CardTitle>
            <CardDescription>
              {new Date(saved.created_at).toLocaleDateString('pt-BR')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="line-clamp-3">{saved.article?.content}</p>
          </CardContent>
          <CardFooter className="flex justify-between mt-auto">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/blog/${saved.article?.id}`)}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Ler
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => removeSavedArticle(saved.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
