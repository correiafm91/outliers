
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Group } from '@/types/group';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Upload, Loader2, Trash } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { checkBucketExists } from "@/integrations/supabase/client";

interface GroupSettingsProps {
  group: Group;
  isOwner: boolean;
  onGroupUpdated: () => void;
  onGroupDeleted: () => void;
}

export function GroupSettings({ 
  group,
  isOwner,
  onGroupUpdated,
  onGroupDeleted
}: GroupSettingsProps) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [type, setType] = useState<"public" | "private">(group.type);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(group.image_url);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

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
  
  const handleSaveChanges = async () => {
    if (!group.id || !name.trim()) {
      toast.error('Nome do grupo é obrigatório');
      return;
    }
    
    try {
      setSaving(true);
      
      let imageUrl = group.image_url;
      
      // Upload new image if provided
      if (image) {
        const bucketExists = await checkBucketExists('groups');
        
        if (!bucketExists) {
          toast.error("Armazenamento de imagens não disponível");
        } else {
          const fileName = `${group.id}/${Date.now()}_${image.name.replace(/\s+/g, '_')}`;
          
          const { error: uploadError } = await supabase.storage
            .from('groups')
            .upload(fileName, image);
            
          if (uploadError) {
            console.error("Error uploading image:", uploadError);
            toast.error("Erro ao fazer upload da imagem");
          } else {
            // Get the URL of the uploaded image
            const { data: urlData } = supabase.storage
              .from('groups')
              .getPublicUrl(fileName);
              
            imageUrl = urlData.publicUrl;
          }
        }
      }
      
      // Update group data
      const { error } = await supabase
        .from('groups')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          type,
          image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', group.id);
        
      if (error) throw error;
      
      toast.success('Grupo atualizado com sucesso!');
      onGroupUpdated();
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error('Erro ao atualizar grupo');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteGroup = async () => {
    // Confirm deletion
    if (!window.confirm(`Tem certeza que deseja excluir o grupo ${group.name}? Esta ação não pode ser desfeita.`)) {
      return;
    }
    
    try {
      setDeleting(true);
      
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', group.id);
        
      if (error) throw error;
      
      toast.success('Grupo excluído com sucesso!');
      onGroupDeleted();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Erro ao excluir grupo');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Configurações do Grupo</h2>
        <p className="text-muted-foreground">
          Gerencie as configurações do seu grupo aqui
        </p>
      </div>
      
      <div className="space-y-4">
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
          <Label>Imagem do grupo</Label>
          <div className="flex items-center gap-4">
            {previewUrl ? (
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewUrl} alt={group.name} />
                <AvatarFallback>{group.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-semibold text-primary">
                  {group.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            
            <div>
              <Input 
                id="group-image" 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("group-image")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Trocar imagem
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveChanges} 
          disabled={saving || !name.trim()}
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar alterações
        </Button>
      </div>
      
      <Separator className="my-8" />
      
      {isOwner && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Zona de perigo</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              A exclusão de um grupo é permanente e irreversível. Todos os dados do grupo, 
              incluindo mensagens e arquivos compartilhados, serão excluídos.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="destructive"
              onClick={handleDeleteGroup}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Trash className="mr-2 h-4 w-4" /> 
              Excluir grupo
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
