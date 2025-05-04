
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Plus, Settings, LogOut, SendHorizonal, Image, Video, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Group, GroupMember, GroupMessage } from "@/types/group";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupMembersList } from "@/components/groups/GroupMembersList";
import { GroupJoinRequests } from "@/components/groups/GroupJoinRequests";
import { GroupSettings } from "@/components/groups/GroupSettings";
import { GroupMessagesList } from "@/components/groups/GroupMessagesList";
import { GroupMediaUpload } from "@/components/groups/GroupMediaUpload";
import { ShareArticleDialog } from "@/components/groups/ShareArticleDialog";

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [uploadType, setUploadType] = useState<"image" | "video" | null>(null);
  const [showShareArticle, setShowShareArticle] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    fetchGroupData();
    
    // Set up realtime subscription for messages
    const channel = supabase
      .channel('group-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${id}`
        },
        (payload) => {
          handleNewMessage(payload.new as any);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchGroupData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Fetch group details
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select(`
          *,
          owner:owner_id(id, username, avatar_url)
        `)
        .eq('id', id)
        .single();
        
      if (groupError) throw groupError;
      
      if (!groupData) {
        toast.error('Grupo não encontrado');
        navigate('/groups');
        return;
      }
      
      // Check if user is a member
      if (user) {
        const { data: memberData, error: memberError } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', id)
          .eq('user_id', user.id)
          .single();
          
        if (!memberError && memberData) {
          setGroup({
            ...groupData,
            is_member: true,
            role: memberData.role
          });
          
          // Fetch members
          fetchMembers();
          
          // Fetch messages
          fetchMessages();
        } else {
          setGroup({
            ...groupData,
            is_member: false
          });
          
          // Not a member, redirect back to groups page
          toast.error('Você não é membro deste grupo');
          navigate('/groups');
        }
      } else {
        // Not logged in, redirect to login
        toast.error('Faça login para acessar o grupo');
        navigate('/auth');
      }
    } catch (error) {
      console.error('Error fetching group data:', error);
      toast.error('Erro ao carregar dados do grupo');
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          profile:user_id(id, username, avatar_url)
        `)
        .eq('group_id', id)
        .order('role', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setMembers(data as GroupMember[]);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchMessages = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('group_messages')
        .select(`
          *,
          sender:user_id(id, username, avatar_url),
          shared_article:article_id(id, title, image_url)
        `)
        .eq('group_id', id)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      if (data) {
        setMessages(data as GroupMessage[]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleNewMessage = async (newMessage: any) => {
    try {
      // Fetch full message with profile info
      const { data, error } = await supabase
        .from('group_messages')
        .select(`
          *,
          sender:user_id(id, username, avatar_url),
          shared_article:article_id(id, title, image_url)
        `)
        .eq('id', newMessage.id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setMessages((prev) => [...prev, data as GroupMessage]);
      }
    } catch (error) {
      console.error('Error processing new message:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!id || !user || !messageText.trim()) return;
    
    try {
      setSendingMessage(true);
      
      const { error } = await supabase
        .from('group_messages')
        .insert({
          group_id: id,
          user_id: user.id,
          content: messageText.trim()
        });
        
      if (error) throw error;
      
      setMessageText("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!id || !user || !group) return;
    
    // Confirm before leaving
    if (!window.confirm(`Tem certeza que deseja sair do grupo ${group.name}?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast.success(`Você saiu do grupo ${group.name}`);
      navigate('/groups');
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Erro ao sair do grupo');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!group) {
    return null;
  }

  const isAdmin = group.role === 'admin' || group.role === 'owner';
  const isOwner = group.role === 'owner';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-6">
        {/* Group header */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {group.image_url ? (
              <Avatar className="h-16 w-16">
                <AvatarImage src={group.image_url} alt={group.name} />
                <AvatarFallback>{group.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
            )}
            
            <div>
              <h1 className="text-2xl font-bold">{group.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{group.member_count} membros</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 self-end md:self-auto">
            {isAdmin && (
              <Button variant="outline" onClick={() => setActiveTab('settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </Button>
            )}
            <Button variant="destructive" onClick={handleLeaveGroup}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair do Grupo
            </Button>
          </div>
        </div>
        
        {group.description && (
          <p className="mb-6 text-muted-foreground">{group.description}</p>
        )}
        
        <Separator className="mb-6" />
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 md:w-[400px]">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="members">Membros ({group.member_count})</TabsTrigger>
            {isAdmin && <TabsTrigger value="settings">Configurações</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="chat" className="space-y-4">
            <div className="border rounded-lg h-[60vh] flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-semibold">Bem-vindo ao grupo!</h3>
                    <p className="text-muted-foreground mt-1 max-w-md">
                      Este é o início da conversa. Envie uma mensagem para começar.
                    </p>
                  </div>
                ) : (
                  <GroupMessagesList 
                    messages={messages} 
                    currentUserId={user?.id || ''} 
                  />
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Escreva sua mensagem..."
                    className="min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <div className="flex flex-col space-y-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setUploadType("image")}
                      title="Enviar imagem"
                    >
                      <Image className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setUploadType("video")}
                      title="Enviar vídeo"
                    >
                      <Video className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowShareArticle(true)}
                      title="Compartilhar publicação"
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                  <Button 
                    size="icon" 
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendingMessage}
                  >
                    {sendingMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SendHorizonal className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="members" className="space-y-6">
            <GroupMembersList 
              members={members} 
              group={group} 
              onMemberUpdated={fetchMembers} 
              currentUserId={user?.id || ''}
            />
            
            {isAdmin && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Solicitações de Entrada</h3>
                <GroupJoinRequests 
                  groupId={id || ''} 
                  onRequestProcessed={fetchGroupData}
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settings">
            {isAdmin && (
              <GroupSettings 
                group={group}
                isOwner={isOwner}
                onGroupUpdated={fetchGroupData}
                onGroupDeleted={() => navigate('/groups')}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      {uploadType && (
        <GroupMediaUpload 
          type={uploadType}
          groupId={id || ''}
          onClose={() => setUploadType(null)}
          onUploadComplete={() => {
            setUploadType(null);
            // Message will be added via realtime subscription
          }}
        />
      )}
      
      <ShareArticleDialog 
        open={showShareArticle}
        onOpenChange={setShowShareArticle}
        groupId={id || ''}
      />
      
      <Footer />
    </div>
  );
}
