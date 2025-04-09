
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface LikeButtonProps {
  articleId: string;
  authorId: string;
  initialLikeCount?: number;
  initialLikedState?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showCount?: boolean;
}

export function LikeButton({ 
  articleId, 
  authorId,
  initialLikeCount = 0,
  initialLikedState = false,
  variant = 'ghost', 
  size = 'default',
  showCount = false
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLikedState);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load like state and count whenever component mounts or articleId/user changes
  useEffect(() => {
    if (articleId) {
      // Always get the like count, even if user isn't logged in
      getLikeCount();
      
      // Only check if the current user liked it if they're logged in
      if (user) {
        checkIfLiked();
      } else {
        // If user not logged in, we're not waiting for anything
        setIsLoading(false);
      }
    }
  }, [articleId, user]);

  const checkIfLiked = async () => {
    if (!user || !articleId) return;
    
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
      console.error("Error checking if article is liked:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLikeCount = async () => {
    if (!articleId) return;
    
    try {
      const { count, error } = await supabase
        .from("likes")
        .select("*", { count: "exact" })
        .eq("article_id", articleId);

      if (error) throw error;
      
      setLikeCount(count || 0);
    } catch (error) {
      console.error("Error counting likes:", error);
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para curtir artigos");
      return;
    }

    if (!articleId) return;

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
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        // Check if like already exists to prevent duplicate key error
        const { data: existingLike } = await supabase
          .from("likes")
          .select("id")
          .eq("user_id", user.id)
          .eq("article_id", articleId)
          .maybeSingle();
          
        if (!existingLike) {
          // Add like only if it doesn't exist
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
              console.error("Error creating notification:", notifError);
            }
          }
        } else {
          // Like already exists, just update the UI
          setIsLiked(true);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Error updating like");
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
