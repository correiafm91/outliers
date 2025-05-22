
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FollowButton } from './FollowButton';
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Users } from "lucide-react";

interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower_profile?: Profile | null;
  following_profile?: Profile | null;
}

interface FollowersDialogProps {
  userId: string;
  followers: number;
  following: number;
  username?: string;
  trigger?: React.ReactNode;
  defaultTab?: 'followers' | 'following';
}

export function FollowersDialog({
  userId,
  followers,
  following,
  username,
  trigger,
  defaultTab = 'followers'
}: FollowersDialogProps) {
  const [followersList, setFollowersList] = useState<Follower[]>([]);
  const [followingList, setFollowingList] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchFollowers = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Get all followers
      const { data: followersData, error: followersError } = await supabase
        .from('followers')
        .select('id, follower_id, following_id, created_at')
        .eq('following_id', userId)
        .order('created_at', { ascending: false });
        
      if (followersError) throw followersError;
      
      // For each follower, get their profile
      const followersWithProfiles: Follower[] = [];
      for (const follower of followersData || []) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', follower.follower_id)
          .single();
          
        if (profileData) {
          followersWithProfiles.push({
            ...follower,
            follower_profile: profileData as Profile
          });
        }
      }
      
      setFollowersList(followersWithProfiles);
      
      // Get all following
      const { data: followingData, error: followingError } = await supabase
        .from('followers')
        .select('id, follower_id, following_id, created_at')
        .eq('follower_id', userId)
        .order('created_at', { ascending: false });
        
      if (followingError) throw followingError;
      
      // For each following, get their profile
      const followingWithProfiles: Follower[] = [];
      for (const following of followingData || []) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', following.following_id)
          .single();
          
        if (profileData) {
          followingWithProfiles.push({
            ...following,
            following_profile: profileData as Profile
          });
        }
      }
      
      setFollowingList(followingWithProfiles);
      
    } catch (error) {
      console.error("Error fetching follows:", error);
    } finally {
      setLoading(false);
    }
  };

  // Don't allow followers dialog for Outliers profile
  if (username === "Outliers Ofc") {
    return null;
  }

  return (
    <Dialog onOpenChange={(open) => {
      if (open) {
        fetchFollowers();
      }
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="link" className="text-muted-foreground hover:text-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{followers} seguidores • {following} seguindo</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Seguidores e Seguindo</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="followers">
              Seguidores ({followers})
            </TabsTrigger>
            <TabsTrigger value="following">
              Seguindo ({following})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="followers" className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : followersList.length > 0 ? (
              <div className="space-y-4">
                {followersList.map((follower) => (
                  <div key={follower.id} className="flex items-center justify-between">
                    <Link to={`/profile/${follower.follower_id}`} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage 
                          src={follower.follower_profile?.avatar_url || undefined} 
                          alt={follower.follower_profile?.username || ''}
                        />
                        <AvatarFallback>
                          {follower.follower_profile?.username?.slice(0, 2).toUpperCase() || '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{follower.follower_profile?.username || 'Usuário'}</p>
                      </div>
                    </Link>
                    {user && follower.follower_id !== user.id && follower.follower_profile?.username !== "Outliers Ofc" && (
                      <FollowButton 
                        userId={user.id} 
                        targetUserId={follower.follower_id} 
                        targetUsername={follower.follower_profile?.username}
                        variant="outline"
                        size="sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground p-4">
                Nenhum seguidor encontrado
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="following" className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : followingList.length > 0 ? (
              <div className="space-y-4">
                {followingList.map((following) => (
                  <div key={following.id} className="flex items-center justify-between">
                    <Link to={`/profile/${following.following_id}`} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage 
                          src={following.following_profile?.avatar_url || undefined} 
                          alt={following.following_profile?.username || ''}
                        />
                        <AvatarFallback>
                          {following.following_profile?.username?.slice(0, 2).toUpperCase() || '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{following.following_profile?.username || 'Usuário'}</p>
                      </div>
                    </Link>
                    {user && following.following_id !== user.id && following.following_profile?.username !== "Outliers Ofc" && (
                      <FollowButton 
                        userId={user.id} 
                        targetUserId={following.following_id} 
                        targetUsername={following.following_profile?.username}
                        variant="outline"
                        size="sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground p-4">
                Não está seguindo ninguém
              </p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
