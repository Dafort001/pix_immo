import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, User, Tag, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SEOHead } from "@shared/components";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { BlogPost } from "@shared/schema";

export default function BlogPost() {
  const params = useParams();
  const slug = params.slug || "";

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: [`/api/blog/slug/${slug}`],
    enabled: !!slug,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <Link href="/" data-testid="link-brand-logo">
              <div className="text-lg font-semibold tracking-wide cursor-pointer">
                PIX.IMMO
              </div>
            </Link>
            <Link href="/blog" data-testid="button-back-to-blog">
              <span className="flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer">
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm">Blog</span>
              </span>
            </Link>
          </div>
        </header>

        <div className="py-12 md:py-20">
          <div className="w-full max-w-4xl mx-auto px-6">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-8" />
            <Skeleton className="aspect-[16/9] w-full mb-8" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <Link href="/" data-testid="link-brand-logo">
              <div className="text-lg font-semibold tracking-wide cursor-pointer">
                PIX.IMMO
              </div>
            </Link>
            <Link href="/blog" data-testid="button-back-to-blog">
              <span className="flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer">
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm">Blog</span>
              </span>
            </Link>
          </div>
        </header>

        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 73px)' }}>
          <div className="text-center px-6">
            <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h1 className="text-2xl font-bold mb-2" data-testid="error-title">
              Blog-Beitrag nicht gefunden
            </h1>
            <p className="text-gray-600 mb-6">
              Dieser Beitrag existiert nicht oder wurde entfernt.
            </p>
            <Link href="/blog" data-testid="link-back-to-blog">
              <span className="inline-flex items-center gap-2 text-primary hover:underline cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
                Zurück zum Blog
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={`${post.title} - PIX.IMMO Blog`}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        image={post.featuredImage}
      />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/" data-testid="link-brand-logo">
            <div className="text-lg font-semibold tracking-wide cursor-pointer">
              PIX.IMMO
            </div>
          </Link>
          <Link href="/blog" data-testid="button-back-to-blog-header">
            <span className="flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm">Blog</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Hero Image */}
      {post.featuredImage && (
        <div className="relative w-full h-[50vh] md:h-[60vh] bg-gray-100">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
            data-testid="hero-image"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
        </div>
      )}

      {/* Article Content */}
      <article className="py-12 md:py-20">
        <div className="w-full max-w-3xl mx-auto px-6">
          {/* Back Button */}
          <Link href="/blog" data-testid="link-back-to-blog-top">
            <span className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors mb-8 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Blog
            </span>
          </Link>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight" data-testid="post-title">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-8 pb-8 border-b">
            {/* Author */}
            <div className="flex items-center gap-2" data-testid="post-author">
              <User className="h-4 w-4" />
              <span>{post.author}</span>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2" data-testid="post-date">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>

            {/* Category */}
            <Badge variant="secondary" data-testid="post-category">
              {post.category}
            </Badge>
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg text-gray-700 mb-8 italic border-l-4 border-primary pl-4" data-testid="post-excerpt">
              {post.excerpt}
            </p>
          )}

          {/* Main Content - Markdown Rendering */}
          <div className="prose prose-lg max-w-none" data-testid="post-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Headings
                h1: ({ node, ...props }) => (
                  <h1 className="text-3xl font-bold mt-12 mb-4 first:mt-0" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-2xl font-bold mt-10 mb-4" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-xl font-semibold mt-8 mb-3" {...props} />
                ),
                h4: ({ node, ...props }) => (
                  <h4 className="text-lg font-semibold mt-6 mb-2" {...props} />
                ),
                
                // Paragraphs
                p: ({ node, ...props }) => (
                  <p className="text-base leading-relaxed mb-6 text-gray-800" {...props} />
                ),
                
                // Lists
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside mb-6 space-y-2 text-gray-800" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside mb-6 space-y-2 text-gray-800" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="text-base leading-relaxed" {...props} />
                ),
                
                // Blockquotes
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-primary pl-6 py-2 my-6 italic text-gray-700 bg-gray-50 rounded-r" {...props} />
                ),
                
                // Code blocks
                code: ({ node, inline, ...props }: any) => 
                  inline ? (
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-primary" {...props} />
                  ) : (
                    <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-6" {...props} />
                  ),
                pre: ({ node, ...props }) => (
                  <pre className="mb-6" {...props} />
                ),
                
                // Images - Full width with responsive sizing
                img: ({ node, ...props }) => (
                  <img
                    className="w-full h-auto rounded-lg my-8 shadow-md"
                    loading="lazy"
                    data-testid="markdown-image"
                    {...props}
                  />
                ),
                
                // Links
                a: ({ node, ...props }) => (
                  <a className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />
                ),
                
                // Horizontal rule
                hr: ({ node, ...props }) => (
                  <hr className="my-8 border-t border-gray-300" {...props} />
                ),
                
                // Tables
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-6">
                    <table className="min-w-full border border-gray-300 rounded-lg" {...props} />
                  </div>
                ),
                thead: ({ node, ...props }) => (
                  <thead className="bg-gray-100" {...props} />
                ),
                th: ({ node, ...props }) => (
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="border border-gray-300 px-4 py-2" {...props} />
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <div className="flex items-start gap-3">
                <Tag className="h-4 w-4 mt-1 text-gray-400" />
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" data-testid={`tag-${index}`}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Back to blog link */}
          <div className="mt-12 pt-8 border-t text-center">
            <Link href="/blog" data-testid="link-back-to-blog-bottom">
              <span className="inline-flex items-center gap-2 text-primary hover:underline cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
                Zurück zum Blog
              </span>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
