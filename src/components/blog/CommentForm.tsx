
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
}

export function CommentForm({ articleId, authorId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, profile } = useAuth();

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
      // Add the comment with likes field initialized to 0
      const { error } = await supabase
        .from("comments")
        .insert({
          article_id: articleId,
          author_id: user.id,
          content: content.trim(),
          likes: 0 // Initialize with zero likes
        });

      if (error) throw error;

      // Only try to create notification if the author is not the same as the commenter
      if (user.id !== authorId) {
        try {
          // Create a notification for the comment
          await supabase
            .from("notifications")
            .insert({
              user_id: authorId,
              actor_id: user.id,
              type: 'comment',
              article_id: articleId,
              read: false
            });
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
