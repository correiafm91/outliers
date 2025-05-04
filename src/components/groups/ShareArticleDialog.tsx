
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Share2, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Article {
  id: string;
  title: string;
  image_url: string | null;
  excerpt: string | null;
  created_at: string;
}

interface ShareArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
}

export function ShareArticleDialog({ open, onOpenChange, groupId }: ShareArticleDialogProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [sharingArticleId, setSharingArticleId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (open) {
      fetchArticles();
    }
  }, [open]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      
      // Get user authored articles
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, image_url, excerpt, created_at')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setArticles(data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Erro ao carregar publicações');
    } finally {
      setLoading(false);
    }
  };

  const handleShareArticle = async (articleId: string) => {
    if (!user) return;
    
    try {
      setSharing(true);
      setSharingArticleId(articleId);
      
      const { error } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          user_id: user.id,
          article_id: articleId
        });
        
      if (error) throw error;
      
      toast.success('Publicação compartilhada com sucesso!');
      onOpenChange(false);
    } catch (error) {
      console.error('Error sharing article:', error);
      toast.error('Erro ao compartilhar publicação');
    } finally {
      setSharing(false);
      setSharingArticleId(null);
    }
  };

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <Share2 className="h-5 w-5" /> Compartilhar publicação
            </span>
          </DialogTitle>
          <DialogDescription>
            Compartilhe uma das suas publicações com o grupo
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar publicações..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              {filteredArticles.length > 0 ? (
                <div className="space-y-3">
                  {filteredArticles.map((article) => (
                    <Card key={article.id} className="overflow-hidden">
                      <div className="flex">
                        {article.image_url && (
                          <div className="w-24 h-24 shrink-0">
                            <img 
                              src={article.image_url} 
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-3 flex-1">
                          <h3 className="font-medium line-clamp-2">{article.title}</h3>
                          {article.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {article.excerpt}
                            </p>
                          )}
                          <div className="mt-2">
                            <Button 
                              size="sm"
                              onClick={() => handleShareArticle(article.id)}
                              disabled={sharing && sharingArticleId === article.id}
                            >
                              {sharing && sharingArticleId === article.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <Share2 className="h-4 w-4 mr-1" />
                              )}
                              Compartilhar
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? "Nenhuma publicação encontrada com essa busca" 
                      : "Você não possui publicações para compartilhar"
                    }
                  </p>
                </div>
              )}
            </ScrollArea>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
