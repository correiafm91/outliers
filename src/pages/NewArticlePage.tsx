
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function NewArticlePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [sector, setSector] = useState("other");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    try {
      setPublishing(true);
      
      if (!title || !content) {
        toast.error("Título e conteúdo são obrigatórios");
        setPublishing(false);
        return;
      }
      
      if (!user) {
        toast.error("Você precisa estar logado para publicar um artigo");
        setPublishing(false);
        return;
      }
      
      // Convert sector to a valid type
      const validSector = sector === "blog" ? "other" : sector;
      
      const { data, error } = await supabase
        .from('articles')
        .insert({
          title,
          content,
          excerpt: excerpt || content.substring(0, 150) + '...',
          author_id: user.id,
          image_url: imageUrl,
          video_url: videoUrl,
          sector: validSector as "other" | "technology" | "marketing" | "gastronomy" | "education" | "finance" | "health" | "sports" | "entertainment",
          aspect_ratio: aspectRatio
        });
      
      if (error) throw error;
      
      toast.success("Artigo publicado com sucesso!");
      navigate("/blog");
    } catch (error) {
      console.error("Erro ao publicar artigo:", error);
      toast.error("Erro ao publicar artigo");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-12">
        <h1 className="text-3xl font-bold mb-6">Novo Artigo</h1>
        
        <div className="grid gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium">Título</label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do artigo"
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium">Conteúdo</label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Conteúdo do artigo"
            />
          </div>
          
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium">Resumo</label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Resumo do artigo"
            />
          </div>
          
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium">URL da Imagem</label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="URL da imagem do artigo"
            />
          </div>
          
          <div>
            <label htmlFor="videoUrl" className="block text-sm font-medium">URL do Vídeo</label>
            <Input
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="URL do vídeo do artigo"
            />
          </div>
          
          <div>
            <label htmlFor="sector" className="block text-sm font-medium">Setor</label>
            <select
              id="sector"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="block w-full border rounded-md p-2"
            >
              <option value="other">Outro</option>
              <option value="blog">Blog</option>
              <option value="news">Notícias</option>
              <option value="tutorial">Tutorial</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="aspectRatio" className="block text-sm font-medium">Proporção</label>
            <select
              id="aspectRatio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="block w-full border rounded-md p-2"
            >
              <option value="16:9">16:9</option>
              <option value="4:3">4:3</option>
              <option value="1:1">1:1</option>
            </select>
          </div>
          
          <Button onClick={handlePublish} disabled={publishing}>
            {publishing ? "Publicando..." : "Publicar Artigo"}
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
