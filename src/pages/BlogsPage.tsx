
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BlogCard, BlogPost } from "@/components/blog/BlogCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
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

  // Dados fictícios - serão substituídos com dados do Supabase
  const allPosts: BlogPost[] = [
    {
      id: "1",
      title: "O Futuro da IA nos Negócios: Tendências para Observar",
      excerpt: "A inteligência artificial está remodelando como as empresas operam. Aqui estão as principais tendências para observar no próximo ano.",
      content: "",
      author: {
        name: "Alex Johnson",
        avatar: "https://i.pravatar.cc/150?img=1"
      },
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      category: "Tecnologia",
      image: "https://images.unsplash.com/photo-1593642533144-3d62aa4783ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
      likes: 128,
      comments: 47
    },
    {
      id: "2",
      title: "Sustainable Finance: Investing in the Future",
      excerpt: "How sustainable finance is changing the investment landscape and what it means for your portfolio.",
      content: "",
      author: {
        name: "Morgan Zhang",
        avatar: "https://i.pravatar.cc/150?img=5"
      },
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      category: "Finance",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1626&q=80",
      likes: 92,
      comments: 31
    },
    {
      id: "3",
      title: "Leadership in Crisis: Lessons from Top CEOs",
      excerpt: "How successful leaders navigate through times of uncertainty and crisis. Insights from top executives.",
      content: "",
      author: {
        name: "Taylor Reid",
        avatar: "https://i.pravatar.cc/150?img=3"
      },
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      category: "Leadership",
      image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
      likes: 76,
      comments: 24
    },
    {
      id: "4",
      title: "Supply Chain Resilience: Strategies for the Modern Business",
      excerpt: "Building resilient supply chains in an era of global disruption and uncertainty.",
      content: "",
      author: {
        name: "Jamie Vardy",
        avatar: "https://i.pravatar.cc/150?img=7"
      },
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      category: "Operations",
      image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
      likes: 42,
      comments: 11
    },
    {
      id: "5",
      title: "Digital Marketing Trends for 2023",
      excerpt: "The most effective digital marketing strategies and trends for businesses to adopt in 2023.",
      content: "",
      author: {
        name: "Sam Peterson",
        avatar: "https://i.pravatar.cc/150?img=9"
      },
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.5).toISOString(),
      category: "Marketing",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
      likes: 87,
      comments: 29
    },
    {
      id: "6",
      title: "Remote Work Revolution: The New Normal",
      excerpt: "How remote work is changing corporate culture and what it means for the future of employment.",
      content: "",
      author: {
        name: "Jordan Lee",
        avatar: "https://i.pravatar.cc/150?img=6"
      },
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      category: "Workplace",
      image: "https://images.unsplash.com/photo-1608659597669-b45511779f93?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
      likes: 63,
      comments: 18
    },
    {
      id: "7",
      title: "Blockchain Beyond Crypto: Business Applications",
      excerpt: "Exploring the business applications of blockchain technology beyond cryptocurrencies.",
      content: "",
      author: {
        name: "Alex Rivera",
        avatar: "https://i.pravatar.cc/150?img=10"
      },
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2.5).toISOString(),
      category: "Technology",
      image: "https://images.unsplash.com/photo-1621579311204-8667d02953fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
      likes: 51,
      comments: 13
    },
    {
      id: "8",
      title: "Sustainable Business Practices for 2023",
      excerpt: "How companies are implementing sustainable practices and benefiting from eco-friendly operations.",
      content: "",
      author: {
        name: "Casey Morgan",
        avatar: "https://i.pravatar.cc/150?img=13"
      },
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
      category: "Sustainability",
      image: "https://images.unsplash.com/photo-1498603054295-8198c13c1da1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
      likes: 39,
      comments: 8
    }
  ];

  // Filtrar e ordenar posts
  const filteredPosts = allPosts
    .filter(post => {
      // Filtrar por consulta de pesquisa
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filtrar por categoria
      const matchesCategory = category === "all" || post.category.toLowerCase() === category.toLowerCase();
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Ordenar pela opção selecionada
      if (sortBy === "recent") {
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      } else if (sortBy === "popular") {
        return b.likes - a.likes;
      } else if (sortBy === "comments") {
        return b.comments - a.comments;
      }
      return 0;
    });

  // Obter categorias únicas
  const categories = ["All", ...new Set(allPosts.map(post => post.category))];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col items-center text-center mb-12 animate-fade-in">
              <h1 className="heading-xl mb-4">Blog Outliers</h1>
              <p className="text-muted-foreground max-w-2xl">
                Descubra os últimos insights, tendências e análises de especialistas em negócios e líderes do setor.
              </p>
            </div>
            
            {/* Filtros */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 animate-fade-in">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Pesquisar artigos..."
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
                      cat !== "All" && <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
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
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {filteredPosts.map((post, index) => (
                  <div key={post.id} className="animate-once animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <BlogCard post={post} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 animate-fade-in">
                <p className="text-muted-foreground">Nenhum artigo encontrado que corresponda aos seus critérios.</p>
                <Button variant="link" onClick={() => {setSearchQuery(""); setCategory("all");}}>
                  Limpar filtros
                </Button>
              </div>
            )}
            
            {/* Paginação */}
            <div className="flex justify-center mt-12 animate-fade-in">
              <Button variant="outline" disabled>Anterior</Button>
              <Button variant="outline" className="mx-2 bg-primary/10">1</Button>
              <Button variant="outline" className="mx-2">2</Button>
              <Button variant="outline" className="mx-2">3</Button>
              <Button variant="outline">Próximo</Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
