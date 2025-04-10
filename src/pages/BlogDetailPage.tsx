import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CommentForm } from "@/components/blog/CommentForm";
import { CommentList, Comment } from "@/components/blog/CommentList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LikeButton } from "@/components/blog/LikeButton";
import { SaveArticleButton } from "@/components/saved/SaveArticleButton";
import { ShareButton } from "@/components/share/ShareButton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Article, Profile } from "@/types/profile";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
} from "@/components/ui/alert-dialog";

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [author, setAuthor] = useState<Profile | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchArticle();
      fetchComments();
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      if (!id) return;

      const { data: article, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setArticle(article as Article);

      const { data: author, error: authorError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", article.author_id)
        .single();

      if (authorError) throw authorError;

      setAuthor(author as Profile);
    } catch (error: any) {
      console.error("Erro ao carregar artigo:", error.message);
      toast.error("Não foi possível carregar o artigo");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      if (!id) return;

      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          author:profiles(*)
        `)
        .eq("article_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const formattedComments = data.map((item: any) => ({
        id: item.id,
        author: {
          id: item.author.id,
          name: item.author.username,
          avatar: item.author.avatar_url || '',
        },
        content: item.content,
        created_at: item.created_at,
        likes: item.likes || 0,
      }));

      setComments(formattedComments);
    } catch (error: any) {
      console.error("Erro ao carregar comentários:", error.message);
    }
  };

  const handleCommentAdded = () => {
    fetchComments();
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  const handleDeleteArticle = async () => {
    try {
      if (!article || !user) return;
      
      if (user.id !== article.author_id) {
        toast.error("Você não tem permissão para excluir esta publicação");
        return;
      }
      
      setDeleteLoading(true);
      
      const { error: savedArticlesError } = await supabase
        .from("saved_articles")
        .delete()
        .eq("article_id", article.id);
        
      if (savedArticlesError) throw savedArticlesError;
      
      const { error: likesError } = await supabase
        .from("likes")
        .delete()
        .eq("article_id", article.id);
      
      if (likesError) throw likesError;
      
      const { data: articleComments, error: commentsQueryError } = await supabase
        .from("comments")
        .select("id")
        .eq("article_id", article.id);
        
      if (commentsQueryError) throw commentsQueryError;
      
      if (articleComments && articleComments.length > 0) {
        const commentIds = articleComments.map(comment => comment.id);
        
        const { error: commentLikesError } = await supabase
          .from("comment_likes")
          .delete()
          .in("comment_id", commentIds);
          
        if (commentLikesError) throw commentLikesError;
      }
      
      const { error: commentsError } = await supabase
        .from("comments")
        .delete()
        .eq("article_id", article.id);
        
      if (commentsError) throw commentsError;
      
      const { error: notificationsError } = await supabase
        .from("notifications")
        .delete()
        .eq("article_id", article.id);
      
      if (notificationsError) throw notificationsError;
      
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", article.id);
        
      if (error) throw error;
      
      toast.success("Publicação excluída com sucesso");
      navigate("/profile/" + user.id);
    } catch (error: any) {
      console.error("Erro ao excluir publicação:", error.message);
      toast.error("Erro ao excluir publicação: " + (error.message || "Ocorreu um erro"));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando publicação...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article || !author) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div>Publicação não encontrada</div>
        </main>
        <Footer />
      </div>
    );
  }

  const publishedDate = format(new Date(article.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <article className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleGoBack}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
          
          <header className="mb-8 animate-fade-in">
            <Badge variant="secondary" className="mb-4">{article.sector}</Badge>
            <h1 className="text-4xl font-bold mb-6">{article.title}</h1>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={author.avatar_url || undefined} alt={author.username} />
                  <AvatarFallback>{author.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex items-center">
                  <p className="font-medium">{author.username}</p>
                  {author.username === "Outliers Oficial" && (
                    <Badge variant="verified" className="ml-1">Verificado</Badge>
                  )}
                  <p className="text-sm text-muted-foreground ml-2">{publishedDate}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {user && user.id === article.author_id && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Excluir publicação</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <div className="flex flex-col space-y-2 text-center sm:text-left">
                        <AlertDialogTitle>Excluir publicação</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir esta publicação? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </div>
                      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteArticle}
                          disabled={deleteLoading}
                        >
                          {deleteLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Excluindo...
                            </>
                          ) : (
                            "Excluir"
                          )}
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <LikeButton articleId={article.id} authorId={article.author_id} />
                <SaveArticleButton articleId={article.id} />
                <ShareButton 
                  title={article.title}
                  id={article.id}
                  type="article"
                />
              </div>
            </div>
          </header>
          
          {article.image_url && (
            <div className="mb-10 animate-fade-in">
              <img 
                src={article.image_url} 
                alt={article.title} 
                className="w-full h-auto rounded-lg object-cover"
                style={article.aspect_ratio ? { aspectRatio: article.aspect_ratio.replace(':', '/') } : { aspectRatio: '16/9' }}
              />
            </div>
          )}
          
          {article.video_url && (
            <div className="mb-10 animate-fade-in">
              <video 
                src={article.video_url} 
                controls
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}
          
          <div className="prose prose-lg prose-invert max-w-none mb-12 whitespace-pre-line">
            {article.content}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-10">
            <Badge variant="outline">{article.sector}</Badge>
          </div>
          
          <div className="flex items-center justify-between border-t border-b border-border py-6 mb-10">
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground">Compartilhar:</span>
              <ShareButton 
                title={article.title}
                id={article.id}
                type="article"
              />
            </div>
            <div className="flex items-center space-x-4">
              <LikeButton articleId={article.id} authorId={article.author_id} showCount />
              <SaveArticleButton articleId={article.id} size="default">
                Salvar
              </SaveArticleButton>
            </div>
          </div>
          
          <section className="border-t border-border pt-10">
            <h2 className="text-2xl font-bold mb-6">Comentários</h2>
            {user ? (
              <CommentForm articleId={article.id} authorId={article.author_id} onCommentAdded={handleCommentAdded} />
            ) : (
              <div className="mb-6 text-center py-6 border border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">Faça login para deixar um comentário</p>
                <Button variant="link" onClick={() => window.location.href = '/auth'}>
                  Entrar
                </Button>
              </div>
            )}
            
            <div className="mt-12">
              <CommentList 
                comments={comments} 
                onCommentDelete={handleCommentDeleted} 
                articleId={article.id}
              />
            </div>
          </section>
        </article>
      </main>
      
      <Footer />
    </div>
  );
}
