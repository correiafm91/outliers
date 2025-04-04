
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlogCard } from "@/components/blog/BlogCard";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Article, Profile } from "@/types/profile";
import { toast } from "sonner";
import { 
  Loader2, 
  Calendar, 
  Settings, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Facebook,
  CheckCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Progress } from "@/components/ui/progress";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userArticles, setUserArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Estado para edição
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    avatar_url: '',
    instagram_url: '',
    linkedin_url: '',
    youtube_url: '',
    facebook_url: ''
  });

  useEffect(() => {
    if (id) {
      fetchProfileData();
    }
  }, [id]);

  useEffect(() => {
    if (user && profile) {
      setIsOwner(user.id === profile.id);
      
      if (isOwner) {
        setEditForm({
          username: profile.username || '',
          bio: profile.bio || '',
          avatar_url: profile.avatar_url || '',
          instagram_url: profile.instagram_url || '',
          linkedin_url: profile.linkedin_url || '',
          youtube_url: profile.youtube_url || '',
          facebook_url: profile.facebook_url || ''
        });
      }
    }
  }, [user, profile]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Buscar perfil
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      
      if (profileError) throw profileError;
      setProfile(profileData);
      
      // Buscar artigos do usuário, ordenados por data mais recente
      const { data: articlesData, error: articlesError } = await supabase
        .from("articles")
        .select("*")
        .eq("author_id", id)
        .order("created_at", { ascending: false });
        
      if (articlesError) throw articlesError;
      
      setUserArticles(articlesData);
      
      // Verificar se o usuário atual é o proprietário do perfil
      if (user) {
        setIsOwner(user.id === id);
      }
      
    } catch (error: any) {
      console.error("Erro ao carregar o perfil:", error.message);
      toast.error("Não foi possível carregar os dados do perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !profile) return;
    
    try {
      setUploadingAvatar(true);
      setUploadProgress(10);
      
      // Validar tipo de arquivo e tamanho
      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor, envie apenas arquivos de imagem');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        throw new Error('A imagem deve ter menos de 5MB');
      }
      
      setUploadProgress(30);
      
      // Criar um nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      setUploadProgress(50);
      
      // Fazer upload para o storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      setUploadProgress(80);
      
      // Obter a URL pública
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
      
      // Atualizar o estado e o formulário
      const avatarUrl = data.publicUrl;
      setEditForm(prev => ({
        ...prev,
        avatar_url: avatarUrl
      }));
      
      setUploadProgress(100);
      toast.success('Imagem enviada com sucesso');
    } catch (error: any) {
      console.error('Erro ao fazer upload da imagem:', error.message);
      toast.error(error.message || 'Erro ao fazer upload da imagem');
    } finally {
      setUploadingAvatar(false);
      // Resetar o progresso após 1 segundo
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: editForm.username,
          bio: editForm.bio,
          avatar_url: editForm.avatar_url,
          instagram_url: editForm.instagram_url,
          linkedin_url: editForm.linkedin_url,
          youtube_url: editForm.youtube_url,
          facebook_url: editForm.facebook_url
        })
        .eq("id", profile?.id);
      
      if (error) throw error;
      
      toast.success("Perfil atualizado com sucesso");
      fetchProfileData(); // Atualizar dados
      setEditDialogOpen(false);
    } catch (error: any) {
      console.error("Erro ao atualizar o perfil:", error.message);
      toast.error("Não foi possível atualizar o perfil");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando perfil...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div>Perfil não encontrado</div>
        </main>
        <Footer />
      </div>
    );
  }

  const isVerified = profile.username === "Outliers Ofc";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Banner do perfil */}
          <div className="w-full h-48 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-lg mb-12"></div>
          
          {/* Perfil */}
          <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
            <div className="flex flex-col items-center -mt-16">
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
                <AvatarFallback className="text-4xl">
                  {profile.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {isOwner && (
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-4">
                      <Settings className="mr-2 h-4 w-4" />
                      Editar Perfil
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Editar perfil</DialogTitle>
                      <DialogDescription>
                        Atualize suas informações de perfil. Clique em salvar quando terminar.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                      <div className="grid gap-2">
                        <Label htmlFor="username">Nome de usuário</Label>
                        <Input
                          id="username"
                          name="username"
                          value={editForm.username}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label>Foto de perfil</Label>
                        <div className="flex flex-col space-y-2">
                          {editForm.avatar_url && (
                            <div className="w-20 h-20 mb-2 relative">
                              <AspectRatio ratio={1 / 1} className="bg-muted rounded-md overflow-hidden">
                                <img 
                                  src={editForm.avatar_url} 
                                  alt="Avatar" 
                                  className="object-cover w-full h-full"
                                />
                              </AspectRatio>
                            </div>
                          )}
                          
                          <Label 
                            htmlFor="avatar-upload" 
                            className="cursor-pointer bg-secondary/50 hover:bg-secondary/70 transition-colors py-2 px-4 rounded text-center"
                          >
                            {uploadingAvatar ? "Enviando..." : "Enviar foto"}
                          </Label>
                          <Input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={uploadingAvatar}
                            className="hidden"
                          />
                          
                          {uploadProgress > 0 && (
                            <div className="w-full space-y-1">
                              <Progress value={uploadProgress} className="w-full" />
                              <p className="text-xs text-muted-foreground text-right">{uploadProgress}%</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="bio">Biografia</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={editForm.bio}
                          onChange={handleInputChange}
                          placeholder="Conte um pouco sobre você..."
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="instagram_url">Instagram</Label>
                        <Input
                          id="instagram_url"
                          name="instagram_url"
                          value={editForm.instagram_url}
                          onChange={handleInputChange}
                          placeholder="https://instagram.com/seu_usuario"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="linkedin_url">LinkedIn</Label>
                        <Input
                          id="linkedin_url"
                          name="linkedin_url"
                          value={editForm.linkedin_url}
                          onChange={handleInputChange}
                          placeholder="https://linkedin.com/in/seu_usuario"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="youtube_url">YouTube</Label>
                        <Input
                          id="youtube_url"
                          name="youtube_url"
                          value={editForm.youtube_url}
                          onChange={handleInputChange}
                          placeholder="https://youtube.com/@seu_canal"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="facebook_url">Facebook</Label>
                        <Input
                          id="facebook_url"
                          name="facebook_url"
                          value={editForm.facebook_url}
                          onChange={handleInputChange}
                          placeholder="https://facebook.com/seu_perfil"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
                      <Button onClick={handleSaveProfile}>Salvar alterações</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center">
                  <h1 className="text-3xl font-bold">{profile.username}</h1>
                  {isVerified && (
                    <CheckCircle className="h-5 w-5 ml-2 text-primary" fill="white" />
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Badge variant="outline">{profile.sector || "Área não especificada"}</Badge>
                </div>
              </div>
              
              <div className="flex items-center mt-2 text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm">Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              
              {/* Bio */}
              {profile.bio && (
                <div className="mt-6">
                  <p className="text-muted-foreground whitespace-pre-line">{profile.bio}</p>
                </div>
              )}
              
              {/* Redes sociais */}
              <div className="flex gap-4 mt-6">
                {profile.instagram_url && (
                  <a 
                    href={profile.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                
                {profile.linkedin_url && (
                  <a 
                    href={profile.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                
                {profile.youtube_url && (
                  <a 
                    href={profile.youtube_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                )}

                {profile.facebook_url && (
                  <a 
                    href={profile.facebook_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
          
          {/* Abas de conteúdo */}
          <Tabs defaultValue="articles" className="mt-6">
            <TabsList className="mb-8">
              <TabsTrigger value="articles">Artigos</TabsTrigger>
              <TabsTrigger value="about">Sobre</TabsTrigger>
            </TabsList>
            
            <TabsContent value="articles">
              {userArticles.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 mb-8">
                  {userArticles.map((article) => (
                    <BlogCard key={article.id} post={{
                      id: article.id,
                      title: article.title,
                      excerpt: article.excerpt || "",
                      content: article.content,
                      author: {
                        name: profile.username,
                        avatar: profile.avatar_url || ""
                      },
                      published_at: article.created_at,
                      category: article.sector || "Geral",
                      image: article.image_url || "",
                      likes: 0,
                      comments: 0
                    }} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Este usuário ainda não publicou nenhum artigo.</p>
                  {isOwner && (
                    <Button asChild>
                      <Link to="/new-article">Publicar um artigo</Link>
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="about">
              <div className="bg-secondary/10 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-4">Sobre {profile.username}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Bio</h4>
                    <p className="text-muted-foreground">
                      {profile.bio || "Este usuário ainda não adicionou uma biografia."}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Redes Sociais</h4>
                    <div className="flex flex-col gap-2">
                      {(profile.instagram_url || profile.linkedin_url || profile.youtube_url || profile.facebook_url) ? (
                        <>
                          {profile.instagram_url && (
                            <a 
                              href={profile.instagram_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center text-muted-foreground hover:text-foreground"
                            >
                              <Instagram className="h-4 w-4 mr-2" /> Instagram
                            </a>
                          )}
                          
                          {profile.linkedin_url && (
                            <a 
                              href={profile.linkedin_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center text-muted-foreground hover:text-foreground"
                            >
                              <Linkedin className="h-4 w-4 mr-2" /> LinkedIn
                            </a>
                          )}
                          
                          {profile.youtube_url && (
                            <a 
                              href={profile.youtube_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center text-muted-foreground hover:text-foreground"
                            >
                              <Youtube className="h-4 w-4 mr-2" /> YouTube
                            </a>
                          )}

                          {profile.facebook_url && (
                            <a 
                              href={profile.facebook_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center text-muted-foreground hover:text-foreground"
                            >
                              <Facebook className="h-4 w-4 mr-2" /> Facebook
                            </a>
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground">Nenhuma rede social foi adicionada.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
