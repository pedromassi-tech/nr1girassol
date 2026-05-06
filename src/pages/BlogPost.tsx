import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, ArrowLeft, Share2, Clock, CheckCircle, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoLight from "@/assets/logo-girassol-light.png";
import logoDark from "@/assets/logo-girassol-dark.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) fetchPost();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (error) throw error;
      setPost(data);

      // Fetch related
      const { data: related } = await (supabase as any)
        .from("blog_posts")
        .select("*")
        .neq("slug", slug)
        .limit(3);
      setRelatedPosts(related || []);
    } catch (err) {
      console.error("Error fetching post:", err);
      navigate("/blog");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: post?.title,
      text: post?.summary,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link copiado!", description: "O link foi copiado para sua área de transferência." });
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium">Carregando conteúdo...</p>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ─── HEADER ─── */}
      <header className="bg-background border-b h-16 md:h-20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 h-full flex items-center justify-between">
          <img 
            src={logoLight} 
            alt="Logo" 
            className="h-9 cursor-pointer" 
            onClick={() => navigate("/")} 
          />
          <div className="hidden md:flex items-center gap-6">
             <Button variant="ghost" size="sm" onClick={() => navigate("/blog")} className="text-muted-foreground hover:text-primary gap-2">
                <ArrowLeft className="h-4 w-4" /> Todos os posts
             </Button>
          </div>
          <Button 
            onClick={() => navigate("/quiz")}
            size="sm"
            className="gold-gradient border-0 text-primary font-black shadow-md"
          >
            Fazer o teste
          </Button>
        </div>
      </header>

      {/* ─── POST HERO ─── */}
      <div className="relative pt-12 pb-12 md:pt-20 md:pb-16 bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto px-5 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="gold-gradient text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                {post.category}
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                <Calendar className="h-4 w-4" />
                {new Date(post.published_at).toLocaleDateString("pt-BR")}
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                <Clock className="h-4 w-4" />
                6 min de leitura
              </span>
            </div>

            <h1 className="text-3xl md:text-6xl font-black text-primary mb-8 leading-[1.1] tracking-tight">
              {post.title}
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed italic">
              "{post.summary}"
            </p>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-5 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {post.cover_image && (
                <div className="aspect-[21/10] rounded-[2.5rem] overflow-hidden mb-16 shadow-2xl border-8 border-white">
                  <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div 
                className="prose prose-lg max-w-none text-foreground/85 prose-headings:text-primary prose-headings:font-black prose-a:text-secondary prose-a:font-bold prose-strong:text-primary prose-img:rounded-[2rem] prose-blockquote:border-secondary prose-blockquote:bg-secondary/5 prose-blockquote:py-2 prose-blockquote:rounded-r-2xl"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <div className="mt-16 pt-10 border-t flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-full gold-gradient flex items-center justify-center font-black text-primary">MR</div>
                   <div>
                      <p className="text-sm font-black text-primary">Maria Resende</p>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-tighter">Especialista em NR-1</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="rounded-full gap-2 font-bold text-primary" onClick={handleShare}>
                    <Share2 className="h-4 w-4" /> Compartilhar
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* CTA Card */}
            <div className="sticky top-24 space-y-8">
               <div className="hero-gradient rounded-[2rem] p-8 text-primary-foreground relative overflow-hidden shadow-xl">
                  <div className="relative z-10">
                     <h3 className="text-xl font-black mb-4">Sua empresa está em conformidade?</h3>
                     <p className="text-primary-foreground/60 text-sm mb-6 leading-relaxed">
                        Faça o diagnóstico estratégico gratuito e descubra seu score de risco real em menos de 5 minutos.
                     </p>
                     <Button 
                        onClick={() => navigate("/quiz")}
                        className="w-full gold-gradient border-0 text-primary font-black py-6 gap-2"
                     >
                        INICIAR TESTE AGORA <ArrowRight className="h-4 w-4" />
                     </Button>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl"></div>
               </div>

               {/* Related Posts */}
               <div className="bg-card rounded-[2rem] p-8 border shadow-sm">
                  <h3 className="text-lg font-black text-primary mb-6 flex items-center gap-2">
                     <CheckCircle className="h-5 w-5 text-secondary" />
                     Mais lidos da semana
                  </h3>
                  <div className="space-y-6">
                     {relatedPosts.map((rp) => (
                        <div 
                           key={rp.id} 
                           className="group cursor-pointer"
                           onClick={() => navigate(`/blog/${rp.slug}`)}
                        >
                           <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">{rp.category}</p>
                           <h4 className="text-sm font-black text-primary group-hover:text-secondary transition-colors leading-snug">
                              {rp.title}
                           </h4>
                        </div>
                     ))}
                  </div>
               </div>

               <Button 
                variant="ghost" 
                onClick={() => navigate("/blog")} 
                className="w-full text-muted-foreground font-bold uppercase tracking-widest text-[10px] gap-2 py-6 hover:bg-muted/50"
               >
                 <ArrowLeft className="h-4 w-4" /> Voltar ao Blog
               </Button>
            </div>
          </aside>
        </div>
      </main>

      {/* ─── CTA FINAL ─── */}
      <section className="bg-white py-20 px-5 border-t">
        <div className="max-w-4xl mx-auto bg-muted/30 rounded-[3rem] p-10 md:p-16 text-center border shadow-sm">
           <MessageCircle className="h-12 w-12 text-secondary mx-auto mb-6" />
           <h2 className="text-2xl md:text-4xl font-black text-primary mb-6">Precisa de um diagnóstico mais profundo?</h2>
           <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">Agende uma conversa estratégica com a Maria Resende para mapear os riscos da sua operação.</p>
           <Button onClick={() => navigate("/contato")} className="gold-gradient border-0 text-primary font-black px-10 py-7 text-lg shadow-lg hover:scale-105 transition-all">
              AGENDAR CONSULTORIA
           </Button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="hero-gradient py-12 px-5 text-primary-foreground">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
           <img src={logoDark} alt="Logo" className="h-8" />
           <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/40">Instituto Girassol • 2026</p>
        </div>
      </footer>
    </div>
  );
};

export default BlogPost;
