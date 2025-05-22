
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";
import { Menu, LogOut, User, FileEdit, Bookmark, Search, Home } from "lucide-react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [profileData, setProfileData] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      setProfileData(data);
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
            Blog Platform
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex ml-6">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/" legacyBehavior passHref>
                <NavigationMenuLink 
                  className={navigationMenuTriggerStyle() + (location.pathname === "/" ? " bg-accent" : "")}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Início
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link to="/blog" legacyBehavior passHref>
                <NavigationMenuLink 
                  className={navigationMenuTriggerStyle() + (location.pathname.startsWith("/blog") ? " bg-accent" : "")}
                >
                  <FileEdit className="mr-2 h-4 w-4" />
                  Blog
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link to="/search" legacyBehavior passHref>
                <NavigationMenuLink 
                  className={navigationMenuTriggerStyle() + (location.pathname === "/search" ? " bg-accent" : "")}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            {/* Admin link, only visible for admins */}
            {isAdmin && (
              <NavigationMenuItem>
                <Link to="/admin" legacyBehavior passHref>
                  <NavigationMenuLink 
                    className={navigationMenuTriggerStyle() + (location.pathname.startsWith("/admin") ? " bg-accent text-accent-foreground" : "")}
                  >
                    Admin
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center space-x-2">
          {/* Search Button */}
          <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
            <Link to="/search">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Link>
          </Button>

          {/* User Authentication */}
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/saved" className="hidden md:block">
                <Button variant="ghost" size="sm">
                  <Bookmark className="mr-2 h-4 w-4" />
                  Salvos
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={profileData?.avatar_url || ""}
                        alt={profileData?.username || user.email}
                      />
                      <AvatarFallback>
                        {profileData?.username?.charAt(0).toUpperCase() || 
                          user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${user.id}`}>
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/saved">
                      <Bookmark className="mr-2 h-4 w-4" />
                      Artigos Salvos
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <FileEdit className="mr-2 h-4 w-4" />
                        Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button asChild className="hidden md:inline-flex">
              <Link to="/auth">Entrar</Link>
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="md:hidden"
                size="icon"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 py-4">
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={closeMobileMenu}
                  asChild
                >
                  <Link to="/">
                    <Home className="mr-2 h-5 w-5" />
                    Início
                  </Link>
                </Button>
                
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={closeMobileMenu}
                  asChild
                >
                  <Link to="/blog">
                    <FileEdit className="mr-2 h-5 w-5" />
                    Blog
                  </Link>
                </Button>
                
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={closeMobileMenu}
                  asChild
                >
                  <Link to="/search">
                    <Search className="mr-2 h-5 w-5" />
                    Buscar
                  </Link>
                </Button>
                
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={closeMobileMenu}
                  asChild
                >
                  <Link to="/saved">
                    <Bookmark className="mr-2 h-5 w-5" />
                    Salvos
                  </Link>
                </Button>
                
                {isAdmin && (
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={closeMobileMenu}
                    asChild
                  >
                    <Link to="/admin">
                      <FileEdit className="mr-2 h-5 w-5" />
                      Admin
                    </Link>
                  </Button>
                )}
                
                {user ? (
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      handleSignOut();
                      closeMobileMenu();
                    }}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Sair
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    className="justify-start"
                    onClick={closeMobileMenu}
                    asChild
                  >
                    <Link to="/auth">
                      <User className="mr-2 h-5 w-5" />
                      Entrar
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
