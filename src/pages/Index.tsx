
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BlogCard, BlogPost } from "@/components/blog/BlogCard";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  // Mock data for featured posts - will be replaced with Supabase data
  const featuredPosts: BlogPost[] = [
    {
      id: "1",
      title: "The Future of AI in Business: Trends to Watch",
      excerpt: "Artificial intelligence is reshaping how businesses operate. Here are the key trends to watch in the coming year.",
      content: "",
      author: {
        name: "Alex Johnson",
        avatar: "https://i.pravatar.cc/150?img=1"
      },
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      category: "Technology",
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
    }
  ];

  // Mock data for recent posts - will be replaced with Supabase data
  const recentPosts: BlogPost[] = [
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
    }
  ];

  const categories = [
    { name: "Technology", count: 42 },
    { name: "Finance", count: 38 },
    { name: "Leadership", count: 27 },
    { name: "Marketing", count: 25 },
    { name: "Operations", count: 19 },
    { name: "Workplace", count: 18 },
    { name: "Strategy", count: 15 },
    { name: "Innovation", count: 14 }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col items-center text-center mb-16 animate-once animate-fade-in">
              <h1 className="heading-xl max-w-3xl mb-6">Business Insights for Those Who Think Differently</h1>
              <p className="text-lg text-muted-foreground max-w-xl mb-8">
                Cutting-edge analysis and perspectives on business, technology, and finance for forward-thinking professionals.
              </p>
              <Button size="lg" asChild>
                <Link to="/blogs">
                  Explore Articles
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
              <h2 className="heading-lg animate-once animate-fade-in">Recent Articles</h2>
              <Button variant="outline" asChild className="animate-once animate-fade-in">
                <Link to="/blogs">View All</Link>
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
        
        {/* Categories */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="heading-lg mb-8 animate-once animate-fade-in">Browse by Category</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.map((category, index) => (
                <Link 
                  key={category.name}
                  to={`/category/${category.name.toLowerCase()}`}
                  className="outliers-card flex flex-col items-center justify-center p-6 text-center hover:bg-secondary/40 animate-once animate-scale-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <h3 className="text-lg font-medium mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} articles</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
        
        {/* Newsletter */}
        <section className="py-16 px-4 bg-secondary/30">
          <div className="container mx-auto max-w-2xl text-center animate-once animate-fade-in">
            <h2 className="heading-lg mb-4">Stay Ahead of the Curve</h2>
            <p className="text-muted-foreground mb-6">
              Join our newsletter and get the latest business insights delivered directly to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-foreground"
                required
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
