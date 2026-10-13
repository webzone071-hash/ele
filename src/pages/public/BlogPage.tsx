import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { api } from "../../services/api";
import { BlogPost } from "../../types";
import {
  Search,
  BookOpen,
  Clock,
  Calendar,
  ArrowRight,
  Sparkles,
  Tag,
  Filter,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";

export const BlogPage: React.FC = () => {
  const { navigate, settings } = useApp();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    // Dynamic SEO for Blog Listing Page
    document.title = `Engineering Blog & Technical Insights | ${settings?.agencyName || "Tech Elevant"}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Explore authoritative technical briefs, enterprise architecture patterns, and AI systems engineering from Tech Elevant's engineering team."
      );
    }

    const loadPosts = async () => {
      try {
        setIsLoading(true);
        const data = await api.getBlogs(false);
        setBlogs(data);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadPosts();
  }, [settings?.agencyName]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    blogs.forEach((b) => {
      if (b.category) cats.add(b.category);
    });
    return ["All", ...Array.from(cats)];
  }, [blogs]);

  // Filter posts
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesCategory =
        selectedCategory === "All" || blog.category.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        blog.title.toLowerCase().includes(q) ||
        blog.excerpt.toLowerCase().includes(q) ||
        blog.tags.some((t) => t.toLowerCase().includes(q)) ||
        (blog.authorName && blog.authorName.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [blogs, selectedCategory, searchQuery]);

  const featuredPost = useMemo(() => {
    if (selectedCategory !== "All" || searchQuery) return null;
    return blogs.find((b) => b.isFeatured) || (blogs.length > 0 ? blogs[0] : null);
  }, [blogs, selectedCategory, searchQuery]);

  const regularPosts = useMemo(() => {
    if (featuredPost && selectedCategory === "All" && !searchQuery) {
      return filteredBlogs.filter((b) => b.id !== featuredPost.id);
    }
    return filteredBlogs;
  }, [filteredBlogs, featuredPost, selectedCategory, searchQuery]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently Published";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 sm:pt-28 pb-20">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-neutral-950 text-white py-16 sm:py-24 border-b border-neutral-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#0A1C6A_0%,transparent_60%)] opacity-40 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-700 text-xs font-semibold uppercase tracking-wider text-neutral-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Architectural Insights & Engineering Notes</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-space leading-tight text-white">
              Engineering Blog & Tech Insights
            </h1>
            <p className="text-base sm:text-lg text-neutral-400 leading-relaxed font-light">
              Deep dives into high-concurrency enterprise architecture, autonomous AI agents, zero-trust security patterns, and modern full-stack systems engineered by our team.
            </p>
          </div>

          {/* Search Bar & Stats */}
          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search articles by title, keyword, or technology..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-white transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
              <span className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>{blogs.length} Articles Published</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar border-b border-neutral-100">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mr-2 flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Topics:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-tight transition-all shrink-0 ${
                selectedCategory === cat
                  ? "bg-neutral-950 text-white shadow-sm"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Post Hero (When viewing All and no search) */}
        {featuredPost && (
          <section className="mt-8 sm:mt-12 mb-16">
            <div
              onClick={() => navigate(`/blog/${featuredPost.slug}`)}
              className="group cursor-pointer rounded-3xl bg-neutral-50 border border-neutral-200/80 overflow-hidden hover:shadow-xl hover:border-neutral-300 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12"
            >
              {/* Cover Image */}
              <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-full min-h-[300px] overflow-hidden bg-neutral-900">
                <img
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-neutral-950/90 backdrop-blur-xs text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Featured Article</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-neutral-950 text-xs font-semibold shadow-sm">
                    {featuredPost.category}
                  </span>
                </div>
              </div>

              {/* Content side */}
              <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs text-neutral-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(featuredPost.publishedAt)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredPost.readTimeMinutes} min read
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 group-hover:text-blue-900 transition-colors font-space leading-tight">
                    {featuredPost.title}
                  </h2>

                  <p className="text-sm sm:text-base text-neutral-600 leading-relaxed line-clamp-3">
                    {featuredPost.excerpt}
                  </p>

                  {/* Tags */}
                  {featuredPost.tags && featuredPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {featuredPost.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-md bg-neutral-200/70 text-neutral-700 text-xs font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Author Info & CTA */}
                <div className="pt-6 border-t border-neutral-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={featuredPost.authorAvatar}
                      alt={featuredPost.authorName}
                      className="w-10 h-10 rounded-full object-cover border border-neutral-300"
                    />
                    <div>
                      <p className="text-xs font-bold text-neutral-950">
                        {featuredPost.authorName}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {featuredPost.authorRole}
                      </p>
                    </div>
                  </div>

                  <span className="w-10 h-10 rounded-full bg-neutral-950 group-hover:bg-blue-950 text-white flex items-center justify-center transition-all group-hover:translate-x-1 shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Post Grid */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 font-space">
              {selectedCategory === "All" && !searchQuery
                ? "Latest Engineering Articles"
                : `Articles in "${selectedCategory}"`}
            </h3>
            <span className="text-xs text-neutral-500 font-mono">
              Showing {filteredBlogs.length} {filteredBlogs.length === 1 ? "article" : "articles"}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-2xl border border-neutral-200 p-4 space-y-4 animate-pulse">
                  <div className="h-48 bg-neutral-200 rounded-xl" />
                  <div className="h-4 bg-neutral-200 rounded w-1/3" />
                  <div className="h-6 bg-neutral-200 rounded w-4/5" />
                  <div className="h-4 bg-neutral-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : regularPosts.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl bg-neutral-50 border border-neutral-200">
              <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-neutral-800">No articles found</h4>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto mt-1">
                Try selecting a different topic or clearing your search keywords.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-neutral-950 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  className="group cursor-pointer rounded-2xl bg-white border border-neutral-200/90 overflow-hidden hover:shadow-xl hover:border-neutral-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative h-48 sm:h-52 overflow-hidden bg-neutral-900">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-neutral-950/85 backdrop-blur-xs text-white text-[11px] font-semibold tracking-wide">
                          {post.category}
                        </span>
                        {post.isFeatured && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 text-[10px] font-bold uppercase tracking-wider">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-3 text-xs text-neutral-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(post.publishedAt)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTimeMinutes} min read
                        </span>
                      </div>

                      <h4 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-950 group-hover:text-blue-900 transition-colors font-space line-clamp-2 leading-snug">
                        {post.title}
                      </h4>

                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {post.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 text-[11px]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-6 pt-0 border-t border-neutral-100 mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 pt-3">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-7 h-7 rounded-full object-cover border border-neutral-200"
                      />
                      <span className="text-xs font-semibold text-neutral-800 truncate max-w-[140px]">
                        {post.authorName}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-neutral-950 group-hover:text-blue-700 flex items-center gap-1 transition-colors pt-3">
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Enterprise Architecture Consultation Callout */}
        <section className="mb-16 p-8 sm:p-12 rounded-3xl bg-neutral-950 text-white relative overflow-hidden border border-neutral-800">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,#0A1C6A_0%,transparent_70%)] opacity-30 pointer-events-none" />
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              Custom Engineering & Architecture
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-space text-white">
              Need technical leadership for your mission-critical systems?
            </h3>
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed font-light">
              We partner directly with founders and CTOs to architect high-throughput applications, build production AI systems, and harden cloud security.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/get-in-touch")}
                className="px-6 py-3 rounded-xl bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-2 shadow-sm"
              >
                <span>Schedule Architecture Review</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/services")}
                className="px-6 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-semibold text-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors"
              >
                Explore Services
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
