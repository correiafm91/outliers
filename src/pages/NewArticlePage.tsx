
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/use-admin";
import { Navbar } from "@/components/layout/Navbar";
import { supabase, checkBucketExists } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Image, Loader2, Video, AlertCircle } from "lucide-react";

type AspectRatioType = "16:9" | "4:3" | "1:1" | "3:2";

export default function NewArticlePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("16:9");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video" | "none">("none");
  const [bucketsChecked, setBucketsChecked] = useState(false);
  const [bucketsAvailable, setBucketsAvailable] = useState({
    images: false,
    videos: false
  });

  useEffect(() => {
    // Check if user is logged in and is admin
    if (!user) {
      toast.error("Você precisa estar logado para criar artigos");
      navigate("/auth");
      return;
    }

    if (!isAdmin) {
      toast.error("Apenas administradores podem criar artigos");
      navigate("/");
      return;
    }

    checkStorageBuckets();
  }, [user, isAdmin, navigate]);

  const checkStorageBuckets = async () => {
    const imagesExists = await checkBucketExists('images');
    const videosExists = await checkBucketExists('videos');
    
    setBucketsAvailable({
      images: imagesExists,
      videos: videosExists
    });
    
    setBucketsChecked(true);
    
    if (!imagesExists || !videosExists) {
      toast.warning(
        "Alguns recursos de armazenamento podem não estar disponíveis no momento.",
        { duration: 6000 }
      );
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter menos de 5MB");
        return;
      }
      
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
      
      // Check file size (max 30MB)
      if (file.size > 30 * 1024 * 1024) {
        toast.error("O vídeo deve ter menos de 30MB");
        return;
      }
      
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setMediaType("video");
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Você precisa estar logado para criar um artigo");
      navigate("/auth");
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload image if selected
      let imageUrl = null;
      let videoUrl = null;
      
      if (imageFile) {
        if (!bucketsAvailable.images) {
          // Re-check if the bucket exists
          const exists = await checkBucketExists('images');
          if (!exists) {
            throw new Error("O armazenamento de imagens não está disponível no momento");
          }
        }
        
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `articles/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile);

        if (uploadError) {
          if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
            throw new Error("Sistema de armazenamento indisponível. Tente novamente mais tarde.");
          }
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }
      
      if (videoFile) {
        if (!bucketsAvailable.videos) {
          // Re-check if the bucket exists
          const exists = await checkBucketExists('videos');
          if (!exists) {
            throw new Error("O armazenamento de vídeos não está disponível no momento");
          }
        }
        
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `videos/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(filePath, videoFile);

        if (uploadError) {
          if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
            throw new Error("Sistema de armazenamento indisponível. Tente novamente mais tarde.");
          }
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from('videos')
          .getPublicUrl(filePath);

        videoUrl = urlData.publicUrl;
      }

      // Insert article
      const { data, error } = await supabase
        .from("articles")
        .insert({
          title,
          content,
          excerpt: excerpt || content.substring(0, 150) + "...",
          author_id: user.id,
          image_url: imageUrl,
          video_url: videoUrl,
          sector: "blog",
          aspect_ratio: mediaType === "image" ? aspectRatio : null
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Artigo criado com sucesso!");
      navigate(`/blog/${data.id}`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar artigo");
      console.error("Error during article creation:", error);
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) {
    return null; // Don't render anything if not admin
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Novo Artigo</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {!bucketsChecked && (
                <div className="p-3 bg-yellow-50 text-yellow-800 rounded-md flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verificando disponibilidade de armazenamento...</span>
                </div>
              )}
              
              {bucketsChecked && (!bucketsAvailable.images || !bucketsAvailable.videos) && (
                <div className="p-3 bg-yellow-50 text-yellow-800 rounded-md flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Alguns recursos de armazenamento podem não estar disponíveis. Você ainda pode criar um artigo sem mídia.</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título do artigo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Resumo</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Digite um breve resumo (opcional)"
                  className="h-24"
                />
                <p className="text-xs text-muted-foreground">
                  Se deixado em branco, um resumo será gerado automaticamente a partir do conteúdo
                </p>
              </div>

              <div className="space-y-2">
                <Label className="block mb-2">Mídia (escolha imagem ou vídeo)</Label>
                <div className="flex flex-wrap gap-4 mb-4">
                  <Button
                    type="button"
                    variant={mediaType === "image" ? "default" : "outline"}
                    onClick={() => setMediaType("image")}
                    className="flex items-center gap-2"
                    disabled={!bucketsAvailable.images && bucketsChecked}
                  >
                    <Image className="h-4 w-4" />
                    Imagem
                  </Button>
                  <Button
                    type="button"
                    variant={mediaType === "video" ? "default" : "outline"}
                    onClick={() => setMediaType("video")}
                    className="flex items-center gap-2"
                    disabled={!bucketsAvailable.videos && bucketsChecked}
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
                    Sem mídia
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
                          <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                          <SelectItem value="4:3">4:3 (Padrão)</SelectItem>
                          <SelectItem value="1:1">1:1 (Quadrado)</SelectItem>
                          <SelectItem value="3:2">3:2 (Retrato)</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {imagePreview && (
                        <div className="mt-4 overflow-hidden rounded-md border border-border" style={{ aspectRatio: aspectRatio.replace(':', '/') }}>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
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
                  placeholder="Escreva o conteúdo do artigo"
                  className="min-h-[250px]"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin")}
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
                  "Publicar"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
