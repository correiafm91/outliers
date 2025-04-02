
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BlogPost } from "@/components/blog/BlogCard";
import { CommentForm } from "@/components/blog/CommentForm";
import { CommentList, Comment } from "@/components/blog/CommentList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Share2, BookmarkIcon } from "lucide-react";
import { format } from "date-fns";

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This is placeholder data - will be replaced with Supabase fetch
    const mockPost: BlogPost = {
      id: id || "1",
      title: "The Future of AI in Business: Trends to Watch",
      excerpt: "Artificial intelligence is reshaping how businesses operate. Here are the key trends to watch in the coming year.",
      content: `
        <p>Artificial intelligence (AI) continues to transform the business landscape at an unprecedented pace. As we move forward, businesses must adapt to these changes or risk being left behind. In this comprehensive analysis, we explore the most impactful AI trends that are reshaping industries worldwide.</p>
        
        <h2>Machine Learning Operations (MLOps)</h2>
        <p>As organizations deploy more machine learning models, the need for effective MLOps becomes critical. MLOps brings DevOps principles to machine learning, streamlining the deployment, monitoring, and maintenance of AI systems. Companies that implement robust MLOps practices are seeing faster time-to-market and more reliable AI solutions.</p>
        
        <h2>AI Ethics and Governance</h2>
        <p>With AI becoming more prevalent, ethical considerations are moving to the forefront. Businesses are establishing governance frameworks to ensure AI systems are fair, transparent, and unbiased. Regulatory bodies worldwide are also developing guidelines for responsible AI use.</p>
        
        <h2>Generative AI Revolution</h2>
        <p>Generative AI tools like ChatGPT and DALL-E are creating new possibilities for content creation, product design, and creative work. Businesses across sectors are finding innovative applications for these technologies, from automated content production to design assistance.</p>
        
        <h2>AI-Enhanced Decision Making</h2>
        <p>Executive teams are increasingly relying on AI-powered analytics to inform strategic decisions. These systems can process vast amounts of data and identify patterns that humans might miss, leading to more informed business choices.</p>
        
        <h2>The Future Outlook</h2>
        <p>As AI technology continues to evolve, we expect to see more specialized applications across industries. Companies that invest in AI capabilities now will be better positioned to leverage these advancements in the future.</p>
        
        <p>For business leaders, staying informed about these trends isn't just about technological curiosity—it's about strategic necessity. The AI revolution is here, and its impact on business operations will only grow stronger in the years ahead.</p>
      `,
      author: {
        name: "Alex Johnson",
        avatar: "https://i.pravatar.cc/150?img=1"
      },
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      category: "Technology",
      image: "https://images.unsplash.com/photo-1593642533144-3d62aa4783ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
      likes: 128,
      comments: 47
    };

    const mockComments: Comment[] = [
      {
        id: "c1",
        author: {
          name: "Jamie Smith",
          avatar: "https://i.pravatar.cc/150?img=11"
        },
        content: "Really insightful article! I especially agree with the points about AI ethics and governance. As these technologies become more powerful, the ethical considerations become increasingly important.",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        likes: 8
      },
      {
        id: "c2",
        author: {
          name: "Riley Chen",
          avatar: "https://i.pravatar.cc/150?img=12"
        },
        content: "Great perspective on MLOps. In our organization, we've seen firsthand how implementing these practices has streamlined our AI deployment process. Definitely a must for any company serious about scaling their AI initiatives.",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        likes: 15
      },
      {
        id: "c3",
        author: {
          name: "Taylor Morgan",
          avatar: "https://i.pravatar.cc/150?img=13"
        },
        content: "I'd be interested to hear more about how smaller businesses can start implementing some of these AI trends without massive budgets. Any thoughts on accessible entry points for AI adoption?",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
        likes: 6
      }
    ];

    // Simulate API call
    setTimeout(() => {
      setPost(mockPost);
      setComments(mockComments);
      setLikeCount(mockPost.likes);
      setLoading(false);
    }, 500);
  }, [id]);

  const toggleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleCommentAdded = () => {
    // This would normally fetch updated comments from the server
    // For now, just adding a mock comment
    const newComment: Comment = {
      id: `c${comments.length + 1}`,
      author: {
        name: "Current User",
        avatar: "https://i.pravatar.cc/150?img=19"
      },
      content: "Thanks for sharing this insightful article! I found the section on AI ethics particularly relevant to the challenges we're facing in our industry.",
      created_at: new Date().toISOString(),
      likes: 0
    };
    
    setComments([newComment, ...comments]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse-slow">Loading article...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div>Article not found</div>
        </main>
        <Footer />
      </div>
    );
  }

  const publishedDate = format(new Date(post.published_at), "MMMM d, yyyy");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <article className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <header className="mb-8 animate-fade-in">
            <Badge variant="secondary" className="mb-4">{post.category}</Badge>
            <h1 className="heading-xl mb-6">{post.title}</h1>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>{post.author.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{post.author.name}</p>
                  <p className="text-sm text-muted-foreground">{publishedDate}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={toggleLike} className={`${liked ? 'text-destructive' : ''}`}>
                  <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleBookmark} className={`${bookmarked ? 'text-primary' : ''}`}>
                  <BookmarkIcon className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>
          
          {/* Featured Image */}
          <div className="mb-10 animate-fade-in delay-200">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-auto rounded-lg object-cover"
            />
          </div>
          
          {/* Content */}
          <div 
            className="prose prose-lg prose-invert max-w-none mb-12 animate-fade-in delay-300"
            dangerouslySetInnerHTML={{ __html: post.content }}
          ></div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-10 animate-fade-in delay-400">
            <Badge variant="outline">Artificial Intelligence</Badge>
            <Badge variant="outline">Business Strategy</Badge>
            <Badge variant="outline">Technology Trends</Badge>
            <Badge variant="outline">Digital Transformation</Badge>
          </div>
          
          {/* Social Share */}
          <div className="flex items-center justify-between border-t border-b border-border py-6 mb-10 animate-fade-in delay-500">
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground">Share this article:</span>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={toggleLike} className={`${liked ? 'text-destructive' : ''}`}>
                <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
                {likeCount} likes
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleBookmark}>
                <BookmarkIcon className={`h-4 w-4 mr-2 ${bookmarked ? 'fill-current' : ''}`} />
                {bookmarked ? 'Saved' : 'Save'}
              </Button>
            </div>
          </div>
          
          {/* Comments Section */}
          <section className="border-t border-border pt-10 animate-fade-in">
            <CommentForm postId={post.id} onCommentAdded={handleCommentAdded} />
            <div className="mt-12">
              <CommentList comments={comments} />
            </div>
          </section>
        </article>
      </main>
      
      <Footer />
    </div>
  );
}
