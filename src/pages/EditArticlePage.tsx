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
import { Image, Loader2, Video } from "lucide-react";

type AspectRatioType = "16:9" | "4:3" | "1:1" | "3:2";

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState<any | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mediaType, setMediaType] = useState<"image" | "video" | "none">("none");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("16:9");

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
        toast.error("Você não tem permissão para editar esta publicação");
        navigate(-1);
        return;
      }

      setArticle(data);
      setTitle(data.title);
      setContent(data.content);
      
      if (data.image_url) {
        setImagePreview(data.image_url);
        setMediaType("image");
        setAspectRatio((data.aspect_ratio as AspectRatioType) || "16:9");
      } else if (data.video_url) {
        setVideoPreview(data.video_url);
        setMediaType("video");
      }
      
      setIsLoading(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar publicação");
      navigate("/profile/" + user?.id);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setMediaType("image");
      setVideoFile(null);
      setVideoPreview(null);
    }
  };

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setMediaType("video");
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !article) {
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error("Por favor preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload image if selected
      let imageUrl = mediaType === "image" && !imageFile ? article.image_url : null;
      let videoUrl = mediaType === "video" && !videoFile ? article.video_url : null;
      
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
      
      if (videoFile) {
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `videos/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(filePath, videoFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('videos')
          .getPublicUrl(filePath);

        videoUrl = urlData.publicUrl;
      }

      // Update article
      const { error } = await supabase
        .from("articles")
        .update({
          title,
          content,
          image_url: imageUrl,
          video_url: videoUrl,
          aspect_ratio: mediaType === "image" ? aspectRatio : null,
          updated_at: new Date().toISOString()
        })
        .eq("id", article.id);

      if (error) throw error;
      
      toast.success("Publicação atualizada com sucesso!");
      navigate(`/blog/${article.id}`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar publicação");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Carregando publicação...</p>
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
            <CardTitle>Editar Publicação</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título da sua publicação"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="block mb-2">Mídia (escolha imagem ou vídeo)</Label>
                <div className="flex flex-wrap gap-4 mb-4">
                  <Button
                    type="button"
                    variant={mediaType === "image" ? "default" : "outline"}
                    onClick={() => setMediaType("image")}
                    className="flex items-center gap-2"
                  >
                    <Image className="h-4 w-4" />
                    Imagem
                  </Button>
                  <Button
                    type="button"
                    variant={mediaType === "video" ? "default" : "outline"}
                    onClick={() => setMediaType("video")}
                    className="flex items-center gap-2"
                  >
                    <Video className="h-4 w-4" />
                    Vídeo
                  </Button>
                  <Button
                    type="button"
                    variant={mediaType === "none" ? "default" : "outline"}
                    onClick={() => {
                      setMediaType("none");
                      setImageFile(null);
                      setVideoFile(null);
                      setImagePreview(null);
                      setVideoPreview(null);
                    }}
                    className="flex items-center gap-2"
                  >
                    Nenhuma mídia
                  </Button>
                </div>

                {mediaType === "image" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("image")?.click()}
                        className="flex items-center gap-2"
                      >
                        <Image className="h-4 w-4" />
                        {imagePreview ? "Trocar imagem" : "Escolher imagem"}
                      </Button>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      {imagePreview && <span className="text-sm text-muted-foreground">Imagem selecionada</span>}
                    </div>
                    
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
                      
                      <div className="mt-4 overflow-hidden rounded-md border border-border" style={{ aspectRatio: aspectRatio.replace(':', '/') }}>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {mediaType === "video" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("video")?.click()}
                        className="flex items-center gap-2"
                      >
                        <Video className="h-4 w-4" />
                        {videoPreview ? "Trocar vídeo" : "Escolher vídeo"}
                      </Button>
                      <Input
                        id="video"
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleVideoChange}
                      />
                      {videoPreview && <span className="text-sm text-muted-foreground">Vídeo selecionado</span>}
                    </div>
                    
                    {videoPreview && (
                      <div className="mt-4 overflow-hidden rounded-md border border-border">
                        <video
                          src={videoPreview}
                          controls
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva o conteúdo da sua publicação"
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
                  "Atualizar Publicação"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
