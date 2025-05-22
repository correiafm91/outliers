
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Article } from '@/types/profile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser?: (user: any) => void;
}

export function UserSearchDialog({ open, onOpenChange }: UserSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && searchQuery) {
      searchArticles();
    }
  }, [searchQuery, open]);

  const searchArticles = async () => {
    if (!searchQuery.trim()) {
      setArticles([]);
      return;
    }

    setLoading(true);
    try {
      // Only search for Outliers publications
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .ilike('title', `%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setArticles(data as Article[]);
    } catch (error) {
      console.error('Error searching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectArticle = (articleId: string) => {
    navigate(`/blog/${articleId}`);
    onOpenChange(false);
    setSearchQuery('');
    setArticles([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pesquisar Publicações</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar publicações..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-1 max-h-72 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : articles.length > 0 ? (
            articles.map((article) => (
              <Button
                key={article.id}
                variant="ghost"
                className="w-full justify-start px-2 py-6"
                onClick={() => handleSelectArticle(article.id)}
              >
                <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                <span className="truncate">{article.title}</span>
              </Button>
            ))
          ) : searchQuery ? (
            <p className="text-center text-muted-foreground p-4">
              Nenhuma publicação encontrada
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
