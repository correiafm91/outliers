
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Image, Loader2 } from "lucide-react";

type SectorType = "technology" | "marketing" | "gastronomy" | "education" | "finance" | "health" | "sports" | "entertainment" | "other";
type AspectRatioType = "16:9" | "4:3" | "1:1" | "3:2";

interface Article {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  sector: SectorType;
  author_id: string;
  aspect_ratio?: string;
}

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sector, setSector] = useState<SectorType>("other");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("16:9");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchArticle();
  }, [id, user, navigate]);

  const fetchArticle = async () => {
    try {
      if (!id) return;
      
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data.author_id !== user?.id) {
        toast.error("Você não tem permissão para editar este artigo");
        navigate(-1);
        return;
      }

      setArticle(data as Article);
      setTitle(data.title);
      setContent(data.content);
      setSector(data.sector as SectorType);
      setAspectRatio((data.aspect_ratio as AspectRatioType) || "16:9");
      
      if (data.image_url) {
        setPreview(data.image_url);
      }
      
      setIsLoading(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar artigo");
      navigate("/profile/" + user?.id);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !article) {
      return;
    }

    if (!title.trim() || !content.trim() || !sector) {
      toast.error("Por favor preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload image if selected
      let imageUrl = article.image_url;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `articles/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      // Update article
      const { error } = await supabase
        .from("articles")
        .update({
          title,
          content,
          sector,
          image_url: imageUrl,
          aspect_ratio: aspectRatio,
          updated_at: new Date().toISOString()
        })
        .eq("id", article.id);

      if (error) throw error;
      
      toast.success("Artigo atualizado com sucesso!");
      navigate(`/blog/${article.id}`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar artigo");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Carregando artigo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Editar Artigo</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título do seu artigo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sector">Área *</Label>
                <Select
                  value={sector}
                  onValueChange={(value) => setSector(value as SectorType)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma área" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Tecnologia</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="gastronomy">Gastronomia</SelectItem>
                    <SelectItem value="education">Educação</SelectItem>
                    <SelectItem value="finance">Finanças</SelectItem>
                    <SelectItem value="health">Saúde</SelectItem>
                    <SelectItem value="sports">Esportes</SelectItem>
                    <SelectItem value="entertainment">Entretenimento</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Imagem de Capa</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("image")?.click()}
                    className="flex items-center gap-2"
                  >
                    <Image className="h-4 w-4" />
                    {preview ? "Trocar imagem" : "Escolher imagem"}
                  </Button>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  {preview && <span className="text-sm text-muted-foreground">Imagem selecionada</span>}
                </div>
                
                {/* Aspect ratio selector */}
                {preview && (
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="aspectRatio">Proporção da imagem</Label>
                    <Select
                      value={aspectRatio}
                      onValueChange={(value) => setAspectRatio(value as AspectRatioType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha a proporção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">16:9 (Panorâmica)</SelectItem>
                        <SelectItem value="4:3">4:3 (Padrão)</SelectItem>
                        <SelectItem value="1:1">1:1 (Quadrada)</SelectItem>
                        <SelectItem value="3:2">3:2 (Retrato)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {preview && (
                  <div className="mt-4 overflow-hidden rounded-md border border-border" style={{ aspectRatio: aspectRatio.replace(':', '/') }}>
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva o conteúdo do seu artigo"
                  className="min-h-[200px]"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Atualizar Artigo"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
