
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Conversation, Message } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type ChatContextType = {
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversationMessages: Message[];
  loadingConversations: boolean;
  loadingMessages: boolean;
  unreadCount: number;
  setActiveConversationId: (id: string | null) => void;
  startConversation: (userId: string) => Promise<string | null>;
  sendMessage: (content: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  likeMessage: (messageId: string) => Promise<void>;
  unlikeMessage: (messageId: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeConversationMessages, setActiveConversationMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Subscribe to new messages
  useEffect(() => {
    if (!user) return;
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('chat-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const newMessage = payload.new as Message;
        
        // Only update if we're interested in this conversation
        const conversationIndex = conversations.findIndex(c => c.id === newMessage.conversation_id);
        if (conversationIndex >= 0) {
          // Update last message in conversation list
          const updatedConversations = [...conversations];
          updatedConversations[conversationIndex] = {
            ...updatedConversations[conversationIndex],
            last_message: newMessage,
            updated_at: newMessage.created_at,
            unread_count: (updatedConversations[conversationIndex].unread_count || 0) + 1
          };
          
          setConversations(sortConversations(updatedConversations));
          
          // Update unread count
          setUnreadCount(prev => prev + 1);
          
          // If this is for the active conversation, update the messages list
          if (activeConversationId === newMessage.conversation_id) {
            setActiveConversationMessages(prev => [...prev, newMessage]);
            // Mark as read immediately if we're viewing this conversation
            markAsRead(newMessage.id);
          }
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, conversations, activeConversationId]);
  
  // Fetch conversations on initial load and when user changes
  useEffect(() => {
    if (user) {
      fetchConversations();
    } else {
      setConversations([]);
      setActiveConversationId(null);
      setActiveConversationMessages([]);
    }
  }, [user]);
  
  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    } else {
      setActiveConversationMessages([]);
    }
  }, [activeConversationId]);
  
  const sortConversations = (convs: Conversation[]): Conversation[] => {
    return [...convs].sort((a, b) => {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  };
  
  const fetchConversations = async () => {
    if (!user) return;
    
    setLoadingConversations(true);
    try {
      // Get all conversations where the user is a participant
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          profile:profiles!conversation_participants_user_id_fkey(id, username, avatar_url)
        `)
        .eq('user_id', user.id);
        
      if (participantError) throw participantError;
      
      if (participantData && participantData.length > 0) {
        // Get all conversation IDs
        const conversationIds = participantData.map(p => p.conversation_id);
        
        // Fetch conversations with these IDs
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('conversations')
          .select('*')
          .in('id', conversationIds)
          .order('updated_at', { ascending: false });
          
        if (conversationsError) throw conversationsError;
        
        // Create a map of conversation IDs to participant profiles (excluding current user)
        const participantsMap: Record<string, any[]> = {};
        let totalUnread = 0;
        
        // Group participants by conversation
        participantData.forEach(p => {
          const convId = p.conversation_id;
          if (!participantsMap[convId]) {
            participantsMap[convId] = [];
          }
          participantsMap[convId].push(p);
        });
        
        // Get the last message and unread count for each conversation
        const conversationsWithDetails = await Promise.all(conversationsData.map(async (conv) => {
          // Get the last message
          const { data: lastMessageData, error: lastMessageError } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey(id, username, avatar_url)
            `)
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);
            
          if (lastMessageError) throw lastMessageError;
          
          // Get unread count
          const { count, error: unreadError } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .not('sender_id', 'eq', user.id)
            .not('message_reads.user_id', 'eq', user.id);
            
          if (unreadError) throw unreadError;
          
          const unreadCount = count || 0;
          totalUnread += unreadCount;
          
          return {
            ...conv,
            participants: participantsMap[conv.id] || [],
            last_message: lastMessageData && lastMessageData.length > 0 ? lastMessageData[0] : null,
            unread_count: unreadCount
          };
        }));
        
        setConversations(sortConversations(conversationsWithDetails));
        setUnreadCount(totalUnread);
      } else {
        setConversations([]);
      }
    } catch (error: any) {
      console.error('Error fetching conversations:', error.message);
      toast.error('Não foi possível carregar as conversas');
    } finally {
      setLoadingConversations(false);
    }
  };
  
  const refreshConversations = async () => {
    await fetchConversations();
  };
  
  const fetchMessages = async (conversationId: string) => {
    if (!user) return;
    
    setLoadingMessages(true);
    try {
      // Get all messages for this conversation
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, username, avatar_url),
          likes:message_likes(id, user_id)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      // Process messages to add is_liked_by_me and likes_count
      const processedMessages = data.map(message => {
        const likes = message.likes || [];
        const isLikedByMe = likes.some((like: any) => like.user_id === user.id);
        const likesCount = likes.length;
        
        delete message.likes; // Remove the likes array as we've processed it
        
        return {
          ...message,
          is_liked_by_me: isLikedByMe,
          likes_count: likesCount
        };
      });
      
      setActiveConversationMessages(processedMessages);
      
      // Mark all messages as read
      if (data && data.length > 0) {
        for (const message of data) {
          if (message.sender_id !== user.id) {
            await markAsRead(message.id);
          }
        }
      }
      
      // Update the unread count for this conversation
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread_count: 0 } 
            : conv
        )
      );
      
      // Recalculate total unread
      const totalUnread = conversations.reduce(
        (sum, conv) => sum + (conv.id !== conversationId ? (conv.unread_count || 0) : 0), 
        0
      );
      setUnreadCount(totalUnread);
      
    } catch (error: any) {
      console.error('Error fetching messages:', error.message);
      toast.error('Não foi possível carregar as mensagens');
    } finally {
      setLoadingMessages(false);
    }
  };
  
  const startConversation = async (recipientId: string): Promise<string | null> => {
    if (!user || !recipientId) return null;
    
    try {
      // First, check if a conversation already exists between these users
      const { data: existingParticipants, error: participantError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);
        
      if (participantError) throw participantError;
      
      if (existingParticipants && existingParticipants.length > 0) {
        // Get conversation IDs where current user is a participant
        const userConvIds = existingParticipants.map(p => p.conversation_id);
        
        // Check if recipient is also in any of these conversations
        const { data: recipientParticipants, error: recipientError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', recipientId)
          .in('conversation_id', userConvIds);
          
        if (recipientError) throw recipientError;
        
        if (recipientParticipants && recipientParticipants.length > 0) {
          // Direct conversation already exists, return its ID
          const existingConvId = recipientParticipants[0].conversation_id;
          setActiveConversationId(existingConvId);
          return existingConvId;
        }
      }
      
      // If we get here, no conversation exists yet, so create a new one
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();
        
      if (conversationError) throw conversationError;
      
      // Add both users as participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: newConversation.id, user_id: user.id },
          { conversation_id: newConversation.id, user_id: recipientId }
        ]);
        
      if (participantsError) throw participantsError;
      
      // Refresh conversations list
      await fetchConversations();
      
      // Set this as the active conversation
      setActiveConversationId(newConversation.id);
      
      return newConversation.id;
      
    } catch (error: any) {
      console.error('Error starting conversation:', error.message);
      toast.error('Não foi possível iniciar a conversa');
      return null;
    }
  };
  
  const sendMessage = async (content: string) => {
    if (!user || !activeConversationId || !content.trim()) return;
    
    try {
      // Insert the new message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversationId,
          sender_id: user.id,
          content: content.trim()
        })
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, username, avatar_url)
        `)
        .single();
        
      if (error) throw error;
      
      // Update the active conversation's last message and timestamp
      // This happens automatically via the real-time subscription
      
    } catch (error: any) {
      console.error('Error sending message:', error.message);
      toast.error('Não foi possível enviar a mensagem');
    }
  };
  
  const editMessage = async (messageId: string, newContent: string) => {
    if (!user || !newContent.trim()) return;
    
    try {
      // Update the message content
      const { error } = await supabase
        .from('messages')
        .update({ 
          content: newContent.trim(),
          is_edited: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user.id); // Ensure only the sender can edit
        
      if (error) throw error;
      
      // Update the message in the local state
      setActiveConversationMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId
            ? { ...msg, content: newContent.trim(), is_edited: true, updated_at: new Date().toISOString() }
            : msg
        )
      );
      
      toast.success('Mensagem editada com sucesso');
    } catch (error: any) {
      console.error('Error editing message:', error.message);
      toast.error('Não foi possível editar a mensagem');
    }
  };
  
  const deleteMessage = async (messageId: string) => {
    if (!user) return;
    
    try {
      // Instead of actual deletion, mark the message as deleted
      const { error } = await supabase
        .from('messages')
        .update({ 
          is_deleted: true,
          content: "Esta mensagem foi apagada",
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user.id); // Ensure only the sender can delete
        
      if (error) throw error;
      
      // Update the message in the local state
      setActiveConversationMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId
            ? { 
                ...msg, 
                is_deleted: true, 
                content: "Esta mensagem foi apagada",
                updated_at: new Date().toISOString() 
              }
            : msg
        )
      );
      
      toast.success('Mensagem apagada com sucesso');
    } catch (error: any) {
      console.error('Error deleting message:', error.message);
      toast.error('Não foi possível apagar a mensagem');
    }
  };
  
  const likeMessage = async (messageId: string) => {
    if (!user) return;
    
    try {
      // Add a like
      const { error } = await supabase
        .from('message_likes')
        .insert({
          message_id: messageId,
          user_id: user.id
        });
        
      if (error) {
        // If error is due to unique constraint, it's already liked
        if (error.code === '23505') {
          return; // Silently ignore duplicate likes
        }
        throw error;
      }
      
      // Update the message in the local state
      setActiveConversationMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId
            ? { 
                ...msg, 
                likes_count: (msg.likes_count || 0) + 1,
                is_liked_by_me: true
              }
            : msg
        )
      );
      
    } catch (error: any) {
      console.error('Error liking message:', error.message);
      // No toast here for a smoother experience
    }
  };
  
  const unlikeMessage = async (messageId: string) => {
    if (!user) return;
    
    try {
      // Remove the like
      const { error } = await supabase
        .from('message_likes')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update the message in the local state
      setActiveConversationMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId && msg.likes_count && msg.likes_count > 0
            ? { 
                ...msg, 
                likes_count: msg.likes_count - 1,
                is_liked_by_me: false
              }
            : msg
        )
      );
      
    } catch (error: any) {
      console.error('Error unliking message:', error.message);
      // No toast here for a smoother experience
    }
  };
  
  const markAsRead = async (messageId: string) => {
    if (!user) return;
    
    try {
      // Check if we've already marked this message as read
      const { data, error: checkError } = await supabase
        .from('message_reads')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      // If not already read, insert a read receipt
      if (!data) {
        const { error } = await supabase
          .from('message_reads')
          .insert({
            message_id: messageId,
            user_id: user.id
          });
          
        if (error) throw error;
      }
      
    } catch (error: any) {
      console.error('Error marking message as read:', error.message);
      // No toast for read status updates
    }
  };
  
  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversationId,
      activeConversationMessages,
      loadingConversations,
      loadingMessages,
      unreadCount,
      setActiveConversationId,
      startConversation,
      sendMessage,
      editMessage,
      deleteMessage,
      likeMessage,
      unlikeMessage,
      markAsRead,
      refreshConversations
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
