import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pencil, Trash2, Copy, Bell, User, Loader2, Instagram, Youtube, Linkedin } from "lucide-react";
import { Profile, Article, Follower, Notification } from "@/types/profile";
import { ShareButton } from "@/components/share/ShareButton";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile: currentUserProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchArticles();
    
    if (user) {
      setIsCurrentUser(id === user.id);
      if (id === user.id) {
        fetchNotifications();
      }
      
      try {
        fetchFollowers();
        checkIfFollowing();
      } catch (error) {
        console.error("Erro ao carregar informações de seguidores:", error);
      }
    }
  }, [id, user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao buscar perfil:", error);
        toast.error("Erro ao carregar perfil");
        return;
      }

      setProfile(data as Profile);
      setEditedProfile({
        username: data.username,
        sector: data.sector,
        bio: data.bio || ""
      });
    } catch (error) {
      console.error("Erro em fetchProfile:", error);
      toast.error("Erro ao carregar informações do perfil");
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("author_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar artigos:", error);
        return;
      }

      setArticles(data || []);
    } catch (error) {
      console.error("Erro em fetchArticles:", error);
    }
  };

  const fetchFollowers = async () => {
    if (!id) return;
    
    try {
      try {
        const { data: followersData } = await supabase
          .from("followers")
          .select(`
            *,
            follower:profiles!followers_follower_id_fkey(*)
          `)
          .eq("following_id", id);

        if (followersData) {
          setFollowers(followersData as unknown as Follower[]);
        }
      } catch (error) {
        console.log("Tabela de seguidores pode não existir:", error);
        setFollowers([]);
      }

      try {
        const { count } = await supabase
          .from("followers")
          .select("*", { count: "exact" })
          .eq("follower_id", id);

        setFollowing(count || 0);
      } catch (error) {
        console.log("Erro ao contar seguindo:", error);
        setFollowing(0);
      }
    } catch (error) {
      console.error("Erro em fetchFollowers:", error);
    }
  };

  const checkIfFollowing = async () => {
    if (!user || !id) return;
    
    try {
      const { data } = await supabase
        .from("followers")
        .select("*")
        .eq("follower_id", user.id)
        .eq("following_id", id)
        .maybeSingle();

      setIsFollowing(!!data);
    } catch (error) {
      console.error("Erro ao verificar se está seguindo:", error);
      setIsFollowing(false);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from("notifications")
        .select(`
          *,
          actor:profiles(*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data as unknown as Notification[]);
      }
    } catch (error) {
      console.error("Erro em fetchNotifications:", error);
      setNotifications([]);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!id) return;

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("followers")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", id);

        if (error) {
          console.error("Erro ao deixar de seguir:", error);
          throw error;
        }
        
        toast.success("Deixou de seguir com sucesso!");
      } else {
        const { error } = await supabase
          .from("followers")
          .insert({
            follower_id: user.id,
            following_id: id
          });

        if (error) {
          console.error("Erro ao seguir:", error);
          throw error;
        }
        
        toast.success("Seguindo agora!");
      }

      fetchFollowers();
      checkIfFollowing();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar status de seguidor");
    }
  };

  const handleArticleDelete = async (articleId: string) => {
    setArticleToDelete(articleId);
    setConfirmDeleteDialogOpen(true);
  };

  const confirmDeleteArticle = async () => {
    if (!articleToDelete) return;
    
    try {
      const { error: savedArticlesError } = await supabase
        .from("saved_articles")
        .delete()
        .eq("article_id", articleToDelete);
        
      if (savedArticlesError) {
        console.error("Erro ao excluir artigos salvos:", savedArticlesError);
        throw savedArticlesError;
      }
      
      const { error: likesError } = await supabase
        .from("likes")
        .delete()
        .eq("article_id", articleToDelete);
        
      if (likesError) {
        console.error("Erro ao excluir curtidas:", likesError);
        throw likesError;
      }
      
      const { error: commentsError } = await supabase
        .from("comments")
        .delete()
        .eq("article_id", articleToDelete);
        
      if (commentsError) {
        console.error("Erro ao excluir comentários:", commentsError);
        throw commentsError;
      }

      const { error: notificationsError } = await supabase
        .from("notifications")
        .delete()
        .eq("article_id", articleToDelete);
        
      if (notificationsError) {
        console.error("Erro ao excluir notificações:", notificationsError);
        throw notificationsError;
      }
      
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", articleToDelete);

      if (error) throw error;
      
      fetchArticles();
      toast.success("Artigo excluído com sucesso!");
      setConfirmDeleteDialogOpen(false);
      setArticleToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir artigo");
    }
  };

  const handleCopyLink = (articleId: string) => {
    const url = `${window.location.origin}/blog/${articleId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  };

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    try {
      let avatarUrl = profile?.avatar_url;

      if (imageFile) {
        setUploadingImage(true);
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `${user.id}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile, { upsert: true });

        if (uploadError) {
          console.error("Erro ao fazer upload de imagem:", uploadError);
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        avatarUrl = urlData.publicUrl;
        setUploadingImage(false);
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          username: editedProfile.username,
          sector: editedProfile.sector,
          bio: editedProfile.bio,
          avatar_url: avatarUrl,
          instagram_url: editedProfile.instagram_url,
          youtube_url: editedProfile.youtube_url,
          linkedin_url: editedProfile.linkedin_url
        })
        .eq("id", user.id);

      if (error) {
        console.error("Erro ao atualizar perfil:", error);
        throw error;
      }
      
      fetchProfile();
      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      setUploadingImage(false);
      toast.error(error.message || "Erro ao atualizar perfil");
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;
      
      fetchNotifications();
    } catch (error: any) {
      toast.error(error.message || "Erro ao marcar notificação como lida");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <p>Perfil não encontrado.</p>
        </div>
      </div>
    );
  }

  const sectorTranslations: Record<string, string> = {
    'technology': 'Tecnologia',
    'marketing': 'Marketing',
    'gastronomy': 'Gastronomia',
    'education': 'Educação',
    'finance': 'Finanças',
    'health': 'Saúde',
    'sports': 'Esportes',
    'entertainment': 'Entretenimento',
    'other': 'Outro'
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader className="relative">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-background">
                <AvatarImage src={profile.avatar_url || ""} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {profile.username && profile.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl">{profile.username}</CardTitle>
                <CardDescription>
                  <Badge variant="outline" className="mr-2">
                    {sectorTranslations[profile.sector] || profile.sector}
                  </Badge>
                  <span className="text-sm">
                    {followers.length} {followers.length === 1 ? 'Seguidor' : 'Seguidores'} · {following} Seguindo
                  </span>
                </CardDescription>
                {profile.bio && (
                  <p className="mt-2 text-sm text-muted-foreground">{profile.bio}</p>
                )}
                <div className="flex gap-3 mt-2">
                  {profile.instagram_url && (
                    <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" 
                       className="text-muted-foreground hover:text-primary transition-colors">
                      <Instagram size={18} />
                    </a>
                  )}
                  {profile.youtube_url && (
                    <a href={profile.youtube_url} target="_blank" rel="noopener noreferrer"
                       className="text-muted-foreground hover:text-primary transition-colors">
                      <Youtube size={18} />
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                       className="text-muted-foreground hover:text-primary transition-colors">
                      <Linkedin size={18} />
                    </a>
                  )}
                </div>
              </div>
              <div className="flex flex-row gap-2 md:self-start">
                {isCurrentUser ? (
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </Button>
                ) : (
                  <Button 
                    variant={isFollowing ? "outline" : "default"}
                    onClick={handleFollow}
                  >
                    {isFollowing ? "Deixar de Seguir" : "Seguir"}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="articles">Artigos</TabsTrigger>
            {isCurrentUser && <TabsTrigger value="notifications">Notificações</TabsTrigger>}
          </TabsList>

          <TabsContent value="articles" className="mt-6">
            {articles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum artigo publicado ainda.</p>
                {isCurrentUser && (
                  <Button className="mt-4" onClick={() => navigate("/new-article")}>
                    Criar Novo Artigo
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <Card key={article.id} className="overflow-hidden">
                    {article.image_url && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img 
                          src={article.image_url} 
                          alt={article.title}
                          className="h-full w-full object-cover transition-all hover:scale-105"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                      <CardDescription>
                        {new Date(article.created_at).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-3">{article.content}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => navigate(`/blog/${article.id}`)}>
                        Ler mais
                      </Button>
                      {isCurrentUser && (
                        <div className="flex gap-2">
                          <ShareButton 
                            title={article.title} 
                            id={article.id} 
                            type="article"
                            variant="ghost"
                            size="icon"
                          />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate(`/edit-article/${article.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleArticleDelete(article.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {isCurrentUser && (
            <TabsContent value="notifications" className="mt-6">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <p className="mt-4 text-muted-foreground">Nenhuma notificação ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={`${!notification.read ? 'border-primary' : ''}`}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={notification.actor?.avatar_url || ""} />
                            <AvatarFallback>
                              {notification.actor?.username.slice(0, 2).toUpperCase() || "??"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              <span className="font-bold">{notification.actor?.username}</span>
                              {" "}
                              {notification.type === 'like' && 'curtiu seu artigo'}
                              {notification.type === 'comment' && 'comentou no seu artigo'}
                              {notification.type === 'follow' && 'começou a seguir você'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleDateString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardFooter className="p-4 pt-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if (notification.article_id) {
                              navigate(`/blog/${notification.article_id}`);
                            } else if (notification.type === 'follow') {
                              navigate(`/profile/${notification.actor_id}`);
                            }
                            markNotificationAsRead(notification.id);
                          }}
                        >
                          Ver
                        </Button>
                        {!notification.read && (
                          <Button 
                            variant="link" 
                            size="sm"
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            Marcar como lida
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Perfil</DialogTitle>
              <DialogDescription>
                Atualize suas informações de perfil aqui.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center gap-4 mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={imageFile ? URL.createObjectURL(imageFile) : profile.avatar_url || ""}
                  />
                  <AvatarFallback className="text-2xl">
                    {profile.username && profile.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="picture" className="text-center block mb-2">
                    Foto de Perfil
                  </Label>
                  <Input 
                    id="picture" 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Nome de Usuário</Label>
                <Input 
                  id="name" 
                  value={editedProfile.username || ""}
                  onChange={(e) => setEditedProfile({...editedProfile, username: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sector">Área de Atuação</Label>
                <Select
                  value={editedProfile.sector || ""}
                  onValueChange={(value) => setEditedProfile({...editedProfile, sector: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma área" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Tecnologia</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="gastronomy">Gastronomia</SelectItem>
                    <SelectItem value="education">Educação</SelectItem>
                    <SelectItem value="finance">Finanças</SelectItem>
                    <SelectItem value="health">Saúde</SelectItem>
                    <SelectItem value="sports">Esportes</SelectItem>
                    <SelectItem value="entertainment">Entretenimento</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Conte um pouco sobre você"
                  value={editedProfile.bio || ""}
                  onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                  rows={4}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram size={16} /> Instagram
                </Label>
                <Input 
                  id="instagram" 
                  placeholder="https://instagram.com/seuusuario"
                  value={editedProfile.instagram_url || ""}
                  onChange={(e) => setEditedProfile({...editedProfile, instagram_url: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="youtube" className="flex items-center gap-2">
                  <Youtube size={16} /> YouTube
                </Label>
                <Input 
                  id="youtube" 
                  placeholder="https://youtube.com/@seucanal"
                  value={editedProfile.youtube_url || ""}
                  onChange={(e) => setEditedProfile({...editedProfile, youtube_url: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <Linkedin size={16} /> LinkedIn
                </Label>
                <Input 
                  id="linkedin" 
                  placeholder="https://linkedin.com/in/seuperfil"
                  value={editedProfile.linkedin_url || ""}
                  onChange={(e) => setEditedProfile({...editedProfile, linkedin_url: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
              <Button 
                onClick={handleProfileUpdate}
                disabled={uploadingImage}
              >
                {uploadingImage ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={confirmDeleteDialogOpen} onOpenChange={setConfirmDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir artigo</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este artigo? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDeleteDialogOpen(false)}>Cancelar</Button>
              <Button 
                variant="destructive" 
                onClick={confirmDeleteArticle}
              >
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
