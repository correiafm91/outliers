
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DirectMessage } from '@/types/group';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Edit, Image, MessageCircle, MoreHorizontal, Send, Trash2 } from 'lucide-react';

interface ChatMessageProps {
  message: DirectMessage;
  isMyMessage: boolean;
  onImageClick?: (imageUrl: string) => void;
}

export function ChatMessage({ message, isMyMessage, onImageClick }: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content || '');
  const { user } = useAuth();

  const handleEdit = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (editedContent.trim() === '' || editedContent === message.content) {
      setIsEditing(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('direct_messages')
        .update({
          content: editedContent,
          is_edited: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', message.id);

      if (error) throw error;
      
      setIsEditing(false);
      toast.success('Mensagem atualizada');
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Erro ao atualizar mensagem');
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('direct_messages')
        .delete()
        .eq('id', message.id);

      if (error) throw error;
      
      toast.success('Mensagem removida');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Erro ao remover mensagem');
    }
  };

  const messageTime = format(new Date(message.created_at), 'HH:mm');
  const messageDate = format(new Date(message.created_at), 'dd/MM/yyyy');
  const showFullDate = true; // Could be a prop based on message grouping

  return (
    <div className={`flex gap-2 mb-4 ${isMyMessage ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage 
          src={isMyMessage ? user?.user_metadata?.avatar_url : message.sender?.avatar_url} 
          alt={isMyMessage ? user?.user_metadata?.username : message.sender?.username}
        />
        <AvatarFallback>
          {isMyMessage 
            ? (user?.user_metadata?.username?.substring(0, 2) || 'U').toUpperCase()
            : (message.sender?.username?.substring(0, 2) || 'U').toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
        <div
          className={`max-w-[80%] rounded-lg p-3 ${
            isMyMessage 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-foreground'
          }`}
        >
          {!isEditing ? (
            <>
              {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
              
              {message.image_url && (
                <div 
                  className="mt-2 cursor-pointer"
                  onClick={() => onImageClick && onImageClick(message.image_url!)}
                >
                  <img 
                    src={message.image_url}
                    alt="Imagem da mensagem" 
                    className="max-h-56 w-auto rounded object-cover"
                  />
                </div>
              )}

              {message.video_url && (
                <div className="mt-2">
                  <video 
                    src={message.video_url}
                    className="max-h-56 w-auto rounded"
                    controls
                  />
                </div>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <Textarea 
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[100px] border-0 focus-visible:ring-0 p-0"
                placeholder="Digite sua mensagem..."
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleEdit}>
                  <Send className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-1 mt-1 text-xs text-muted-foreground items-center">
          {showFullDate && <span>{messageDate}</span>}
          <span className="mx-1">às</span>
          <span>{messageTime}</span>
          {message.is_edited && <span className="ml-1">(editada)</span>}
          
          {isMyMessage && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 hover:bg-transparent">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
