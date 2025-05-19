
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChatConversation, DirectMessage } from '@/types/group';
import { Profile } from '@/types/profile';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MessageCircle } from 'lucide-react';
import { UserSearchDialog } from './UserSearchDialog';

export function ChatList() {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get sent messages
      const { data: sentMessages, error: sentError } = await supabase
        .rpc('get_sent_messages_with_receivers', {
          user_id: user.id
        });

      // Get received messages
      const { data: receivedMessages, error: receivedError } = await supabase
        .rpc('get_received_messages_with_senders', {
          user_id: user.id
        });

      if (sentError) console.error("Error fetching sent messages:", sentError);
      if (receivedError) console.error("Error fetching received messages:", receivedError);

      // Fetch profiles for all users
      const userIds = new Set<string>();
      
      if (sentMessages && Array.isArray(sentMessages)) {
        sentMessages.forEach((msg: any) => userIds.add(msg.receiver_id));
      }
      
      if (receivedMessages && Array.isArray(receivedMessages)) {
        receivedMessages.forEach((msg: any) => userIds.add(msg.sender_id));
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', Array.from(userIds));

      const profileMap = new Map<string, Profile>();
      if (profiles) {
        profiles.forEach(profile => {
          profileMap.set(profile.id, profile as Profile);
        });
      }

      // Build conversations from sent and received messages
      const conversationsMap = new Map<string, ChatConversation>();

      // Process sent messages
      if (sentMessages && Array.isArray(sentMessages)) {
        sentMessages.forEach((msg: any) => {
          const profile = profileMap.get(msg.receiver_id);
          if (!profile) return;

          if (!conversationsMap.has(profile.id)) {
            conversationsMap.set(profile.id, {
              profile,
              last_message: {
                ...msg,
                receiver: profile
              } as DirectMessage,
              unread_count: 0
            });
          } else {
            // Check if this message is newer than what we have
            const existing = conversationsMap.get(profile.id)!;
            if (new Date(msg.created_at) > new Date(existing.last_message?.created_at || '')) {
              conversationsMap.set(profile.id, {
                ...existing,
                last_message: {
                  ...msg,
                  receiver: profile
                } as DirectMessage
              });
            }
          }
        });
      }

      // Process received messages
      if (receivedMessages && Array.isArray(receivedMessages)) {
        receivedMessages.forEach((msg: any) => {
          const profile = profileMap.get(msg.sender_id);
          if (!profile) return;

          if (!conversationsMap.has(profile.id)) {
            conversationsMap.set(profile.id, {
              profile,
              last_message: {
                ...msg,
                sender: profile
              } as DirectMessage,
              unread_count: 0 // Would track unread count here
            });
          } else {
            // Compare timestamps and update if newer
            const existing = conversationsMap.get(profile.id)!;
            if (new Date(msg.created_at) > new Date(existing.last_message?.created_at || '')) {
              conversationsMap.set(profile.id, {
                ...existing,
                last_message: {
                  ...msg,
                  sender: profile
                } as DirectMessage
              });
            }
          }
        });
      }

      // Convert map to array and sort by most recent
      const conversationList = Array.from(conversationsMap.values())
        .sort((a, b) => {
          const dateA = new Date(a.last_message?.created_at || 0);
          const dateB = new Date(b.last_message?.created_at || 0);
          return dateB.getTime() - dateA.getTime();
        });

      setConversations(conversationList);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (selectedProfile: Profile) => {
    navigate(`/chat/${selectedProfile.id}`);
  };

  const filteredConversations = searchQuery
    ? conversations.filter(conv => 
        conv.profile.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const getLastMessagePreview = (conversation: ChatConversation) => {
    if (!conversation.last_message) return '';
    
    if (conversation.last_message.content) {
      return conversation.last_message.content.length > 30
        ? conversation.last_message.content.substring(0, 30) + '...'
        : conversation.last_message.content;
    }
    
    if (conversation.last_message.image_url) return '🖼️ Imagem';
    if (conversation.last_message.video_url) return '🎬 Vídeo';
    
    return '';
  };

  const getMessageTime = (conversation: ChatConversation) => {
    if (!conversation.last_message?.created_at) return '';
    
    const messageDate = new Date(conversation.last_message.created_at);
    const today = new Date();
    
    if (messageDate.toDateString() === today.toDateString()) {
      return format(messageDate, 'HH:mm');
    } else {
      return format(messageDate, 'dd/MM/yy');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <h2 className="text-lg font-semibold mb-3">Mensagens</h2>
        
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Button onClick={() => setUserSearchOpen(true)}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Nova
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-3 p-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length > 0 ? (
          <div>
            {filteredConversations.map((conversation) => (
              <Button
                key={conversation.profile.id}
                variant="ghost"
                className="w-full justify-start px-3 py-6 h-auto"
                onClick={() => navigate(`/chat/${conversation.profile.id}`)}
              >
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={conversation.profile.avatar_url || ''} alt={conversation.profile.username} />
                  <AvatarFallback>
                    {conversation.profile.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-left flex flex-col items-start">
                  <div className="flex w-full justify-between">
                    <span className="font-medium">{conversation.profile.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {getMessageTime(conversation)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground truncate w-full text-left">
                    {getLastMessagePreview(conversation)}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="font-medium">Nenhuma conversa encontrada</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery 
                ? 'Tente uma pesquisa diferente'
                : 'Inicie uma nova conversa para começar'}
            </p>
            {!searchQuery && (
              <Button className="mt-4" onClick={() => setUserSearchOpen(true)}>
                Nova Conversa
              </Button>
            )}
          </div>
        )}
      </div>
      
      <UserSearchDialog 
        open={userSearchOpen} 
        onOpenChange={setUserSearchOpen}
        onSelectUser={handleSelectUser}
      />
    </div>
  );
}
