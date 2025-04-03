
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CommentFormProps {
  articleId: string;
  authorId: string;
  onCommentAdded: () => void;
  postId?: string; // Add postId as an optional prop for backward compatibility
}

export function CommentForm({ articleId, authorId, onCommentAdded, postId }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, profile } = useAuth();
  
  // Use postId if provided (for backward compatibility)
  const actualArticleId = postId || articleId;

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("Por favor, escreva um comentário antes de enviar.");
      return;
    }

    if (!user) {
      toast.error("Você precisa estar logado para comentar.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Add the comment
      const { error } = await supabase
        .from("comments")
        .insert({
          article_id: actualArticleId,
          author_id: user.id,
          content: content.trim()
        });

      if (error) throw error;

      // Only try to create notification if the author is not the same as the commenter
      if (user.id !== authorId) {
        try {
          // Create a notification, but don't block the comment process if it fails
          const notificationData = {
            user_id: authorId,
            actor_id: user.id,
            type: 'comment',
            article_id: actualArticleId,
            read: false
          };
          
          // @ts-ignore - Workaround for TypeScript error
          const { error: notifError } = await supabase.from('notifications').insert(notificationData);
          
          if (notifError) {
            console.log("Erro ao criar notificação:", notifError);
          }
        } catch (notifError) {
          console.error("Erro ao criar notificação:", notifError);
          // Continue with the comment process even if notification fails
        }
      }

      // Reset form and refresh comments
      setContent("");
      onCommentAdded();
      toast.success("Comentário adicionado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar comentário");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <form onSubmit={handleCommentSubmit}>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {profile?.username?.slice(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
            </Avatar>
            <Textarea
              placeholder="Escreva um comentário..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 resize-none"
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting || !content.trim()}
            className="gap-2"
          >
            <Send className="h-4 w-4" /> 
            {isSubmitting ? "Enviando..." : "Comentar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
