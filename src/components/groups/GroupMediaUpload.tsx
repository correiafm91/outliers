
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkBucketExists } from "@/integrations/supabase/client";

interface GroupMediaUploadProps {
  type: "image" | "video";
  groupId: string;
  onClose: () => void;
  onUploadComplete: () => void;
}

export function GroupMediaUpload({ type, groupId, onClose, onUploadComplete }: GroupMediaUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Verify file type
    const isImage = type === "image" && selectedFile.type.startsWith("image/");
    const isVideo = type === "video" && selectedFile.type.startsWith("video/");
    
    if (!isImage && !isVideo) {
      toast.error(`Por favor, selecione um arquivo de ${type === "image" ? "imagem" : "vídeo"}`);
      return;
    }
    
    // Verify file size
    const maxSize = type === "image" ? 5 * 1024 * 1024 : 20 * 1024 * 1024; // 5MB for images, 20MB for videos
    if (selectedFile.size > maxSize) {
      toast.error(`O arquivo é muito grande. Tamanho máximo: ${maxSize / (1024 * 1024)}MB`);
      return;
    }
    
    setFile(selectedFile);
    
    // Create preview URL
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    
    try {
      setUploading(true);
      
      // Check if bucket exists
      const bucketName = type === "image" ? "images" : "videos";
      const bucketExists = await checkBucketExists(bucketName);
      
      if (!bucketExists) {
        toast.error(`Armazenamento de ${type === "image" ? "imagens" : "vídeos"} não disponível`);
        return;
      }
      
      // Upload file to bucket
      const fileName = `groups/${groupId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      // Get file URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
        
      const fileUrl = urlData.publicUrl;
      
      // Create message with the file
      const messageData = {
        group_id: groupId,
        user_id: user.id,
        [type === "image" ? "image_url" : "video_url"]: fileUrl
      };
      
      const { error: messageError } = await supabase
        .from('group_messages')
        .insert(messageData);
        
      if (messageError) throw messageError;
      
      toast.success(`${type === "image" ? "Imagem" : "Vídeo"} enviado com sucesso!`);
      onUploadComplete();
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error(`Erro ao enviar ${type === "image" ? "imagem" : "vídeo"}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === "image" ? (
              <span className="flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Enviar imagem</span>
            ) : (
              <span className="flex items-center gap-2"><VideoIcon className="h-5 w-5" /> Enviar vídeo</span>
            )}
          </DialogTitle>
          <DialogDescription>
            {type === "image" 
              ? "Compartilhe uma imagem com o grupo (máx. 5MB)" 
              : "Compartilhe um vídeo com o grupo (máx. 20MB)"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="media">
              {type === "image" ? "Selecione uma imagem" : "Selecione um vídeo"}
            </Label>
            <Input 
              id="media" 
              type="file" 
              accept={type === "image" ? "image/*" : "video/*"}
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </div>
          
          {previewUrl && (
            <div className="rounded-md overflow-hidden border">
              {type === "image" ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-60 w-full object-contain"
                />
              ) : (
                <video
                  src={previewUrl}
                  controls
                  className="max-h-60 w-full"
                />
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Upload className="mr-2 h-4 w-4" />
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
