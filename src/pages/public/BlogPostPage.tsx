import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { api } from "../../services/api";
import { BlogPost } from "../../types";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Check,
  Twitter,
  Linkedin,
  Copy,
  Tag,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  User,
  ArrowUpRight,
} from "lucide-react";

interface BlogPostPageProps {
  slug: string;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ slug }) => {
  const { navigate, settings, showToast } = useApp();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const currentPost = await api.getBlogBySlug(slug);
        setPost(currentPost);

        if (currentPost) {
          // Dynamic SEO Injection for Google Search Console & Social Cards
          const agencyName = settings?.agencyName || "Tech Elevant";
          const title = currentPost.seoTitle || `${currentPost.title} | ${agencyName}`;
          const description = currentPost.seoDescription || currentPost.excerpt;
          const canonical = currentPost.canonicalUrl || `https://techelevant.com/blog/${currentPost.slug}`;
          const ogImg = currentPost.ogImage || currentPost.coverImage;

          document.title = title;

          // Helper for meta tags
          const setMetaTag = (attr: "name" | "property", key: string, content: string) => {
            let el = document.querySelector(`meta[${attr}="${key}"]`);
            if (!el) {
              el = document.createElement("meta");
              el.setAttribute(attr, key);
              document.head.appendChild(el);
            }
            el.setAttribute("content", content);
          };

          setMetaTag("name", "description", description);
          if (currentPost.seoKeywords) {
            setMetaTag("name", "keywords", currentPost.seoKeywords);
          }
          if (currentPost.robots) {
            setMetaTag("name", "robots", currentPost.robots);
          }

          // Open Graph
          setMetaTag("property", "og:title", title);
          setMetaTag("property", "og:description", description);
          setMetaTag("property", "og:type", "article");
          setMetaTag("property", "og:url", canonical);
          if (ogImg) {
            setMetaTag("property", "og:image", ogImg);
          }

          // Canonical tag
          let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
          if (!canonicalLink) {
            canonicalLink = document.createElement("link");
            canonicalLink.rel = "canonical";
            document.head.appendChild(canonicalLink);
          }
          canonicalLink.href = canonical;

          // Inject JSON-LD Structured Data Schema for Search Console
          const schemaId = "techelevant-blog-schema";
          let schemaScript = document.getElementById(schemaId);
          if (!schemaScript) {
            schemaScript = document.createElement("script");
            schemaScript.id = schemaId;
            schemaScript.setAttribute("type", "application/ld+json");
            document.head.appendChild(schemaScript);
          }

          const schemaData = {
            "@context": "https://schema.org",
            "@type": currentPost.structuredDataType || "TechArticle",
            headline: currentPost.title,
            description: description,
            image: ogImg,
            datePublished: currentPost.publishedAt || currentPost.createdAt,
            dateModified: currentPost.updatedAt || currentPost.createdAt,
            author: {
              "@type": "Person",
              name: currentPost.authorName || "Tech Elevant Engineering",
              jobTitle: currentPost.authorRole || "Software Architect",
            },
            publisher: {
              "@type": "Organization",
              name: agencyName,
              logo: {
                "@type": "ImageObject",
                url: settings?.logoUrl || "https://techelevant.com/logo.svg",
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": canonical,
            },
          };
          schemaScript.textContent = JSON.stringify(schemaData);

          // Fetch related posts
          const allPosts = await api.getBlogs(false);
          const related = allPosts
            .filter((p) => p.id !== currentPost.id)
            .sort((a, b) => {
              const aMatch = a.category === currentPost.category ? 1 : 0;
              const bMatch = b.category === currentPost.category ? 1 : 0;
              return bMatch - aMatch;
            })
            .slice(0, 3);
          setRelatedPosts(related);
        }
      } catch (err) {
        console.error("Failed to load blog post:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();

    return () => {
      // Clean up schema on unmount
      const schemaScript = document.getElementById("techelevant-blog-schema");
      if (schemaScript) {
        schemaScript.remove();
      }
    };
  }, [slug, settings]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      showToast("Article URL copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const shareOnTwitter = () => {
    if (!post) return;
    const text = encodeURIComponent(`${post.title} via @tech_elevant`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently Published";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Safe lightweight parser for markdown-like article content
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];
    let codeLanguage = "";

    lines.forEach((line, index) => {
      // Code block start / end
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <div key={`code-${index}`} className="my-6 rounded-2xl bg-neutral-950 p-5 border border-neutral-800 text-neutral-100 font-mono text-xs sm:text-sm overflow-x-auto">
              {codeLanguage && (
                <div className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase pb-2 border-b border-neutral-800 mb-3 flex items-center justify-between">
                  <span>{codeLanguage}</span>
                  <span className="text-neutral-400">Architecture Spec</span>
                </div>
              )}
              <pre className="leading-relaxed">
                <code>{codeLines.join("\n")}</code>
              </pre>
            </div>
          );
          inCodeBlock = false;
          codeLines = [];
          codeLanguage = "";
        } else {
          inCodeBlock = true;
          codeLanguage = line.trim().slice(3).trim();
          codeLines = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }

      // Horizontal rules
      if (line.trim() === "---") {
        elements.push(<hr key={`hr-${index}`} className="my-10 border-neutral-200" />);
        return;
      }

      // H2 Heading
      if (line.startsWith("## ")) {
        elements.push(
          <h2
            key={`h2-${index}`}
            className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 font-space mt-10 mb-4 pt-4 border-t border-neutral-100 first:border-0 first:mt-0"
          >
            {line.replace("## ", "")}
          </h2>
        );
        return;
      }

      // H3 Heading
      if (line.startsWith("### ")) {
        elements.push(
          <h3
            key={`h3-${index}`}
            className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 font-space mt-8 mb-3"
          >
            {line.replace("### ", "")}
          </h3>
        );
        return;
      }

      // H4 Heading
      if (line.startsWith("#### ")) {
        elements.push(
          <h4
            key={`h4-${index}`}
            className="text-base sm:text-lg font-bold tracking-tight text-neutral-800 font-space mt-6 mb-2"
          >
            {line.replace("#### ", "")}
          </h4>
        );
        return;
      }

      // Blockquotes
      if (line.startsWith("> ")) {
        elements.push(
          <blockquote
            key={`quote-${index}`}
            className="my-6 pl-5 border-l-4 border-neutral-900 italic text-neutral-700 bg-neutral-50 py-3 rounded-r-xl text-base"
          >
            {line.replace("> ", "")}
          </blockquote>
        );
        return;
      }

      // Bullet lists
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const text = line.trim().slice(2);
        elements.push(
          <li key={`li-${index}`} className="ml-6 list-disc text-neutral-700 leading-relaxed my-1.5 text-base sm:text-lg">
            {renderInlineMarkdown(text)}
          </li>
        );
        return;
      }

      // Numbered lists
      if (/^\d+\.\s/.test(line.trim())) {
        const text = line.trim().replace(/^\d+\.\s/, "");
        elements.push(
          <li key={`oli-${index}`} className="ml-6 list-decimal text-neutral-700 leading-relaxed my-1.5 text-base sm:text-lg">
            {renderInlineMarkdown(text)}
          </li>
        );
        return;
      }

      // Empty lines
      if (!line.trim()) {
        return;
      }

      // Standard paragraphs
      elements.push(
        <p key={`p-${index}`} className="my-4 text-base sm:text-lg text-neutral-700 leading-relaxed font-normal">
          {renderInlineMarkdown(line)}
        </p>
      );
    });

    return elements;
  };

  // Helper for **bold** and `code` inline formatting
  const renderInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-neutral-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-900 font-mono text-sm border border-neutral-200">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-20 max-w-4xl mx-auto px-4 animate-pulse space-y-6">
        <div className="h-6 bg-neutral-200 rounded w-1/4" />
        <div className="h-12 bg-neutral-200 rounded w-3/4" />
        <div className="h-4 bg-neutral-200 rounded w-1/2" />
        <div className="h-80 bg-neutral-200 rounded-2xl" />
        <div className="space-y-3 pt-6">
          <div className="h-4 bg-neutral-200 rounded" />
          <div className="h-4 bg-neutral-200 rounded" />
          <div className="h-4 bg-neutral-200 rounded w-4/5" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white pt-36 pb-20 max-w-2xl mx-auto px-4 text-center space-y-6">
        <BookOpen className="w-16 h-16 text-neutral-300 mx-auto" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 font-space">
          Article Not Found
        </h2>
        <p className="text-neutral-500 text-sm">
          The requested engineering article could not be located or may have been archived.
        </p>
        <button
          onClick={() => navigate("/blog")}
          className="px-6 py-3 rounded-xl bg-neutral-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to All Articles</span>
        </button>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-white pt-24 sm:pt-28 pb-20">
      {/* Top Breadcrumb & Return Bar */}
      <div className="bg-neutral-50 border-b border-neutral-200/80 py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={() => navigate("/blog")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Engineering Blog</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
            <span>techelevant.com</span>
            <span>/</span>
            <span>blog</span>
            <span>/</span>
            <span className="text-neutral-900 font-bold truncate max-w-[150px] sm:max-w-xs">
              {post.slug}
            </span>
          </div>
        </div>
      </div>

      {/* Article Header Container */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8">
        <div className="space-y-6">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold uppercase tracking-wider">
              {post.category}
            </span>
            <div className="flex items-center gap-3 text-xs text-neutral-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(post.publishedAt)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {post.readTimeMinutes} min read
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-950 font-space leading-[1.15]">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-lg sm:text-xl text-neutral-600 font-light leading-relaxed">
            {post.excerpt}
          </p>

          {/* Author Strip & Share Actions */}
          <div className="pt-6 border-t border-b border-neutral-200/80 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={post.authorAvatar}
                alt={post.authorName}
                className="w-12 h-12 rounded-full object-cover border-2 border-neutral-200"
              />
              <div>
                <p className="text-sm font-bold text-neutral-950">
                  {post.authorName}
                </p>
                <p className="text-xs text-neutral-500">
                  {post.authorRole}
                </p>
              </div>
            </div>

            {/* Social Share Controls */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={handleCopyLink}
                title="Copy article link"
                className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
              <button
                onClick={shareOnTwitter}
                title="Share on X / Twitter"
                className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-950 transition-colors"
                aria-label="Share on X"
              >
                <Twitter className="w-4 h-4" />
              </button>
              <button
                onClick={shareOnLinkedIn}
                title="Share on LinkedIn"
                className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-blue-700 transition-colors"
                aria-label="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Cover Image */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-neutral-900 border border-neutral-200 max-h-[520px]">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Main Article Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-neutral max-w-none text-neutral-800">
          {renderFormattedContent(post.content)}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-neutral-200">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-3">
              Topics & Technologies
            </span>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio Box */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            className="w-16 h-16 rounded-full object-cover border-2 border-neutral-300 shrink-0"
          />
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
              About the Author
            </span>
            <h4 className="text-lg font-bold text-neutral-950">
              {post.authorName}
            </h4>
            <p className="text-xs text-blue-900 font-semibold">
              {post.authorRole} at Tech Elevant
            </p>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed pt-1">
              Senior engineering leader driving high-concurrency systems design, zero-trust cloud infrastructure, and enterprise AI orchestration for global clients.
            </p>
          </div>
        </div>

        {/* Project Call to Action */}
        <div className="mt-12 p-8 sm:p-10 rounded-3xl bg-neutral-950 text-white border border-neutral-800 relative overflow-hidden space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-xs text-neutral-300 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tech Elevant Enterprise Delivery</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-space">
            Ready to implement these patterns in your codebase?
          </h3>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Our principal software engineers and AI architects can audit your current architecture, recommend target topologies, and co-pilot delivery.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/get-in-touch")}
              className="px-6 py-3 rounded-xl bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-2"
            >
              <span>Schedule Technical Consultation</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/portfolio")}
              className="px-6 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-semibold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors"
            >
              View Client Case Studies
            </button>
          </div>
        </div>
      </div>

      {/* Related Articles Section */}
      {relatedPosts.length > 0 && (
        <aside className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-16 border-t border-neutral-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold tracking-tight text-neutral-950 font-space">
              Recommended Reading
            </h3>
            <button
              onClick={() => navigate("/blog")}
              className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1 uppercase tracking-wider"
            >
              <span>View All Articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((related) => (
              <div
                key={related.id}
                onClick={() => navigate(`/blog/${related.slug}`)}
                className="group cursor-pointer rounded-2xl bg-white border border-neutral-200/90 overflow-hidden hover:shadow-lg hover:border-neutral-300 transition-all p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-40 rounded-xl overflow-hidden bg-neutral-900 mb-3">
                    <img
                      src={related.coverImage}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    {related.category}
                  </span>
                  <h4 className="text-base font-bold text-neutral-950 group-hover:text-blue-900 transition-colors line-clamp-2 leading-snug">
                    {related.title}
                  </h4>
                  <p className="text-xs text-neutral-600 line-clamp-2">
                    {related.excerpt}
                  </p>
                </div>
                <div className="pt-4 mt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-medium">
                  <span>{related.readTimeMinutes} min read</span>
                  <span className="text-neutral-950 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Read</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}
    </article>
  );
};
