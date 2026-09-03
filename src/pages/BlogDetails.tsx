import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, User, Clock, Share2 } from "lucide-react";
import { blogPosts } from "@/data/blogData";

const BlogDetails = () => {
  const { id } = useParams();

  // Find the specific blog post by ID
  const post = blogPosts.find(post => post.id === Number(id));
  
  // If post not found, show error
  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Blog Post Not Found</h1>
          <Link to="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get related posts (exclude current post)
  const relatedPosts = blogPosts
    .filter(p => p.id !== post.id)
    .slice(0, 2)
    .map(p => ({
      id: p.id,
      title: p.title,
      image: p.image,
    }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header Image */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Link to="/blog">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>

          <article>
            <Badge variant="secondary" className="mb-4">
              {post.category}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>
            
            <div className="flex flex-wrap items-center gap-6 mb-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {post.author}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {post.date}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </div>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            <div 
              className="prose prose-lg max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* Related Posts */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.map((related) => (
                <Link key={related.id} to={`/blog/${related.id}`}>
                  <Card className="hover-lift overflow-hidden">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={related.image}
                        alt={related.title}
                        className="w-full h-full object-cover transition-transform hover:scale-110"
                      />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg">{related.title}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Card className="mt-12 bg-gradient-to-br from-primary to-secondary text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Need Professional Help?</h3>
              <p className="mb-6 text-white/90">
                Connect with verified service providers in your area
              </p>
              <Link to="/services">
                <Button size="lg" variant="secondary">
                  Find Service Providers
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;
