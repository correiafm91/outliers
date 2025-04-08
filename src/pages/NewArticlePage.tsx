import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function NewArticlePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("16:9");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video" | "none">("none");

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
    
    if (!user) {
      toast.error("Você precisa estar logado para criar uma publicação");
      navigate("/auth");
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error("Por favor preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload image if selected
      let imageUrl = null;
      let videoUrl = null;
      
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

      // Insert article
      const { data, error } = await supabase
        .from("articles")
        .insert({
          title,
          content,
          author_id: user.id,
          image_url: imageUrl,
          video_url: videoUrl,
          sector: "other",
          aspect_ratio: mediaType === "image" ? aspectRatio : null
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Publicação criada com sucesso!");
      navigate(`/blog/${data.id}`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar publicação");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Nova Publicação</CardTitle>
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
