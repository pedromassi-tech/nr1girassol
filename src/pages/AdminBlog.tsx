import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Plus, Search, Trash2, Edit2, ArrowLeft, Save, 
  Image as ImageIcon, Calendar, Tag, FileText, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const AdminBlog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase.from("blog_posts").select("*").order("published_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar posts", variant: "destructive" });
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost?.title || !editingPost?.slug) {
      toast({ title: "Título e Slug são obrigatórios", variant: "destructive" });
      return;
    }

    const postData = {
      ...editingPost,
      published_at: editingPost.published_at || new Date().toISOString(),
    };

    let error;
    if (editingPost.id) {
      const { error: err } = await supabase.from("blog_posts").update(postData).eq("id", editingPost.id);
      error = err;
    } else {
      const { error: err } = await supabase.from("blog_posts").insert([postData]);
      error = err;
    }

    if (error) {
      toast({ title: "Erro ao salvar post", variant: "destructive" });
    } else {
      toast({ title: "Post salvo com sucesso!" });
      setEditingPost(null);
      fetchPosts();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este post permanentemente?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } else {
      toast({ title: "Post excluído" });
      fetchPosts();
    }
  };

  const filteredPosts = posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  if (editingPost) {
    return (
      <div className="min-h-screen bg-muted/20 p-5 md:p-10">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => setEditingPost(null)} className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" /> Cancelar
          </Button>
          
          <div className="bg-card rounded-2xl border p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-primary mb-8">{editingPost.id ? "Editar Post" : "Novo Post"}</h2>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Título do Post</Label>
                  <Input 
                    value={editingPost.title || ""} 
                    onChange={e => setEditingPost({...editingPost, title: e.target.value})}
                    placeholder="Ex: Como implementar a NR-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug (URL)</Label>
                  <Input 
                    value={editingPost.slug || ""} 
                    onChange={e => setEditingPost({...editingPost, slug: e.target.value.toLowerCase().replace(/ /g, "-")})}
                    placeholder="ex-como-implementar-nr1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input 
                    value={editingPost.category || ""} 
                    onChange={e => setEditingPost({...editingPost, category: e.target.value})}
                    placeholder="Ex: NR-1, Liderança, Saúde"
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL da Imagem de Capa</Label>
                  <Input 
                    value={editingPost.cover_image || ""} 
                    onChange={e => setEditingPost({...editingPost, cover_image: e.target.value})}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Resumo (aparece na listagem)</Label>
                <Textarea 
                  value={editingPost.summary || ""} 
                  onChange={e => setEditingPost({...editingPost, summary: e.target.value})}
                  placeholder="Breve descrição do conteúdo..."
                />
              </div>

              <div className="space-y-2">
                <Label>Conteúdo (HTML/Rich Text)</Label>
                <Textarea 
                  className="min-h-[400px] font-mono text-sm"
                  value={editingPost.content || ""} 
                  onChange={e => setEditingPost({...editingPost, content: e.target.value})}
                  placeholder="<p>Seu conteúdo aqui...</p>"
                />
                <p className="text-[10px] text-muted-foreground">Dica: Use tags HTML como &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt; para formatar.</p>
              </div>

              <Button type="submit" className="w-full gold-gradient border-0 text-primary font-bold py-6">
                <Save className="h-5 w-5 mr-2" /> Salvar Post
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 p-5 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-primary">Gerenciar Blog</h1>
            <p className="text-muted-foreground">Crie e edite conteúdos do Instituto Girassol.</p>
          </div>
          <Button className="gold-gradient border-0 text-primary font-bold gap-2" onClick={() => setEditingPost({})}>
            <Plus className="h-5 w-5" /> Novo Post
          </Button>
        </div>

        <div className="bg-card rounded-2xl border p-6 shadow-sm">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar posts pelo título..." 
              className="pl-10" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPosts.map(post => (
                  <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-bold text-primary max-w-xs truncate">{post.title}</td>
                    <td className="px-4 py-4">
                      <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full">{post.category}</span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{new Date(post.published_at).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-4 text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => window.open(`/blog/${post.slug}`, "_blank")}>
                        <Globe className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingPost(post)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(post.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPosts.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">Nenhum post encontrado.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBlog;
