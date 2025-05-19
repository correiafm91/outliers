
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Image, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessageInputProps {
  receiverId: string;
  onMessageSent?: () => void;
}

export function ChatMessageInput({ receiverId, onMessageSent }: ChatMessageInputProps) {
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if ((!message.trim() && !imageFile) || !user) return;

    try {
      setUploadingImage(imageFile !== null);
      
      let imageUrl = null;
      
      if (imageFile) {
        const fileName = `${user.id}-${Date.now()}-${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat_media')
          .upload(fileName, imageFile);
        
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('chat_media')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrlData.publicUrl;
      }
      
      // Use RPC for inserting direct messages
      const { error: insertError } = await supabase.rpc('insert_direct_message', {
        sender_id_param: user.id,
        receiver_id_param: receiverId,
        content_param: message.trim() || null,
        image_url_param: imageUrl
      });
      
      if (insertError) throw insertError;
      
      // Clear form
      setMessage('');
      clearImage();
      
      // Notify parent
      if (onMessageSent) onMessageSent();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-3 border-t">
      {imagePreview && (
        <div className="relative mb-3 inline-block">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="max-h-32 rounded border"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={clearImage}
          >
            &times;
          </Button>
        </div>
      )}
      
      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
        >
          <Image className="h-5 w-5" />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploadingImage}
          />
        </Button>
        
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="resize-none min-h-[40px] max-h-32"
          rows={1}
          onKeyDown={handleKeyDown}
          disabled={uploadingImage}
        />
        
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={(!message.trim() && !imageFile) || uploadingImage}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
