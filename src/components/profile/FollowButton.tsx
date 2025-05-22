
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

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
  // Don't show follow button for any profile
  return null;
}
