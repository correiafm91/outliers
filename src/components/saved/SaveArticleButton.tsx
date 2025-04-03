
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SaveArticleButtonProps {
  articleId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

export function SaveArticleButton({ 
  articleId, 
  variant = "outline", 
  size = "icon",
  children 
}: SaveArticleButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savedId, setSavedId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkIfSaved();
    } else {
      setIsLoading(false);
    }
  }, [user, articleId]);

  const checkIfSaved = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("saved_articles")
        .select("id")
        .eq("user_id", user.id)
        .eq("article_id", articleId)
        .maybeSingle();
      
      if (error) throw error;
      
      setIsSaved(!!data);
      if (data) setSavedId(data.id);
    } catch (error) {
      console.error("Error checking saved status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSave = async () => {
    if (!user) {
      toast.error("Faça login para salvar artigos");
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (isSaved && savedId) {
        // Remove from saved
        const { error } = await supabase
          .from("saved_articles")
          .delete()
          .eq("id", savedId);
        
        if (error) throw error;
        
        setIsSaved(false);
        setSavedId(null);
        toast.success("Artigo removido dos salvos");
      } else {
        // Add to saved
        const { data, error } = await supabase
          .from("saved_articles")
          .insert({
            user_id: user.id,
            article_id: articleId
          })
          .select("id")
          .single();
        
        if (error) throw error;
        
        setIsSaved(true);
        setSavedId(data.id);
        toast.success("Artigo salvo com sucesso");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar artigo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleSave}
      disabled={isLoading}
      className={`gap-2 ${isSaved ? "text-primary" : ""}`}
    >
      <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
      {size !== "icon" && (children || "Salvar")}
    </Button>
  );
}
