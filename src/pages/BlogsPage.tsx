
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BlogCard } from "@/components/blog/BlogCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Article, Profile } from "@/types/profile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BlogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [articles, setArticles] = useState<Article[]>([]);
  const [authorProfiles, setAuthorProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      
      // Fetch articles
      const { data: articlesData, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (articlesData && articlesData.length > 0) {
        setArticles(articlesData as Article[]);
        
        // Get unique author IDs
        const authorIds = Array.from(new Set(articlesData.map(article => article.author_id)));
        
        // Get unique categories
        const uniqueCategories = Array.from(
          new Set(articlesData.map(article => article.sector).filter(Boolean))
        ) as string[];
        
        setCategories(uniqueCategories);
        
        // Fetch author profiles
        if (authorIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .in('id', authorIds);
            
          if (profilesError) throw profilesError;
          
          // Create map of profiles by ID
          const profileMap: Record<string, Profile> = {};
          profiles?.forEach(profile => {
            profileMap[profile.id] = profile;
          });
          
          setAuthorProfiles(profileMap);
        }
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort articles
  const filteredArticles = articles
    .filter(article => {
      // Filter by search query
      const matchesSearch = 
        (article.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false) || 
        (article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      
      // Filter by category
      const matchesCategory = category === "all" || article.sector?.toLowerCase() === category.toLowerCase();
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Sort by selected option
      if (sortBy === "recent") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === "popular") {
        // Would need likes count for this to work properly
        return 0;
      } else if (sortBy === "comments") {
        // Would need comments count for this to work properly
        return 0;
      }
      return 0;
    });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col items-center text-center mb-12 animate-fade-in">
              <h1 className="heading-xl mb-4">Publicações Outliers</h1>
              <p className="text-muted-foreground max-w-2xl">
                Descubra os últimos insights e artigos.
              </p>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 animate-fade-in">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Pesquisar publicações..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Mais Recentes</SelectItem>
                    <SelectItem value="popular">Mais Populares</SelectItem>
                    <SelectItem value="comments">Mais Comentados</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Posts Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {filteredArticles.map((article, index) => {
                  const author = authorProfiles[article.author_id];
                  return (
                    <div key={article.id} className="animate-once animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
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
                        likes: 0,
                        comments: 0,
                        aspect_ratio: article.aspect_ratio
                      }} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 animate-fade-in">
                <p className="text-muted-foreground">Nenhuma publicação encontrada que corresponda aos seus critérios.</p>
                <Button variant="link" onClick={() => {setSearchQuery(""); setCategory("all");}}>
                  Limpar filtros
                </Button>
              </div>
            )}
            
            {/* Pagination - simplified */}
            {filteredArticles.length > 0 && (
              <div className="flex justify-center mt-12 animate-fade-in">
                <Button variant="outline" disabled>Anterior</Button>
                <Button variant="outline" className="mx-2 bg-primary/10">1</Button>
                <Button variant="outline">Próximo</Button>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
