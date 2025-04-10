
import { useState } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Facebook, Twitter, Linkedin } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
  title: string;
  id: string;
  type: 'article' | 'profile';
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export function ShareButton({ title, id, type, variant = 'outline', size = 'default', children }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  
  const getShareUrl = () => {
    // Use the window.location to get the base URL
    const baseUrl = window.location.origin;
    
    // Build a shorter, cleaner URL format
    if (type === 'article') {
      return `${baseUrl}/outliers/publicacao/${id}`;
    } else {
      return `${baseUrl}/outliers/perfil/${id}`;
    }
  };
  
  const shareUrl = getShareUrl();
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(shareUrl);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copiado para a área de transferência!");
    setOpen(false);
  };
  
  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
    setOpen(false);
  };
  
  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank');
    setOpen(false);
  };
  
  const shareToLinkedin = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank');
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Share2 className="h-4 w-4" />
          {size !== 'icon' && (children || "Compartilhar")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={copyToClipboard} className="gap-2 cursor-pointer">
          <Copy className="h-4 w-4" /> Copiar link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToFacebook} className="gap-2 cursor-pointer">
          <Facebook className="h-4 w-4" /> Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToTwitter} className="gap-2 cursor-pointer">
          <Twitter className="h-4 w-4" /> Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToLinkedin} className="gap-2 cursor-pointer">
          <Linkedin className="h-4 w-4" /> LinkedIn
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
