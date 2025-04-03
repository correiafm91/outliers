
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface LikeButtonProps {
  articleId: string;
  authorId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showCount?: boolean;
}

export function LikeButton({ 
  articleId, 
  authorId,
  variant = 'ghost', 
  size = 'default',
  showCount = true
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkIfLiked();
      getLikeCount();
    }
  }, [articleId, user]);

  const checkIfLiked = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("article_id", articleId)
        .maybeSingle();

      if (error) throw error;
      
      setIsLiked(!!data);
    } catch (error) {
      console.error("Erro ao verificar se artigo está curtido:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLikeCount = async () => {
    try {
      const { count, error } = await supabase
        .from("likes")
        .select("*", { count: "exact" })
        .eq("article_id", articleId);

      if (error) throw error;
      
      setLikeCount(count || 0);
    } catch (error) {
      console.error("Erro ao contar curtidas:", error);
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para curtir artigos");
      return;
    }

    try {
      setIsLoading(true);
      
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("user_id", user.id)
          .eq("article_id", articleId);

        if (error) throw error;
        
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        // Add like
        const { error } = await supabase
          .from("likes")
          .insert({
            user_id: user.id,
            article_id: articleId
          });

        if (error) throw error;
        
        setIsLiked(true);
        setLikeCount(prev => prev + 1);

        // Create notification for like (if not the author)
        if (user.id !== authorId) {
          try {
            await supabase
              .from("notifications")
              .insert({
                user_id: authorId,
                actor_id: user.id,
                type: 'like',
                article_id: articleId,
                read: false
              });
          } catch (notifError) {
            console.error("Erro ao criar notificação:", notifError);
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar curtida");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleLike}
      disabled={isLoading}
      className={`gap-2 ${isLiked ? "text-red-500" : ""}`}
    >
      <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
      {showCount && likeCount > 0 && likeCount}
    </Button>
  );
}
