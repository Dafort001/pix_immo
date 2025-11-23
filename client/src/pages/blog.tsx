import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { SEOHead } from "@shared/components";
import { Skeleton } from "@/components/ui/skeleton";
import type { BlogPost } from "@shared/schema";

export default function Blog() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { data: blogPosts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
  });

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Blog - PIX.IMMO"
        description="Aktuelle Beiträge rund um Immobilienfotografie, Tipps für bessere Aufnahmen und Insights aus der Branche."
        path="/blog"
      />

      {/* Content */}
      <div className="py-12 md:py-20">
        <div className="w-full max-w-7xl mx-auto px-6">
          <h1 className="text-lg font-bold mb-12 tracking-wide" data-testid="page-title">
            Blog
          </h1>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[2/3] w-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : blogPosts.length === 0 ? (
            <div className="text-center py-20" data-testid="empty-state">
              <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Noch keine Blog-Beiträge</h2>
              <p className="text-gray-600">
                Schauen Sie bald wieder vorbei - neue Beiträge sind in Vorbereitung!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <div
                    className="group cursor-pointer"
                    onMouseEnter={() => setHoveredId(post.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    data-testid={`blog-card-${post.slug}`}
                  >
                    {/* Featured Image */}
                    {post.featuredImage && (
                      <div className="relative aspect-[2/3] overflow-hidden bg-gray-100 rounded-md mb-4">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div
                          className={`absolute inset-0 bg-black/60 flex items-center justify-center p-6 transition-opacity duration-300 ${
                            hoveredId === post.id ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          <h2 className="text-white text-lg font-semibold text-center leading-tight">
                            {post.title}
                          </h2>
                        </div>
                      </div>
                    )}
                    {!post.featuredImage && (
                      <div className="aspect-[2/3] bg-gray-100 rounded-md mb-4 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-300" />
                      </div>
                    )}

                    {/* Post Info */}
                    <div className="space-y-2">
                      <h2 className="text-base font-semibold group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>{post.category}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
