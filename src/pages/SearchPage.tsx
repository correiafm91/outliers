
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Loader2 } from "lucide-react";

interface Article {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  sector: string;
  author_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  sector: string;
  bio?: string;
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [articles, setArticles] = useState<Article[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState("articles");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchQuery = searchParams.get("q");
    if (searchQuery) {
      setQuery(searchQuery);
      performSearch(searchQuery);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Search articles
      const { data: articlesData, error: articlesError } = await supabase
        .from("articles")
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);

      if (articlesError) throw articlesError;
      setArticles(articlesData || []);

      // Search profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${searchQuery}%`);

      if (profilesError) throw profilesError;
      setProfiles(profilesData || []);
    } catch (error) {
      console.error("Erro na pesquisa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
      performSearch(query);
    }
  };

  const sectorTranslations: Record<string, string> = {
    'technology': 'Tecnologia',
    'marketing': 'Marketing',
    'gastronomy': 'Gastronomia',
    'education': 'Educação',
    'finance': 'Finanças',
    'health': 'Saúde',
    'sports': 'Esportes',
    'entertainment': 'Entretenimento',
    'other': 'Outro'
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Pesquisar</h1>
          
          <form onSubmit={handleSearch} className="flex gap-2 mb-8">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquise por artigos, usuários..."
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchIcon className="h-4 w-4" />}
            </Button>
          </form>

          {(articles.length > 0 || profiles.length > 0) && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="articles">
                  Artigos ({articles.length})
                </TabsTrigger>
                <TabsTrigger value="profiles">
                  Usuários ({profiles.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="articles">
                {articles.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Nenhum artigo encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {articles.map((article) => (
                      <Card key={article.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          {article.image_url && (
                            <div className="md:w-1/4 aspect-video md:aspect-square overflow-hidden">
                              <img 
                                src={article.image_url} 
                                alt={article.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div className={`flex-1 ${article.image_url ? 'md:w-3/4' : 'w-full'}`}>
                            <CardHeader>
                              <div className="flex items-center gap-2 mb-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={article.profiles?.avatar_url || ""} />
                                  <AvatarFallback>
                                    {article.profiles?.username.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium cursor-pointer" onClick={() => navigate(`/profile/${article.author_id}`)}>
                                  {article.profiles?.username}
                                </span>
                              </div>
                              <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                              <CardDescription className="flex items-center gap-2">
                                <span>{new Date(article.created_at).toLocaleDateString('pt-BR')}</span>
                                <Badge variant="outline">
                                  {sectorTranslations[article.sector] || article.sector}
                                </Badge>
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="line-clamp-3">{article.content}</p>
                            </CardContent>
                            <CardFooter>
                              <Button variant="outline" onClick={() => navigate(`/blog/${article.id}`)}>
                                Ler mais
                              </Button>
                            </CardFooter>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="profiles">
                {profiles.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {profiles.map((profile) => (
                      <Card key={profile.id} className="overflow-hidden">
                        <CardHeader className="text-center pb-2">
                          <Avatar className="h-20 w-20 mx-auto mb-4">
                            <AvatarImage src={profile.avatar_url || ""} />
                            <AvatarFallback className="text-xl">
                              {profile.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <CardTitle className="text-lg">{profile.username}</CardTitle>
                          <CardDescription>
                            <Badge variant="outline" className="mt-1">
                              {sectorTranslations[profile.sector] || profile.sector}
                            </Badge>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                          {profile.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-3">{profile.bio}</p>
                          )}
                        </CardContent>
                        <CardFooter className="flex justify-center pb-4">
                          <Button onClick={() => navigate(`/profile/${profile.id}`)}>
                            Ver Perfil
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Pesquisando...</span>
            </div>
          )}

          {!isLoading && articles.length === 0 && profiles.length === 0 && searchParams.get("q") && (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground mb-2">Nenhum resultado encontrado</p>
              <p className="text-muted-foreground">Tente usar termos diferentes na sua pesquisa</p>
            </div>
          )}

          {!searchParams.get("q") && !isLoading && (
            <div className="text-center py-12">
              <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <p className="mt-4 text-muted-foreground">Digite algo para pesquisar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
