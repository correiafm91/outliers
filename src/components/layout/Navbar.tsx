
import { useState } from "react";
import { Link } from "react-router-dom";
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
import { Menu, Search, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

export function Navbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  // Placeholder for user data - will be replaced with Supabase auth
  const user = {
    name: "Guest User",
    email: "user@example.com",
    image: null
  };

  const handleLogout = () => {
    // Placeholder - will be replaced with Supabase auth
    console.log("Logging out");
    navigate("/auth");
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
              <Link to="/">Home</Link>
            </Button>
            <Button variant="link" asChild>
              <Link to="/blogs">Blogs</Link>
            </Button>
            <Button variant="link" asChild>
              <Link to="/categories">Categories</Link>
            </Button>
            <Button variant="link" asChild>
              <Link to="/about">About</Link>
            </Button>
          </nav>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles..."
              className="w-[200px] lg:w-[300px] pl-8 bg-secondary text-secondary-foreground focus:ring-primary"
            />
          </div>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar>
                  <AvatarImage src="" alt={user.name} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground">{user.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/bookmarks">Bookmarks</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowMobileMenu(!showMobileMenu)}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-border bg-background p-4 animate-fade-in">
          <nav className="grid gap-2">
            <Link to="/" className="flex items-center py-2 hover:text-primary/80">Home</Link>
            <Link to="/blogs" className="flex items-center py-2 hover:text-primary/80">Blogs</Link>
            <Link to="/categories" className="flex items-center py-2 hover:text-primary/80">Categories</Link>
            <Link to="/about" className="flex items-center py-2 hover:text-primary/80">About</Link>
            <div className="py-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search articles..."
                  className="w-full pl-8 bg-secondary text-secondary-foreground"
                />
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
