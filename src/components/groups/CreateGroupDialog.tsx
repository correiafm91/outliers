
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkBucketExists } from "@/integrations/supabase/client";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated: () => void;
}

export function CreateGroupDialog({ open, onOpenChange, onGroupCreated }: CreateGroupDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"public" | "private">("public");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const resetForm = () => {
    setName("");
    setDescription("");
    setType("public");
    setImage(null);
    setPreviewUrl(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB");
        return;
      }
      
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Você precisa estar logado para criar um grupo");
      onOpenChange(false);
      navigate("/auth");
      return;
    }
    
    if (!name.trim()) {
      toast.error("Nome do grupo é obrigatório");
      return;
    }
    
    try {
      setLoading(true);
      
      // Create the group first
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          type,
          owner_id: user.id
        })
        .select('id')
        .single();
        
      if (groupError) throw groupError;
      
      if (!groupData) throw new Error("Falha ao criar grupo");
      
      const groupId = groupData.id;
      
      // Add the owner as a member with owner role
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'owner'
        });
        
      if (memberError) throw memberError;
      
      // Upload image if provided
      if (image) {
        const bucketExists = await checkBucketExists('groups');
        
        if (!bucketExists) {
          toast.error("Armazenamento de imagens não disponível");
        } else {
          const fileName = `${groupId}/${Date.now()}_${image.name.replace(/\s+/g, '_')}`;
          
          const { error: uploadError } = await supabase.storage
            .from('groups')
            .upload(fileName, image);
            
          if (uploadError) {
            console.error("Error uploading image:", uploadError);
            toast.error("Erro ao fazer upload da imagem, mas o grupo foi criado");
          } else {
            // Get the URL of the uploaded image
            const { data: urlData } = supabase.storage
              .from('groups')
              .getPublicUrl(fileName);
              
            const imageUrl = urlData.publicUrl;
            
            // Update group with image URL
            const { error: updateError } = await supabase
              .from('groups')
              .update({ image_url: imageUrl })
              .eq('id', groupId);
              
            if (updateError) {
              console.error("Error updating group with image:", updateError);
            }
          }
        }
      }
      
      toast.success("Grupo criado com sucesso!");
      onGroupCreated();
      resetForm();
      onOpenChange(false);
      
      // Navigate to the new group
      navigate(`/groups/${groupId}`);
      
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Erro ao criar grupo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!loading) {
        if (!newOpen) resetForm();
        onOpenChange(newOpen);
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar novo grupo</DialogTitle>
          <DialogDescription>
            Crie um grupo para compartilhar conteúdos e interagir com outros usuários
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome do grupo*</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome do grupo"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea 
              id="description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva brevemente o propósito do grupo"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label>Tipo de grupo</Label>
            <RadioGroup value={type} onValueChange={(value: "public" | "private") => setType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="cursor-pointer">Público - Qualquer pessoa pode entrar</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="cursor-pointer">Privado - Aprovação necessária para entrar</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="image">Imagem do grupo</Label>
            <div className="flex flex-col gap-4">
              {previewUrl && (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-0 right-0 h-6 w-6 p-0"
                    onClick={() => {
                      setImage(null);
                      setPreviewUrl(null);
                    }}
                  >
                    &times;
                  </Button>
                </div>
              )}
              
              {!previewUrl && (
                <div className="flex gap-2">
                  <Input 
                    id="image" 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("image")?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Escolher imagem
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Criar grupo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
