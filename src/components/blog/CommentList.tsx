
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ThumbsUp, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Comment {
  id: string;
  author: {
    id?: string;
    name: string;
    avatar: string;
  };
  content: string;
  created_at: string;
  likes: number;
}

interface CommentListProps {
  comments: Comment[];
  onCommentDelete?: (id: string) => void;
  articleId?: string; // Add article ID to refresh comments
}

export function CommentList({ comments, onCommentDelete, articleId }: CommentListProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Refresh component when articleId changes
  useEffect(() => {
    if (articleId) {
      setRefreshKey(prev => prev + 1);
    }
  }, [articleId]);

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Ainda não há comentários. Seja o primeiro a comentar!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" key={refreshKey}>
      {comments.map((comment) => (
        <CommentItem 
          key={comment.id} 
          comment={comment} 
          onDelete={onCommentDelete}
        />
      ))}
    </div>
  );
}

function CommentItem({ comment, onDelete }: { comment: Comment, onDelete?: (id: string) => void }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes || 0);
  const { user } = useAuth();
  
  // Check if comment is liked by current user
  useEffect(() => {
    if (user && comment.id) {
      checkIfLiked();
    }
  }, [user, comment.id]);
  
  const checkIfLiked = async () => {
    try {
      const { data, error } = await supabase
        .from("comment_likes")
        .select("*")
        .eq("comment_id", comment.id)
        .eq("user_id", user?.id)
        .maybeSingle();
        
      if (error) throw error;
      setIsLiked(!!data);
    } catch (error) {
      console.error("Error checking if comment is liked:", error);
    }
  };
  
  const handleLike = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para curtir comentários");
      return;
    }
    
    try {
      if (isLiked) {
        // Remove like
        await supabase
          .from("comment_likes")
          .delete()
          .eq("comment_id", comment.id)
          .eq("user_id", user.id);
          
        // Update comment likes count
        await supabase
          .from("comments")
          .update({ likes: Math.max(0, likeCount - 1) })
          .eq("id", comment.id);
          
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        // Add like
        await supabase
          .from("comment_likes")
          .insert({
            comment_id: comment.id,
            user_id: user.id
          });
          
        // Update comment likes count
        await supabase
          .from("comments")
          .update({ likes: likeCount + 1 })
          .eq("id", comment.id);
          
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
    }
  };
  
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', comment.id);
      
      if (error) throw error;
      
      toast.success("Comentário excluído com sucesso");
      if (onDelete) onDelete(comment.id);
    } catch (error: any) {
      console.error("Erro ao excluir comentário:", error.message);
      toast.error("Falha ao excluir comentário");
    }
  };

  // Verificar se o usuário é o autor ou se é um administrador
  const canDelete = user && (user.id === comment.author.id || user.email === "admin@example.com");
  
  const formattedDate = formatDistanceToNow(new Date(comment.created_at), { 
    addSuffix: true,
    locale: ptBR
  });

  return (
    <div className="p-4 bg-secondary/10 rounded-lg">
      <div className="flex items-start gap-4">
        <Avatar>
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback>
            {comment.author.name ? comment.author.name.slice(0, 2).toUpperCase() : "??"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{comment.author.name}</h4>
              <p className="text-xs text-muted-foreground">{formattedDate}</p>
            </div>
            
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Excluir comentário</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir comentário</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          
          <div className="mt-2">
            <p className="text-sm">{comment.content}</p>
          </div>
          
          <div className="mt-4 flex items-center">
            <Button variant="ghost" size="sm" onClick={handleLike} className={isLiked ? "text-primary" : ""}>
              <ThumbsUp className={`mr-1 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{likeCount}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
