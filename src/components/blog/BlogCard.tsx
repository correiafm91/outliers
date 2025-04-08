
import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  published_at: string;
  category: string;
  image: string;
  likes: number;
  comments: number;
  aspect_ratio?: string; // New field to handle image aspect ratio
}

interface BlogCardProps {
  post: BlogPost;
  className?: string;
  featured?: boolean;
}

export function BlogCard({ post, className = "", featured = false }: BlogCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  const formattedDate = formatDistanceToNow(new Date(post.published_at), { addSuffix: true });
  
  // Handle aspect ratio
  const aspectRatio = post.aspect_ratio || "16/9";

  if (featured) {
    return (
      <div className={`outliers-card h-full overflow-hidden group ${className} animate-once animate-fade-in`}>
        <div className="flex flex-col h-full">
          <div className="relative overflow-hidden rounded-md" style={{ aspectRatio: aspectRatio.replace(':', '/') }}>
            <img 
              src={post.image} 
              alt={post.title} 
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="flex-1 mt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{post.category}</Badge>
              <span className="text-sm text-muted-foreground">{formattedDate}</span>
            </div>
            
            <Link to={`/blog/${post.id}`}>
              <h3 className="heading-md hover:text-primary/80 transition-colors">{post.title}</h3>
            </Link>
            
            <p className="text-muted-foreground line-clamp-2">{post.excerpt}</p>
            
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>{post.author.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{post.author.name}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="icon" onClick={toggleLike} className={`${liked ? 'text-destructive' : ''}`}>
                  <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                </Button>
                <span className="text-sm">{likeCount}</span>
                
                <Link to={`/blog/${post.id}#comments`}>
                  <Button variant="ghost" size="icon">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </Link>
                <span className="text-sm">{post.comments}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`outliers-card group ${className} animate-once animate-fade-in`}>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="sm:w-1/3 overflow-hidden rounded-md" style={{ aspectRatio: aspectRatio.replace(':', '/') }}>
          <img 
            src={post.image} 
            alt={post.title} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="sm:w-2/3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{post.category}</Badge>
              <span className="text-sm text-muted-foreground">{formattedDate}</span>
            </div>
            
            <Link to={`/blog/${post.id}`}>
              <h3 className="heading-sm hover:text-primary/80 transition-colors">{post.title}</h3>
            </Link>
            
            <p className="text-muted-foreground text-sm line-clamp-2">{post.excerpt}</p>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{post.author.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <span className="text-xs sm:text-sm font-medium">{post.author.name}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" onClick={toggleLike} className={`${liked ? 'text-destructive' : ''}`}>
                <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              </Button>
              <span className="text-xs sm:text-sm">{likeCount}</span>
              
              <Link to={`/blog/${post.id}#comments`}>
                <Button variant="ghost" size="icon">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </Link>
              <span className="text-xs sm:text-sm">{post.comments}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
