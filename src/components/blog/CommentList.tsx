import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash, Heart, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  likes: number;
}

interface CommentListProps {
  comments: Comment[];
  onCommentDelete: (commentId: string) => void;
  articleId: string;
}

export function CommentList({ comments, onCommentDelete, articleId }: CommentListProps) {
  const { user } = useAuth();
  const [likingStates, setLikingStates] = useState<Record<string, boolean>>({});
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  useEffect(() => {
    const initialLikedComments: Record<string, boolean> = {};
    comments.forEach(comment => {
      initialLikedComments[comment.id] = false;
    });
    setLikedComments(initialLikedComments);
  }, [comments]);

  const checkIfLiked = async (commentId: string) => {
    if (!user) return false;
    try {
      const { data, error } = await supabase
        .from("comment_likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("comment_id", commentId)
        .maybeSingle();

      if (error) {
        console.error("Error checking if comment is liked:", error);
        return false;
      }
      return !!data;
    } catch (error) {
      console.error("Error checking if comment is liked:", error);
      return false;
    }
  };

  const handleLikeComment = async (commentId: string, authorId: string) => {
    if (!user) {
      toast.error("Você precisa estar logado para curtir comentários");
      return;
    }

    setLikingStates(prev => ({ ...prev, [commentId]: true }));

    try {
      const isCurrentlyLiked = likedComments[commentId] || await checkIfLiked(commentId);

      if (isCurrentlyLiked) {
        // Unlike comment
        const { error } = await supabase
          .from("comment_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("comment_id", commentId);

        if (error) throw error;

        setLikedComments(prev => ({ ...prev, [commentId]: false }));
        setComments(prevComments =>
          prevComments.map(c =>
            c.id === commentId ? { ...c, likes: Math.max(0, c.likes - 1) } : c
          )
        );
      } else {
        // Like comment
        const { error } = await supabase
          .from("comment_likes")
          .insert({
            user_id: user.id,
            comment_id: commentId
          });

        if (error) throw error;

        setLikedComments(prev => ({ ...prev, [commentId]: true }));
        setComments(prevComments =>
          prevComments.map(c =>
            c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c
          )
        );

        // Create notification for like (if not the author)
        if (user.id !== authorId) {
          try {
            await supabase
              .from("notifications")
              .insert({
                user_id: authorId,
                actor_id: user.id,
                type: 'comment_like',
                article_id: articleId,
                comment_id: commentId,
                read: false
              });
          } catch (notifError) {
            console.error("Error creating notification:", notifError);
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar curtida no comentário");
    } finally {
      setLikingStates(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setDeletingCommentId(commentId);
    try {
      const { error: likeError } = await supabase
        .from("comment_likes")
        .delete()
        .eq("comment_id", commentId);

      if (likeError) throw likeError;

      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      onCommentDelete(commentId);
      toast.success("Comentário excluído com sucesso");
    } catch (error: any) {
      console.error("Erro ao excluir comentário:", error.message);
      toast.error("Não foi possível excluir o comentário");
    } finally {
      setDeletingCommentId(null);
    }
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Ainda não há comentários nesta publicação.</p>
        <p className="text-muted-foreground">Seja o primeiro a comentar!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={comment.author.avatar} />
            <AvatarFallback>{comment.author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{comment.author.name}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {format(new Date(comment.created_at), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
              
              {user && user.id === comment.author.id && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 text-destructive">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogTitle>Excluir comentário</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                    <div className="flex justify-end space-x-2 mt-4">
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingCommentId === comment.id}
                      >
                        {deletingCommentId === comment.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
            </div>
            
            <p className="text-sm">{comment.content}</p>
            
            {user && (
              <div className="flex items-center mt-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-8 px-2 ${likedComments[comment.id] ? 'text-red-500' : ''}`}
                  onClick={() => handleLikeComment(comment.id, comment.author.id)}
                  disabled={likingStates[comment.id]}
                >
                  <Heart className={`h-4 w-4 mr-1 ${likedComments[comment.id] ? 'fill-current' : ''}`} />
                  <span className="text-xs">{comment.likes > 0 ? comment.likes : ''}</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
