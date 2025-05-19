
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DirectMessage } from '@/types/group';
import { Profile } from '@/types/profile';
import { ChatList } from '@/components/chat/ChatList';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatMessageInput } from '@/components/chat/ChatMessageInput';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Image, Loader2 } from 'lucide-react';

export default function ChatPage() {
  const { userId } = useParams<{ userId?: string }>();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageDialog, setImageDialog] = useState<string | null>(null);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Media query for mobile screens
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showList, setShowList] = useState(!userId || !isMobile);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowList(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setShowList(!userId);
    } else {
      setShowList(true);
    }
  }, [userId, isMobile]);

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchMessages();

      // Set up real-time subscription for new messages
      const channel = supabase
        .channel('direct_messages_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'direct_messages',
            filter: `sender_id=eq.${user?.id},receiver_id=eq.${user?.id},sender_id=eq.${userId},receiver_id=eq.${userId}`
          },
          () => {
            fetchMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchProfile = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data as Profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchMessages = async () => {
    if (!userId || !user) return;

    try {
      setLoading(true);

      // Fetch messages using RPC function
      const { data, error } = await supabase.rpc('get_conversation_messages', {
        current_user_id: user.id,
        other_user_id: userId
      });

      if (error) throw error;
      
      if (!data || !Array.isArray(data)) {
        console.error('Invalid data format from get_conversation_messages');
        setMessages([]);
        return;
      }

      // Get profile information for these messages
      const userIds = [...new Set([
        ...data.map((msg: DirectMessage) => msg.sender_id),
        ...data.map((msg: DirectMessage) => msg.receiver_id)
      ])];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      const profileMap = new Map<string, Profile>();
      if (profiles) {
        profiles.forEach(profile => {
          profileMap.set(profile.id, profile as Profile);
        });
      }

      // Enhance messages with profile information
      const messagesWithProfiles = data.map((msg: any) => ({
        ...msg,
        sender: profileMap.get(msg.sender_id),
        receiver: profileMap.get(msg.receiver_id)
      })) as DirectMessage[];

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBack = () => {
    setShowList(true);
  };

  const showUserChat = userId && (isMobile ? !showList : true);

  return (
    <div className="container mx-auto max-w-6xl p-0">
      <div className="flex h-[calc(100vh-4rem)] border rounded-md overflow-hidden">
        {/* Chat List */}
        {showList && (
          <div className={`${isMobile ? 'w-full' : 'w-80'} border-r bg-card`}>
            <ChatList />
          </div>
        )}
        
        {/* Chat Window */}
        {showUserChat ? (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-3 border-b flex items-center">
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="mr-2" 
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              
              {profile ? (
                <div className="flex items-center">
                  <Avatar className="h-9 w-9 mr-3">
                    <AvatarImage src={profile.avatar_url || ''} alt={profile.username} />
                    <AvatarFallback>
                      {profile.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{profile.username}</h3>
                    {profile.bio && (
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <Skeleton className="h-9 w-9 rounded-full mr-3" />
                  <div>
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-3 w-36 mt-1" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length > 0 ? (
                <div>
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isMyMessage={message.sender_id === user?.id}
                      onImageClick={imageUrl => setImageDialog(imageUrl)}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <Image className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="font-medium">Nenhuma mensagem</h3>
                  <p className="text-sm text-muted-foreground">
                    Comece a conversar agora
                  </p>
                </div>
              )}
            </div>
            
            {/* Message Input */}
            <ChatMessageInput 
              receiverId={userId}
              onMessageSent={fetchMessages}
            />
          </div>
        ) : !showList && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Image className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-medium">Selecione uma conversa</h2>
              <p className="text-muted-foreground mt-1">
                Escolha uma conversa existente ou inicie uma nova
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Image Preview Dialog */}
      <Dialog open={!!imageDialog} onOpenChange={() => setImageDialog(null)}>
        <DialogContent className="max-w-3xl">
          {imageDialog && (
            <img
              src={imageDialog}
              alt="Full size"
              className="w-full h-auto object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
