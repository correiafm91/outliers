
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CommentFormProps {
  postId: string;
  onCommentAdded?: () => void;
}

export function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This will be replaced with Supabase implementation
    console.log("Profile created", { username, profileImage });
    setDialogOpen(false);
    toast.success("Profile created successfully!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    
    // This is a placeholder - will be replaced with Supabase
    console.log("Submitting comment for post", postId, comment);
    
    // Simulate API call
    setTimeout(() => {
      setComment("");
      setIsSubmitting(false);
      if (onCommentAdded) onCommentAdded();
      toast.success("Comment posted successfully!");
    }, 1000);
  };

  // Placeholder - will be replaced with Supabase auth
  const user = {
    name: "Guest",
    image: null
  };
  
  const hasProfile = !!user.name && user.name !== "Guest";

  return (
    <div className="space-y-4 animate-fade-in">
      <h3 className="heading-sm">Leave a comment</h3>
      
      {hasProfile ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image || ""} alt={user.name} />
              <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <Textarea
              placeholder="Share your thoughts..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1 resize-none"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !comment.trim()}>
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 border border-dashed border-border rounded-md">
          <p className="text-muted-foreground mb-4 text-center">
            You need to create a profile before commenting
          </p>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create Profile</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create your profile</DialogTitle>
                <DialogDescription>
                  Set up a username and profile picture to start commenting.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleProfileSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      placeholder="Choose a username"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-image">Profile Picture</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={previewUrl || ""} alt="Preview" />
                        <AvatarFallback>{username ? username.slice(0, 2) : "U"}</AvatarFallback>
                      </Avatar>
                      <Input 
                        id="profile-image" 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={!username}>Save Profile</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
