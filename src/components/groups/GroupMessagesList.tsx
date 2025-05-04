
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GroupMessage } from "@/types/group";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistance } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image as ImageIcon, Video as VideoIcon } from "lucide-react";

interface GroupMessagesListProps {
  messages: GroupMessage[];
  currentUserId: string;
}

export function GroupMessagesList({ messages, currentUserId }: GroupMessagesListProps) {
  const formatMessageTime = (dateString: string) => {
    return formatDistance(new Date(dateString), new Date(), {
      addSuffix: true,
      locale: ptBR
    });
  };

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isCurrentUser = message.user_id === currentUserId;
        
        return (
          <div 
            key={message.id} 
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
              <Avatar className="h-8 w-8 mt-1">
                <AvatarImage src={message.sender?.avatar_url || ''} alt={message.sender?.username || ''} />
                <AvatarFallback>
                  {message.sender?.username?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-1">
                <div className={`flex items-center gap-2 text-sm ${isCurrentUser ? 'justify-end' : ''}`}>
                  <span className="font-semibold">
                    {isCurrentUser ? 'Você' : message.sender?.username || 'Usuário'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatMessageTime(message.created_at)}
                  </span>
                </div>
                
                {message.content && (
                  <div 
                    className={`p-3 rounded-lg ${
                      isCurrentUser 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    {message.content}
                  </div>
                )}
                
                {message.image_url && (
                  <div className="max-w-sm">
                    <img 
                      src={message.image_url} 
                      alt="Imagem compartilhada" 
                      className="rounded-lg max-h-60 object-cover"
                      onClick={() => window.open(message.image_url, '_blank')}
                    />
                  </div>
                )}
                
                {message.video_url && (
                  <div className="max-w-sm">
                    <video 
                      src={message.video_url} 
                      controls 
                      className="rounded-lg max-h-60 w-full"
                    />
                  </div>
                )}
                
                {message.shared_article && (
                  <Card className="max-w-sm overflow-hidden">
                    {message.shared_article.image_url && (
                      <div className="aspect-video relative">
                        <img 
                          src={message.shared_article.image_url} 
                          alt={message.shared_article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-3">
                      <h4 className="font-medium line-clamp-2">{message.shared_article.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">Artigo compartilhado</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
