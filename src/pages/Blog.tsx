import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Search, Calendar, User, ArrowRight } from "lucide-react";
import LogoSpinner from "@/components/ui/LogoSpinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  author: string | null;
  category: string | null;
  published_at: string | null;
}

const Blog = () => {
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("public-forms", {
          body: { action: "list_published_posts" },
        });
        if (error) throw error;
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load blog posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.excerpt || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Blog & News</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">Stories of impact, updates from the field, and insights into our work.</p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="relative max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>

          {loading ? (
            <LogoSpinner message="Loading articles..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 animate-fade-in">
              {filtered.map((post) => (
                <Card key={post.id} className="overflow-hidden group hover:shadow-elevated transition-all duration-300 border-border/50">
                  {post.image_url && (
                    <div className="relative overflow-hidden aspect-[2/1]">
                      <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      {post.category && <div className="absolute top-3 left-3"><span className="px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-medium rounded-full backdrop-blur-sm">{post.category}</span></div>}
                    </div>
                  )}
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      {post.published_at && (
                        <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /><span>{new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></div>
                      )}
                      {post.author && <div className="flex items-center gap-1"><User className="w-3.5 h-3.5" /><span>{post.author}</span></div>}
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                    {post.excerpt && <p className="text-muted-foreground text-sm mb-4">{post.excerpt}</p>}
                    <Button variant="link" className="p-0 h-auto text-accent font-semibold gap-1">Read More <ArrowRight className="w-4 h-4" /></Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!loading && filtered.length === 0 && <div className="text-center py-16 text-muted-foreground"><p className="text-lg">No articles found.</p></div>}
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
