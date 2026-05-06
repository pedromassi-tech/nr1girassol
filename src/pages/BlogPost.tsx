import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, ArrowLeft, Share2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoLight from "@/assets/logo-girassol-light.png";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover_image: string;
  category: string;
  published_at: string;
}

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (error) throw error;
      setPost(data);
    } catch (err) {
      console.error("Error fetching post:", err);
      navigate("/blog");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando conteúdo...</div>;
  if (!post) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background border-b h-16 md:h-20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 h-full flex items-center justify-between">
          <img src={logoLight} alt="Logo" className="h-9 cursor-pointer" onClick={() => navigate("/")} />
          <Button variant="ghost" size="sm" onClick={() => navigate("/blog")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Todos os posts
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-10 md:py-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(post.published_at).toLocaleDateString("pt-BR")}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-primary mb-8 leading-[1.15]">
            {post.title}
          </h1>

          <div className="aspect-[21/9] rounded-3xl overflow-hidden mb-12 shadow-xl">
            <img src={post.cover_image || "/placeholder.svg"} alt={post.title} className="w-full h-full object-cover" />
          </div>

          <div 
            className="prose prose-lg max-w-none text-foreground/80 prose-headings:text-primary prose-a:text-secondary prose-strong:text-primary"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-16 pt-8 border-t flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/blog")} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Voltar ao Blog
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => {
              navigator.share({ title: post.title, url: window.location.href }).catch(() => {
                 navigator.clipboard.writeText(window.location.href);
                 alert("Link copiado!");
              });
            }}>
              <Share2 className="h-4 w-4" /> Compartilhar
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default BlogPost;
