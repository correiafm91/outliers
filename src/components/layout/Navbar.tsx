
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Menu, 
  X, 
  LucideIcon, 
  User, 
  LogOut, 
  Bell, 
  Settings,
  BookMarked
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface NavbarProps {
  transparent?: boolean;
}

export function Navbar({ transparent = false }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select(`
          *,
          actor:profiles(username, avatar_url),
          article:articles(title)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching notifications:", error);
        return;
      }

      setNotifications(data || []);
      
      // Count unread notifications
      const unread = data ? data.filter(n => !n.read).length : 0;
      setUnreadCount(unread);
    } catch (error: any) {
      console.error("Error fetching notifications:", error.message);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) {
        console.error("Error marking notification as read:", error);
        return;
      }

      fetchNotifications();
    } catch (error: any) {
      console.error("Error marking notification as read:", error.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) {
        console.error("Error marking all notifications as read:", error);
        return;
      }

      fetchNotifications();
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error.message);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isVerified = profile?.username === "Outliers Oficial";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-colors",
        isScrolled 
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" 
          : transparent 
            ? "bg-transparent border-transparent"
            : "bg-background"
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="hidden md:flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block text-xl">
              Networking Brasil
            </span>
          </Link>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          {/* Desktop navigation */}
          <div className="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/blogs" className={navigationMenuTriggerStyle()}>
                    Explorar
                  </Link>
                </NavigationMenuItem>
                {user && (
                  <NavigationMenuItem>
                    <Link to="/saved" className={navigationMenuTriggerStyle()}>
                      Salvos
                    </Link>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* Search bar */}
        <div className="hidden md:flex mx-4 flex-1 max-w-md">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Pesquisar..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Auth and user menu */}
        <div className="flex items-center gap-2">
          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => navigate("/search")}
          >
            <Search className="h-6 w-6" />
          </Button>

          {user ? (
            <>
              <Button 
                variant="outline" 
                className="hidden md:flex"
                onClick={() => navigate("/new-article")}
              >
                Criar
              </Button>

              {/* Notifications dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between px-4 py-2">
                    <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                        Marcar todas como lidas
                      </Button>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => {
                        const isActorVerified = notification.actor?.username === "Outliers Oficial";
                        return (
                          <DropdownMenuItem 
                            key={notification.id}
                            className={cn(
                              "flex items-start p-3 cursor-pointer",
                              !notification.read && "bg-muted/50"
                            )}
                            onClick={() => {
                              if (!notification.read) {
                                handleMarkAsRead(notification.id);
                              }
                              if (notification.article_id) {
                                navigate(`/blog/${notification.article_id}`);
                              } else if (notification.type === 'follow') {
                                navigate(`/profile/${notification.actor_id}`);
                              }
                            }}
                          >
                            <Avatar className="h-8 w-8 mr-3 mt-1">
                              <AvatarImage 
                                src={notification.actor?.avatar_url || undefined} 
                                alt={notification.actor?.username || "User"} 
                              />
                              <AvatarFallback>
                                {notification.actor?.username?.slice(0, 2).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm">
                                <span className="font-medium">
                                  {notification.actor?.username || "Alguém"}
                                </span>
                                {isActorVerified && (
                                  <Badge variant="verified" className="ml-1 text-xs">Verificado</Badge>
                                )}
                                {notification.type === 'like' && ' curtiu sua publicação '}
                                {notification.type === 'comment' && ' comentou em sua publicação '}
                                {notification.type === 'follow' && ' começou a seguir você '}
                                {notification.article && (
                                  <span className="font-medium">
                                    "{notification.article.title}"
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(notification.created_at).toLocaleDateString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </DropdownMenuItem>
                        );
                      })
                    ) : (
                      <div className="px-4 py-3 text-sm text-muted-foreground">
                        Nenhuma notificação recente
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={profile?.avatar_url || undefined} 
                        alt={profile?.username || "User"} 
                      />
                      <AvatarFallback>
                        {profile?.username?.slice(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center gap-2 px-2 pt-1">
                    <DropdownMenuLabel>{profile?.username}</DropdownMenuLabel>
                    {isVerified && <Badge variant="verified">Verificado</Badge>}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/saved")}>
                    <BookMarked className="mr-2 h-4 w-4" />
                    <span>Salvos</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth">
                <Button variant="outline" size="sm">Entrar</Button>
              </Link>
              <Link to="/auth?register=true">
                <Button size="sm">Cadastrar</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 px-4 space-y-4">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Pesquisar..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
            <div className="space-y-1">
              <Link to="/blogs" className="block py-2 px-3 rounded-md hover:bg-muted">
                Explorar
              </Link>
              {user && (
                <>
                  <Link to="/saved" className="block py-2 px-3 rounded-md hover:bg-muted">
                    Salvos
                  </Link>
                  <Link to="/new-article" className="block py-2 px-3 rounded-md hover:bg-muted">
                    Criar publicação
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
