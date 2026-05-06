import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Calendar, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("blog_posts")
        .select("*")
        .order("published_at", { ascending: false });
      
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-background border-b h-16 md:h-20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 h-full flex items-center justify-between">
          <img src={logoLight} alt="Logo" className="h-9 cursor-pointer" onClick={() => navigate("/")} />
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2 text-primary">
            <ArrowLeft className="h-4 w-4" /> Voltar ao site
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-10 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold text-primary mb-4">Blog Instituto Girassol</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Conteúdos estratégicos sobre NR-1, riscos psicossociais e governança.</p>
        </div>

        <div className="relative max-w-xl mx-auto mb-16">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar conteúdos..." 
            className="pl-10 bg-background" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-20">Carregando conteúdos...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
            <p className="text-muted-foreground">Nenhum post encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                <div className="aspect-video overflow-hidden bg-muted">
                  {post.cover_image ? (
                    <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                       Sem imagem
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.published_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-3 leading-tight group-hover:text-secondary transition-colors line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-3">{post.summary}</p>
                  <div className="flex items-center text-secondary text-sm font-bold gap-1 group-hover:gap-2 transition-all">
                    Ler mais <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Blog;
