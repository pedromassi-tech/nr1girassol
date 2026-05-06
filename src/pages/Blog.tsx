import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Calendar, ChevronRight, Clock, TrendingUp, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import logoDark from "@/assets/logo-girassol-dark.png";
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
    window.scrollTo(0, 0);
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

  const featuredPost = posts[0];
  const regularPosts = filteredPosts.slice(featuredPost ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      {/* ─── HERO BLOG ─── */}
      <section className="hero-gradient pt-16 pb-24 px-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-secondary/20 border border-secondary/30 rounded-full px-4 py-1.5 mb-6">
                <TrendingUp className="h-3.5 w-3.5 text-secondary" />
                <span className="text-secondary text-[10px] font-bold tracking-widest uppercase">Conteúdo Estratégico</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-primary-foreground mb-6 leading-tight">
                Insights sobre <span className="text-secondary">NR-1</span> e Governança
              </h1>
              <p className="text-primary-foreground/60 text-lg md:text-xl max-w-2xl leading-relaxed">
                Transformando riscos psicossociais em resultados e segurança jurídica para o seu negócio.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── SEARCH & FILTER BAR ─── */}
      <div className="max-w-7xl mx-auto px-5 -mt-8 relative z-20">
        <div className="bg-card rounded-2xl shadow-xl border p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="O que você está procurando hoje?" 
              className="pl-12 h-12 bg-muted/30 border-none focus-visible:ring-secondary" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
             {["Todos", "NR-1", "Liderança", "Saúde Mental", "Governança"].map((cat) => (
               <Button 
                key={cat} 
                variant="ghost" 
                size="sm" 
                className={`rounded-full px-4 whitespace-nowrap ${cat === "Todos" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
               >
                 {cat}
               </Button>
             ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-5 py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground font-medium">Carregando conteúdos estratégicos...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-32 bg-card rounded-3xl border border-dashed border-muted-foreground/30">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground text-lg">Nenhum artigo encontrado com esse termo.</p>
            <Button variant="link" onClick={() => setSearchTerm("")} className="text-secondary">Limpar busca</Button>
          </div>
        ) : (
          <div className="space-y-20">
            {/* Featured Post */}
            {!searchTerm && featuredPost && (
              <motion.section 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group cursor-pointer"
                onClick={() => navigate(`/blog/${featuredPost.slug}`)}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-card rounded-[2.5rem] overflow-hidden border shadow-sm group-hover:shadow-2xl transition-all duration-500">
                  <div className="aspect-[16/10] lg:aspect-square overflow-hidden bg-muted">
                    {featuredPost.cover_image ? (
                      <img src={featuredPost.cover_image} alt={featuredPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-primary/5">Sem imagem</div>
                    )}
                  </div>
                  <div className="p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="gold-gradient text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                        {featuredPost.category || "Destaque"}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(featuredPost.published_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-primary mb-6 leading-[1.1] group-hover:text-secondary transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-muted-foreground text-lg mb-8 line-clamp-3 leading-relaxed">
                      {featuredPost.summary}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-secondary font-black text-sm gap-2">
                        LER ARTIGO COMPLETO <ChevronRight className="h-5 w-5" />
                      </div>
                      <div className="h-px flex-1 bg-muted"></div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* List Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {regularPosts.map((post, idx) => (
                <motion.article 
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-card rounded-[2rem] border overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer group flex flex-col"
                  onClick={() => navigate(`/blog/${post.slug}`)}
                >
                  <div className="aspect-video overflow-hidden bg-muted relative">
                    <div className="absolute top-4 left-4 z-10">
                       <span className="bg-background/90 backdrop-blur-md text-primary text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-primary/10">
                         {post.category}
                       </span>
                    </div>
                    {post.cover_image ? (
                      <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-primary/5">Sem imagem</div>
                    )}
                  </div>
                  <div className="p-7 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-4 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {new Date(post.published_at).toLocaleDateString("pt-BR")}</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> 5 min de leitura</span>
                    </div>
                    <h3 className="text-xl font-black text-primary mb-4 leading-tight group-hover:text-secondary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-8 line-clamp-3 leading-relaxed">
                      {post.summary}
                    </p>
                    <div className="mt-auto flex items-center justify-between group/btn">
                      <span className="text-xs font-black text-secondary tracking-widest uppercase">Ver Detalhes</span>
                      <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center group-hover/btn:bg-secondary group-hover/btn:text-primary transition-all">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </section>
          </div>
        )}
      </main>

      {/* ─── NEWSLETTER ─── */}
      <section className="bg-primary py-20 px-5 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-black text-primary-foreground mb-4">Mantenha sua gestão atualizada</h2>
          <p className="text-primary-foreground/60 mb-8 max-w-xl mx-auto">Receba quinzenalmente as principais atualizações sobre NR-1 e governança corporativa.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
            <Input placeholder="Seu melhor e-mail" className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
            <Button className="gold-gradient border-0 text-primary font-black px-8 h-12">INSCREVER</Button>
          </form>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 blur-[100px]"></div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="hero-gradient py-12 px-5 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <img src={logoDark} alt="Instituto Girassol" className="h-10" />
            <p className="text-primary-foreground/40 text-[10px] text-center md:text-left uppercase tracking-widest font-bold">
              © 2026 Instituto Girassol • Todos os direitos reservados
            </p>
          </div>
          <div className="flex gap-8 text-primary-foreground/30 text-[10px] font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-secondary transition-colors">Privacidade</a>
            <a href="#" className="hover:text-secondary transition-colors">Termos</a>
            <a href="#" className="hover:text-secondary transition-colors">Imprensa</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Blog;
