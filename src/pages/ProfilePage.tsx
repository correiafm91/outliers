
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
import { Pencil, Trash2, Copy, Bell, User, Loader2 } from "lucide-react";

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  sector: string;
  bio?: string;
  created_at: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  sector: string;
}

interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower?: Profile;
}

interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: string;
  article_id?: string;
  read: boolean;
  created_at: string;
  actor?: Profile;
}

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

  useEffect(() => {
    fetchProfile();
    fetchArticles();
    
    if (user) {
      setIsCurrentUser(id === user.id);
      if (id === user.id) {
        fetchNotifications();
      }
      
      // Try to fetch followers info, but handle gracefully if tables don't exist yet
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

      setProfile(data);
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
      // Fetch followers - handle gracefully if table doesn't exist
      try {
        const { data: followersData } = await supabase
          .from("followers")
          .select(`
            *,
            follower:profiles!followers_follower_id_fkey(*)
          `)
          .eq("following_id", id);

        if (followersData) {
          setFollowers(followersData);
        }
      } catch (error) {
        console.log("Tabela de seguidores pode não existir:", error);
        setFollowers([]);
      }

      // Count following - handle gracefully if table doesn't exist
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
        setNotifications(data);
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
        // Unfollow
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
        // Follow
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

      // Refresh followers and following status
      fetchFollowers();
      checkIfFollowing();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar status de seguidor");
    }
  };

  const handleArticleDelete = async (articleId: string) => {
    try {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", articleId);

      if (error) throw error;
      
      // Refresh articles list
      fetchArticles();
      toast.success("Artigo excluído com sucesso!");
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

      // Upload image if selected
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

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          username: editedProfile.username,
          sector: editedProfile.sector,
          bio: editedProfile.bio,
          avatar_url: avatarUrl
        })
        .eq("id", user.id);

      if (error) {
        console.error("Erro ao atualizar perfil:", error);
        throw error;
      }
      
      // Refresh profile
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
      
      // Refresh notifications
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
                  {profile.username.slice(0, 2).toUpperCase()}
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
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleCopyLink(article.id)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate(`/edit-article/${article.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Excluir artigo</DialogTitle>
                                <DialogDescription>
                                  Tem certeza que deseja excluir este artigo? Esta ação não pode ser desfeita.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => {}}>Cancelar</Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={() => handleArticleDelete(article.id)}
                                >
                                  Excluir
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
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
                    {profile.username.slice(0, 2).toUpperCase()}
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
      </div>
    </div>
  );
}
