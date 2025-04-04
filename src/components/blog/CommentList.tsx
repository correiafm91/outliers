
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ThumbsUp, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
}

export function CommentList({ comments, onCommentDelete }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Ainda não há comentários. Seja o primeiro a comentar!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
  
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Mais ações</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    Excluir comentário
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          <div className="mt-2">
            <p className="text-sm">{comment.content}</p>
          </div>
          
          <div className="mt-4 flex items-center">
            <Button variant="ghost" size="sm" onClick={handleLike} className={isLiked ? "text-primary" : ""}>
              <ThumbsUp className="mr-1 h-4 w-4" />
              <span>{likeCount}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
