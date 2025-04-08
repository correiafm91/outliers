
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Menu, Search, Bell, User, PenSquare, Bookmark, Twitter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUnreadNotifications();
      
      const timer = setInterval(fetchUnreadNotifications, 60000);
      return () => clearInterval(timer);
    }
  }, [user]);

  const fetchUnreadNotifications = async () => {
    if (!user) return;
    
    try {
      // First get count for badge
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) {
        console.error("Error fetching notification count:", error);
        return;
      }

      setUnreadNotifications(count || 0);
      
      // Now get the actual notifications with related info
      const { data: notifications, error: notifError } = await supabase
        .from("notifications")
        .select(`
          id, 
          type, 
          read, 
          created_at,
          article_id,
          actor_id,
          profiles!actor_id (username, avatar_url)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
        
      if (notifError) {
        console.error("Error fetching notifications:", notifError);
        return;
      }
      
      setNotificationsList(notifications || []);
    } catch (error) {
      console.error("Error in fetchUnreadNotifications:", error);
    }
  };
  
  const handleNotificationClick = async (notificationId: string, articleId: string | null) => {
    try {
      // Mark notification as read
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);
        
      if (error) throw error;
      
      // Navigate to article if we have an ID
      if (articleId) {
        navigate(`/blog/${articleId}`);
      }
      
      // Refresh notifications count
      fetchUnreadNotifications();
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="https://i.postimg.cc/yd1dNnBH/High-resolution-stock-photo-A-professional-commercial-image-showcasing-a-grey-letter-O-logo-agains.jpg" 
              alt="Outliers Logo" 
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-bold hidden sm:inline-block">Outliers</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-4">
            <Button variant="link" asChild>
              <Link to="/">Início</Link>
            </Button>
            <Button variant="link" asChild>
              <Link to="/blogs">Artigos</Link>
            </Button>
            <Button variant="link" asChild>
              <Link to="/saved-articles">Salvos</Link>
            </Button>
          </nav>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar..."
              className="w-[200px] lg:w-[300px] pl-8 bg-secondary text-secondary-foreground focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          
          {user ? (
            <>
              <Button variant="outline" size="icon" onClick={() => navigate("/new-article")} title="Novo Artigo">
                <PenSquare className="h-5 w-5" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={() => navigate("/saved-articles")} title="Artigos Salvos">
                <Bookmark className="h-5 w-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative"
                    title="Notificações"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                      >
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {notificationsList.length > 0 ? (
                    notificationsList.map(notif => (
                      <DropdownMenuItem 
                        key={notif.id} 
                        className={`p-3 cursor-pointer ${!notif.read ? 'bg-secondary/40' : ''}`}
                        onClick={() => handleNotificationClick(notif.id, notif.article_id)}
                      >
                        <div className="flex items-start gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={notif.profiles?.avatar_url || ""} />
                            <AvatarFallback>{notif.profiles?.username?.slice(0, 2) || "??"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">{notif.profiles?.username}</span>
                              {notif.type === 'like' && ' curtiu seu artigo'}
                              {notif.type === 'comment' && ' comentou em seu artigo'}
                              {notif.type === 'follow' && ' começou a seguir você'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notif.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      Nenhuma notificação
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar>
                      <AvatarImage src={profile?.avatar_url || ""} alt={profile?.username} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {profile?.username?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${user.id}`}>Meu Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/new-article">Novo Artigo</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/saved-articles">Artigos Salvos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={() => navigate("/auth")} variant="default">
              Entrar
            </Button>
          )}
        </div>
        
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowMobileMenu(!showMobileMenu)}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      
      {showMobileMenu && (
        <div className="md:hidden border-t border-border bg-background p-4 animate-fade-in">
          <nav className="grid gap-2">
            <Link to="/" className="flex items-center py-2 hover:text-primary/80">Início</Link>
            <Link to="/blogs" className="flex items-center py-2 hover:text-primary/80">Artigos</Link>
            <Link to="/saved-articles" className="flex items-center py-2 hover:text-primary/80">Artigos Salvos</Link>
            <Link to="/search" className="flex items-center py-2 hover:text-primary/80">Pesquisar</Link>
            
            {user ? (
              <>
                <Link to={`/profile/${user.id}`} className="flex items-center py-2 hover:text-primary/80">
                  <User className="mr-2 h-4 w-4" />
                  Meu Perfil
                </Link>
                <Link to="/new-article" className="flex items-center py-2 hover:text-primary/80">
                  <PenSquare className="mr-2 h-4 w-4" />
                  Novo Artigo
                </Link>
                <Button variant="outline" className="mt-2" onClick={handleLogout}>
                  Sair
                </Button>
              </>
            ) : (
              <Button className="mt-2" onClick={() => navigate("/auth")}>
                Entrar
              </Button>
            )}
            
            <div className="py-2 mt-2">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Pesquisar..."
                  className="w-full pl-8 bg-secondary text-secondary-foreground"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
