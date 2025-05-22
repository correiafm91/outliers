
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface FollowButtonProps {
  userId: string;
  targetUserId: string;
  targetUsername?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  onFollowStateChange?: (isFollowing: boolean) => void;
}

export function FollowButton({
  userId,
  targetUserId,
  targetUsername,
  variant = 'default',
  size = 'default',
  onFollowStateChange
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (userId && targetUserId) {
      checkFollowStatus();
    }
  }, [userId, targetUserId]);

  const checkFollowStatus = async () => {
    if (!userId || !targetUserId) return;
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("followers")
        .select("*")
        .eq("follower_id", userId)
        .eq("following_id", targetUserId)
        .maybeSingle();

      if (error) throw error;
      
      setIsFollowing(!!data);
      if (onFollowStateChange) {
        onFollowStateChange(!!data);
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para seguir usuários");
      return;
    }

    // Don't allow following Outliers profile
    if (targetUsername === "Outliers Ofc") {
      toast.info("Não é possível seguir o perfil oficial Outliers");
      return;
    }

    try {
      setIsLoading(true);
      
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("followers")
          .delete()
          .eq("follower_id", userId)
          .eq("following_id", targetUserId);

        if (error) throw error;
        
        setIsFollowing(false);
        if (onFollowStateChange) {
          onFollowStateChange(false);
        }
        toast.success("Você deixou de seguir este usuário");
      } else {
        // Follow
        const { error } = await supabase
          .from("followers")
          .insert({
            follower_id: userId,
            following_id: targetUserId
          });

        if (error) throw error;
        
        setIsFollowing(true);
        if (onFollowStateChange) {
          onFollowStateChange(true);
        }
        
        // Create notification for the followed user
        try {
          await supabase
            .from("notifications")
            .insert({
              user_id: targetUserId,
              actor_id: userId,
              type: 'follow',
              read: false
            });
        } catch (notifError) {
          console.error("Error creating notification:", notifError);
        }
        
        toast.success("Você está seguindo este usuário");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar status de seguidor");
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show the button if it's the same user or if the target is Outliers
  if (userId === targetUserId || targetUsername === "Outliers Ofc") {
    return null;
  }

  return (
    <Button
      variant={isFollowing ? "outline" : variant}
      size={size}
      onClick={toggleFollow}
      disabled={isLoading}
      className="gap-2"
    >
      {isFollowing ? (
        <>
          <UserMinus className="h-4 w-4" />
          Deixar de seguir
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Seguir
        </>
      )}
    </Button>
  );
}
