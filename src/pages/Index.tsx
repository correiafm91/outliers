
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BlogCard, BlogPost } from "@/components/blog/BlogCard";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  // Dados para artigos em destaque - serão substituídos com dados do Supabase
  const featuredPosts: BlogPost[] = [
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
      title: "Finanças Sustentáveis: Investindo no Futuro",
      excerpt: "Como as finanças sustentáveis estão mudando o panorama de investimentos e o que isso significa para seu portfólio.",
      content: "",
      author: {
        name: "Morgan Zhang",
        avatar: "https://i.pravatar.cc/150?img=5"
      },
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      category: "Finanças",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1626&q=80",
      likes: 92,
      comments: 31
    },
    {
      id: "3",
      title: "Liderança em Crise: Lições dos Principais CEOs",
      excerpt: "Como líderes de sucesso navegam em tempos de incerteza e crise. Insights dos principais executivos.",
      content: "",
      author: {
        name: "Taylor Reid",
        avatar: "https://i.pravatar.cc/150?img=3"
      },
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      category: "Liderança",
      image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
      likes: 76,
      comments: 24
    }
  ];

  // Dados para artigos recentes - serão substituídos com dados do Supabase
  const recentPosts: BlogPost[] = [
    {
      id: "4",
      title: "Resiliência na Cadeia de Suprimentos: Estratégias para Empresas Modernas",
      excerpt: "Construindo cadeias de suprimentos resilientes em uma era de disrupção global e incerteza.",
      content: "",
      author: {
        name: "Jamie Vardy",
        avatar: "https://i.pravatar.cc/150?img=7"
      },
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      category: "Operações",
      image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
      likes: 42,
      comments: 11
    },
    {
      id: "5",
      title: "Tendências de Marketing Digital para 2023",
      excerpt: "As estratégias de marketing digital mais eficazes e tendências para empresas adotarem em 2023.",
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
      title: "Revolução do Trabalho Remoto: O Novo Normal",
      excerpt: "Como o trabalho remoto está mudando a cultura corporativa e o que isso significa para o futuro do emprego.",
      content: "",
      author: {
        name: "Jordan Lee",
        avatar: "https://i.pravatar.cc/150?img=6"
      },
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      category: "Trabalho",
      image: "https://images.unsplash.com/photo-1608659597669-b45511779f93?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
      likes: 63,
      comments: 18
    },
    {
      id: "7",
      title: "Blockchain Além das Criptomoedas: Aplicações Empresariais",
      excerpt: "Explorando as aplicações empresariais da tecnologia blockchain além das criptomoedas.",
      content: "",
      author: {
        name: "Alex Rivera",
        avatar: "https://i.pravatar.cc/150?img=10"
      },
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2.5).toISOString(),
      category: "Tecnologia",
      image: "https://images.unsplash.com/photo-1621579311204-8667d02953fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
      likes: 51,
      comments: 13
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col items-center text-center mb-16 animate-once animate-fade-in">
              <h1 className="heading-xl max-w-3xl mb-6">Insights de Negócios para Quem Pensa Diferente</h1>
              <p className="text-lg text-muted-foreground max-w-xl mb-8">
                Análises e perspectivas de ponta sobre negócios, tecnologia e finanças para profissionais com visão de futuro.
              </p>
              <Button size="lg" asChild>
                <Link to="/blogs">
                  Explorar Artigos
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            {/* Featured Posts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPosts.map((post, index) => (
                <div key={post.id} className="animate-once animate-fade-in delay-200" style={{ animationDelay: `${index * 150}ms` }}>
                  <BlogCard post={post} featured={true} />
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Recent Posts */}
        <section className="py-16 px-4 bg-secondary/30">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="heading-lg animate-once animate-fade-in">Artigos Recentes</h2>
              <Button variant="outline" asChild className="animate-once animate-fade-in">
                <Link to="/blogs">Ver Todos</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {recentPosts.map((post, index) => (
                <div key={post.id} className="animate-once animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                  <BlogCard post={post} />
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Newsletter */}
        <section className="py-16 px-4 bg-secondary/30">
          <div className="container mx-auto max-w-2xl text-center animate-once animate-fade-in">
            <h2 className="heading-lg mb-4">Mantenha-se à Frente</h2>
            <p className="text-muted-foreground mb-6">
              Junte-se à nossa newsletter e receba os últimos insights de negócios diretamente na sua caixa de entrada.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Digite seu e-mail"
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-foreground"
                required
              />
              <Button type="submit">Inscrever-se</Button>
            </form>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
