
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CommentFormProps {
  postId: string;
  onCommentAdded?: () => void;
}

export function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [sector, setSector] = useState("other");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const { user, profile } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user) throw new Error("Você precisa estar logado");
      
      // Upload profile image if provided
      let avatar_url = null;
      if (profileImage) {
        const fileExt = profileImage.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}`;
        const filePath = `${fileName}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, profileImage);
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        avatar_url = data.publicUrl;
      }
      
      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({ 
          username: username,
          sector: sector,
          ...(avatar_url && { avatar_url: avatar_url })
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setDialogOpen(false);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar perfil");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      if (!user) throw new Error("Você precisa estar logado");
      
      const { error } = await supabase
        .from('comments')
        .insert([
          { 
            article_id: postId,
            author_id: user.id,
            content: comment
          }
        ]);
        
      if (error) throw error;
      
      setComment("");
      if (onCommentAdded) onCommentAdded();
      toast.success("Comentário publicado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao publicar comentário");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectors = [
    { value: "technology", label: "Tecnologia" },
    { value: "marketing", label: "Marketing" },
    { value: "gastronomy", label: "Gastronomia" },
    { value: "education", label: "Educação" },
    { value: "finance", label: "Finanças" },
    { value: "health", label: "Saúde" },
    { value: "sports", label: "Esportes" },
    { value: "entertainment", label: "Entretenimento" },
    { value: "other", label: "Outro" }
  ];

  const hasProfile = !!profile;

  return (
    <div className="space-y-4 animate-fade-in">
      <h3 className="heading-sm">Deixe um comentário</h3>
      
      {hasProfile ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || ""} alt={profile?.username} />
              <AvatarFallback>{profile?.username?.slice(0, 2) || "U"}</AvatarFallback>
            </Avatar>
            <Textarea
              placeholder="Compartilhe seus pensamentos..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1 resize-none"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !comment.trim()}>
              {isSubmitting ? "Postando..." : "Publicar Comentário"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 border border-dashed border-border rounded-md">
          <p className="text-muted-foreground mb-4 text-center">
            Você precisa criar um perfil antes de comentar
          </p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Criar Perfil</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crie seu perfil</DialogTitle>
                <DialogDescription>
                  Configure um nome de usuário e foto de perfil para começar a comentar.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleProfileSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de usuário</Label>
                    <Input 
                      id="username" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      placeholder="Escolha um nome de usuário"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sector">Setor</Label>
                    <Select value={sector} onValueChange={setSector}>
                      <SelectTrigger id="sector">
                        <SelectValue placeholder="Selecione seu setor" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectors.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-image">Foto de Perfil</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={previewUrl || ""} alt="Pré-visualização" />
                        <AvatarFallback>{username ? username.slice(0, 2) : "U"}</AvatarFallback>
                      </Avatar>
                      <Input 
                        id="profile-image" 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={!username || isSubmitting}>
                    {isSubmitting ? "Salvando..." : "Salvar Perfil"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
