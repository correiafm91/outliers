
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Article, Profile } from "@/types/profile";
import { Loader2 } from "lucide-react";
import { BlogCard } from "@/components/blog/BlogCard";

export default function Index() {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [authorProfiles, setAuthorProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      
      // Buscar artigos recentes
      const { data: articles, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      if (articles && articles.length > 0) {
        // Separar artigos em destaque (3 primeiros) e recentes (4 seguintes)
        const featured = articles.slice(0, 3);
        const recent = articles.slice(3, 7);
        
        setFeaturedArticles(featured as Article[]);
        setRecentArticles(recent as Article[]);
        
        // Obter IDs de autores únicos
        const authorIds = Array.from(new Set([...featured, ...recent].map(article => article.author_id)));
        
        // Buscar perfis de autores
        if (authorIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .in('id', authorIds);
            
          if (profilesError) throw profilesError;
          
          // Criar mapa de perfis por ID
          const profileMap: Record<string, Profile> = {};
          profiles?.forEach(profile => {
            profileMap[profile.id] = profile;
          });
          
          setAuthorProfiles(profileMap);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar artigos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col items-center text-center mb-16 animate-once animate-fade-in">
              <h1 className="heading-xl max-w-3xl mb-6">Plataforma de Blog e Compartilhamento</h1>
              <Button size="lg" asChild>
                <Link to="/blogs">
                  Explorar Artigos
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            {/* Featured Posts */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : featuredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredArticles.map((article, index) => {
                  const author = authorProfiles[article.author_id];
                  return (
                    <div key={article.id} className="animate-once animate-fade-in delay-200" style={{ animationDelay: `${index * 150}ms` }}>
                      <BlogCard post={{
                        id: article.id,
                        title: article.title,
                        excerpt: article.excerpt || "",
                        content: article.content,
                        author: {
                          name: author?.username || "Autor desconhecido",
                          avatar: author?.avatar_url || ""
                        },
                        published_at: article.created_at,
                        category: article.sector || "Geral",
                        image: article.image_url || "",
                        video: article.video_url || "",
                        likes: 0,
                        comments: 0,
                        aspect_ratio: article.aspect_ratio
                      }} featured={true} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum artigo em destaque encontrado.</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/new-article">Criar um artigo</Link>
                </Button>
              </div>
            )}
          </div>
        </section>
        
        {/* Recent Posts */}
        {recentArticles.length > 0 && (
          <section className="py-16 px-4 bg-secondary/30">
            <div className="container mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="heading-lg animate-once animate-fade-in">Artigos Recentes</h2>
                <Button variant="outline" asChild className="animate-once animate-fade-in">
                  <Link to="/blogs">Ver Todos</Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {recentArticles.map((article, index) => {
                  const author = authorProfiles[article.author_id];
                  return (
                    <div key={article.id} className="animate-once animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                      <BlogCard post={{
                        id: article.id,
                        title: article.title,
                        excerpt: article.excerpt || "",
                        content: article.content,
                        author: {
                          name: author?.username || "Autor desconhecido",
                          avatar: author?.avatar_url || ""
                        },
                        published_at: article.created_at,
                        category: article.sector || "Geral",
                        image: article.image_url || "",
                        video: article.video_url || "",
                        likes: 0,
                        comments: 0,
                        aspect_ratio: article.aspect_ratio
                      }} />
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
