
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface SaveArticleButtonProps {
  articleId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function SaveArticleButton({ articleId, variant = 'ghost', size = 'icon' }: SaveArticleButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkIfSaved();
    }
  }, [articleId, user]);

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
    } catch (error) {
      console.error("Erro ao verificar se artigo está salvo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSaved = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para salvar artigos");
      return;
    }

    try {
      setIsLoading(true);
      
      if (isSaved) {
        // Remove from saved
        const { error } = await supabase
          .from("saved_articles")
          .delete()
          .eq("user_id", user.id)
          .eq("article_id", articleId);

        if (error) throw error;
        
        setIsSaved(false);
        toast.success("Artigo removido dos salvos");
      } else {
        // Add to saved
        const { error } = await supabase
          .from("saved_articles")
          .insert({
            user_id: user.id,
            article_id: articleId
          });

        if (error) throw error;
        
        setIsSaved(true);
        toast.success("Artigo salvo com sucesso");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar artigos salvos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleSaved}
      disabled={isLoading}
      title={isSaved ? "Remover dos salvos" : "Salvar artigo"}
      className={isSaved ? "text-primary" : ""}
    >
      <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
      {size !== 'icon' && (isSaved ? "Salvo" : "Salvar")}
    </Button>
  );
}
