
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

export interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  created_at: string;
  likes: number;
}

interface CommentListProps {
  comments: Comment[];
}

export function CommentList({ comments }: CommentListProps) {
  // If no comments, show message
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 animate-fade-in">
        <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="comments">
      <h3 className="heading-sm">Comments ({comments.length})</h3>
      <div className="space-y-6">
        {comments.map((comment, index) => (
          <CommentItem key={comment.id} comment={comment} delay={index} />
        ))}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  delay: number;
}

function CommentItem({ comment, delay }: CommentItemProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes);

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  const formattedDate = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true });
  
  const delayClass = `delay-${Math.min(delay * 100, 500)}`;

  return (
    <div className={`animate-once animate-fade-in ${delayClass}`}>
      <div className="flex gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback>{comment.author.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">{comment.author.name}</h4>
              <p className="text-sm text-muted-foreground">{formattedDate}</p>
            </div>
            <Button variant="ghost" size="icon">
              <Flag className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-foreground">{comment.content}</p>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={toggleLike} className={`${liked ? 'text-destructive' : ''}`}>
              <Heart className={`h-4 w-4 mr-1 ${liked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </Button>
          </div>
        </div>
      </div>
      <Separator className="mt-6" />
    </div>
  );
}
