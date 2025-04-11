
import { useState, useEffect, useRef } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { X, Edit, Trash2, SendHorizontal } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { Message } from "@/types/chat";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function ChatDrawer({ open, onClose }: ChatDrawerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("messages");
  const [messageText, setMessageText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  
  const { 
    conversations, 
    activeConversationId, 
    activeConversationMessages, 
    loadingConversations,
    loadingMessages, 
    setActiveConversationId,
    sendMessage,
    editMessage,
    deleteMessage,
    likeMessage
  } = useChat();
  
  const { user } = useAuth();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [activeConversationMessages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      sendMessage(messageText);
      setMessageText("");
    }
  };
  
  const handleStartEdit = (message: Message) => {
    setEditingMessageId(message.id);
    setEditText(message.content);
  };
  
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };
  
  const handleSaveEdit = (messageId: string) => {
    if (editText.trim()) {
      editMessage(messageId, editText);
      setEditingMessageId(null);
      setEditText("");
    }
  };
  
  const handleDoubleTap = (message: Message) => {
    if (message.sender_id !== user?.id && !message.is_liked_by_me) {
      likeMessage(message.id);
    }
  };
  
  const getOtherParticipant = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return null;
    
    const otherParticipant = conversation.participants.find(
      p => p.user_id !== user?.id
    );
    
    return otherParticipant?.profile || null;
  };
  
  const activeConversationPartner = activeConversationId 
    ? getOtherParticipant(activeConversationId)
    : null;
  
  return (
    <Drawer open={open} onOpenChange={open => !open && onClose()}>
      <DrawerContent className="h-[85vh] max-h-[85vh] flex flex-col">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg">
              {activeConversationId && activeConversationPartner ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activeConversationPartner.avatar_url || undefined} alt={activeConversationPartner.username} />
                    <AvatarFallback>
                      {activeConversationPartner.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{activeConversationPartner.username}</span>
                </div>
              ) : (
                "Mensagens"
              )}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="border-b px-4">
            <TabsList className="w-full">
              <TabsTrigger value="conversations" className="flex-1">Conversas</TabsTrigger>
              <TabsTrigger value="messages" className="flex-1">Mensagens</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="conversations" className="flex-1 overflow-auto p-0 m-0">
            <div className="p-4 space-y-2">
              {loadingConversations ? (
                <div className="text-center py-8 text-muted-foreground">Carregando conversas...</div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhuma conversa encontrada</div>
              ) : (
                conversations.map(conversation => {
                  const otherParticipant = conversation.participants.find(
                    p => p.user_id !== user?.id
                  )?.profile;
                  
                  if (!otherParticipant) return null;
                  
                  return (
                    <button
                      key={conversation.id}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        activeConversationId === conversation.id
                          ? "bg-accent"
                          : "hover:bg-accent/50"
                      }`}
                      onClick={() => {
                        setActiveConversationId(conversation.id);
                        setActiveTab("messages");
                      }}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={otherParticipant.avatar_url || undefined} alt={otherParticipant.username} />
                          <AvatarFallback>
                            {otherParticipant.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.unread_count && conversation.unread_count > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                            {conversation.unread_count > 9 ? "9+" : conversation.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold truncate">{otherParticipant.username}</p>
                        {conversation.last_message && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.last_message.is_deleted
                              ? "Mensagem apagada"
                              : conversation.last_message.content}
                          </p>
                        )}
                      </div>
                      {conversation.last_message && (
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(conversation.last_message.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="messages" className="flex-1 flex flex-col p-0 m-0 overflow-hidden">
            {activeConversationId ? (
              <>
                <div className="flex-1 overflow-auto p-4 space-y-4">
                  {loadingMessages ? (
                    <div className="text-center py-8 text-muted-foreground">Carregando mensagens...</div>
                  ) : activeConversationMessages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Nenhuma mensagem encontrada</div>
                  ) : (
                    activeConversationMessages.map(message => {
                      const isCurrentUser = message.sender_id === user?.id;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                          onDoubleClick={() => handleDoubleTap(message)}
                        >
                          <div className={`flex gap-2 max-w-[80%] ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                            {!isCurrentUser && (
                              <Avatar className="h-8 w-8 mt-1">
                                <AvatarImage src={message.sender?.avatar_url || undefined} alt={message.sender?.username} />
                                <AvatarFallback>
                                  {message.sender?.username.slice(0, 2).toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div>
                              {editingMessageId === message.id ? (
                                <div className="bg-accent rounded-lg p-3 space-y-2">
                                  <Input
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="w-full"
                                    autoFocus
                                  />
                                  <div className="flex justify-end gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={handleCancelEdit}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleSaveEdit(message.id)}
                                    >
                                      Salvar
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div 
                                  className={`rounded-lg p-3 ${
                                    isCurrentUser 
                                      ? "bg-primary text-primary-foreground" 
                                      : "bg-muted"
                                  }`}
                                >
                                  <p className={message.is_deleted ? "text-muted-foreground italic" : ""}>
                                    {message.content}
                                  </p>
                                  {message.is_edited && !message.is_deleted && (
                                    <span className="text-xs opacity-70">(editado)</span>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                <span className="mr-auto">
                                  {formatDistanceToNow(new Date(message.created_at), {
                                    addSuffix: true,
                                    locale: ptBR
                                  })}
                                </span>
                                
                                {isCurrentUser && !message.is_deleted && !editingMessageId && (
                                  <div className="flex gap-1 ml-1">
                                    <button 
                                      onClick={() => handleStartEdit(message)} 
                                      className="p-1 hover:text-foreground transition-colors"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                    <button 
                                      onClick={() => deleteMessage(message.id)} 
                                      className="p-1 hover:text-destructive transition-colors"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                                
                                {message.likes_count && message.likes_count > 0 && (
                                  <div className="ml-1 flex items-center">
                                    <span className="bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-300 rounded-full px-2 py-0.5 text-[10px]">
                                      ❤️ {message.likes_count}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <form 
                  onSubmit={handleSendMessage}
                  className="border-t p-3 flex gap-2"
                >
                  <Input
                    placeholder="Escreva sua mensagem..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <SendHorizontal className="h-4 w-4" />
                    <span className="sr-only">Enviar</span>
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-4">
                <p className="text-center">Selecione uma conversa para começar</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DrawerContent>
    </Drawer>
  );
}
