import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { api } from "../../services/api";
import { BlogPost } from "../../types";
import {
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Copy,
  Calendar,
  Clock,
  ExternalLink,
  Sparkles,
  Tag,
  Globe,
  Share2,
  Check,
  X,
  RefreshCw,
  FolderPlus,
  HelpCircle,
  ShieldCheck,
  FileText,
  Layers,
  Code,
  List,
  Heading,
  Bold,
  Quote,
} from "lucide-react";

const PRESET_IMAGES = [
  {
    label: "Cloud Architecture",
    url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
  },
  {
    label: "AI Neural Network",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
  },
  {
    label: "Cybersecurity & Code",
    url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80",
  },
  {
    label: "Software Engineering",
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
  },
  {
    label: "DevOps & Scale",
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
  },
];

const PRESET_CATEGORIES = [
  "Enterprise Architecture",
  "AI & Machine Learning",
  "Cybersecurity & Cloud",
  "Full-Stack Engineering",
  "DevOps & Microservices",
  "Web Performance",
];

export const AdminBlogManager: React.FC = () => {
  const { showToast, navigate, refreshData } = useApp();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<"content" | "seo" | "preview">("content");
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [newTagInput, setNewTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load all blogs including drafts
  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const data = await api.getBlogs(true);
      setBlogs(data);
    } catch (err: any) {
      showToast(err.message || "Failed to load blog posts", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Filtered Posts
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchStatus = statusFilter === "all" || blog.status === statusFilter;
      const matchCategory = categoryFilter === "all" || blog.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        blog.title.toLowerCase().includes(q) ||
        blog.slug.toLowerCase().includes(q) ||
        (blog.seoKeywords && blog.seoKeywords.toLowerCase().includes(q)) ||
        blog.tags.some((t) => t.toLowerCase().includes(q));
      return matchStatus && matchCategory && matchQuery;
    });
  }, [blogs, statusFilter, categoryFilter, searchQuery]);

  // Open Create Modal
  const handleOpenCreate = () => {
    const newPost: Partial<BlogPost> = {
      title: "",
      slug: "",
      excerpt: "",
      content: "## Overview\n\nEnter your technical analysis and code examples here.\n\n```typescript\n// Example Code\n```",
      coverImage: PRESET_IMAGES[0].url,
      category: "Enterprise Architecture",
      authorName: "Tech Elevant Engineering",
      authorRole: "Principal Software Architect",
      authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      readTimeMinutes: 5,
      tags: ["Software Engineering", "Cloud", "Architecture"],
      status: "published",
      isFeatured: false,
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
      canonicalUrl: "",
      ogImage: "",
      robots: "index, follow",
      structuredDataType: "TechArticle",
    };
    setEditingPost(newPost);
    setActiveModalTab("content");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost({ ...post });
    setActiveModalTab("content");
    setIsModalOpen(true);
  };

  // Auto-slug generator
  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  // Auto-calculate read time
  const calculateReadTime = (content: string, excerpt: string) => {
    const words = (content + " " + excerpt).trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  // Handle Save
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost?.title?.trim()) {
      showToast("Please enter an article title.", "error");
      setActiveModalTab("content");
      return;
    }

    try {
      setIsSaving(true);
      const slug = editingPost.slug?.trim() || generateSlugFromTitle(editingPost.title);
      const readTime =
        editingPost.readTimeMinutes || calculateReadTime(editingPost.content || "", editingPost.excerpt || "");

      const payload: Partial<BlogPost> = {
        ...editingPost,
        slug,
        readTimeMinutes: readTime,
        seoTitle: editingPost.seoTitle?.trim() || `${editingPost.title} | Tech Elevant`,
        seoDescription: editingPost.seoDescription?.trim() || editingPost.excerpt?.trim() || "",
        canonicalUrl: editingPost.canonicalUrl?.trim() || `https://techelevant.com/blog/${slug}`,
        ogImage: editingPost.ogImage?.trim() || editingPost.coverImage,
      };

      await api.saveBlog(payload);
      await loadPosts();
      await refreshData();
      showToast(
        editingPost.id ? "Blog post updated successfully!" : "New blog post published successfully!",
        "success"
      );
      setIsModalOpen(false);
      setEditingPost(null);
    } catch (err: any) {
      showToast(err.message || "Failed to save blog post", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete
  const handleDeletePost = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }
    try {
      await api.deleteBlog(id);
      await loadPosts();
      await refreshData();
      showToast("Blog post deleted.", "info");
    } catch (err: any) {
      showToast(err.message || "Failed to delete blog post", "error");
    }
  };

  // Toggle Status (Published <-> Draft)
  const handleToggleStatus = async (post: BlogPost) => {
    const nextStatus = post.status === "published" ? "draft" : "published";
    try {
      await api.toggleBlogStatus(post.id, nextStatus);
      await loadPosts();
      await refreshData();
      showToast(`Article status updated to ${nextStatus.toUpperCase()}`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error");
    }
  };

  // Duplicate Post
  const handleDuplicatePost = async (post: BlogPost) => {
    const duplicate: Partial<BlogPost> = {
      ...post,
      id: undefined,
      title: `${post.title} (Copy)`,
      slug: `${post.slug}-copy-${Date.now().toString().slice(-4)}`,
      status: "draft",
      isFeatured: false,
    };
    try {
      await api.saveBlog(duplicate);
      await loadPosts();
      showToast("Article duplicated as Draft.", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to duplicate article", "error");
    }
  };

  // Helper to append formatting in Markdown editor
  const insertFormatting = (prefix: string, suffix: string = "") => {
    if (!editingPost) return;
    const content = editingPost.content || "";
    setEditingPost({
      ...editingPost,
      content: content + `\n${prefix}Sample Text${suffix}`,
    });
  };

  // SEO Score calculation & Audit
  const seoAudit = useMemo(() => {
    if (!editingPost) return { score: 0, items: [] };
    const items = [];
    let score = 0;

    // 1. Title Length
    const titleLen = (editingPost.seoTitle || editingPost.title || "").length;
    if (titleLen >= 30 && titleLen <= 65) {
      items.push({ text: `Title length (${titleLen} chars) is optimal for Google SERP`, pass: true });
      score += 20;
    } else {
      items.push({
        text: `Title length (${titleLen} chars). Recommended: 35-60 characters for best display`,
        pass: false,
      });
      score += 5;
    }

    // 2. Meta Description Length
    const descLen = (editingPost.seoDescription || editingPost.excerpt || "").length;
    if (descLen >= 80 && descLen <= 165) {
      items.push({ text: `Meta description length (${descLen} chars) is optimal`, pass: true });
      score += 25;
    } else {
      items.push({
        text: `Meta description (${descLen} chars). Recommended: 100-160 characters`,
        pass: false,
      });
      score += 5;
    }

    // 3. Slug structure
    const slug = editingPost.slug || "";
    if (slug && /^[a-z0-9-]+$/.test(slug)) {
      items.push({ text: "Clean SEO-friendly URL slug format (kebab-case)", pass: true });
      score += 15;
    } else {
      items.push({ text: "URL slug should only contain lowercase letters, numbers, and dashes", pass: false });
    }

    // 4. Focus Keywords
    if (editingPost.seoKeywords && editingPost.seoKeywords.trim()) {
      items.push({ text: `Focus keywords configured (${editingPost.seoKeywords.split(",").length} tags)`, pass: true });
      score += 15;
    } else {
      items.push({ text: "No focus keywords defined for search indexing", pass: false });
    }

    // 5. Featured Cover Image
    if (editingPost.coverImage && editingPost.coverImage.startsWith("http")) {
      items.push({ text: "OpenGraph / social share cover image is set", pass: true });
      score += 15;
    } else {
      items.push({ text: "Missing high-res cover image for Google Discover & rich cards", pass: false });
    }

    // 6. Content Depth
    const words = (editingPost.content || "").split(/\s+/).filter(Boolean).length;
    if (words >= 250) {
      items.push({ text: `Content depth is good (${words} words)`, pass: true });
      score += 10;
    } else {
      items.push({ text: `Content is brief (${words} words). Aim for 300+ words for technical authority`, pass: false });
    }

    return { score, items };
  }, [editingPost]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold tracking-tight">
              Blog & SEO Content Management
            </h2>
          </div>
          <p className="text-xs text-neutral-400">
            Publish technical case studies, engineering insights, and manage complete on-page SEO meta tags for Google Search Console.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate("/blog")}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Blog</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write New Article</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
            Total Articles
          </span>
          <span className="text-2xl font-extrabold text-white mt-1 block">
            {blogs.length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
            Published Live
          </span>
          <span className="text-2xl font-extrabold text-white mt-1 block">
            {blogs.filter((b) => b.status === "published").length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
            Drafts & Review
          </span>
          <span className="text-2xl font-extrabold text-white mt-1 block">
            {blogs.filter((b) => b.status === "draft").length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
            Active Topics
          </span>
          <span className="text-2xl font-extrabold text-white mt-1 block">
            {new Set(blogs.map((b) => b.category)).size}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search articles by title, keyword, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-neutral-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {PRESET_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={loadPosts}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Articles Table / Grid */}
      <div className="rounded-2xl bg-neutral-950 border border-neutral-800 overflow-hidden shadow-md">
        {isLoading ? (
          <div className="p-12 text-center text-neutral-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-400" />
            <p className="text-xs font-mono">Loading CMS articles...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-neutral-600 mx-auto" />
            <h4 className="text-base font-bold text-white">No articles found</h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Get started by creating your first engineering article with full SEO tags.
            </p>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-white text-neutral-950 font-bold text-xs uppercase hover:bg-neutral-200 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Article</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-900/80 text-[11px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SEO Checklist</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 font-normal">
                {filteredBlogs.map((post) => (
                  <tr key={post.id} className="hover:bg-neutral-900/50 transition-colors">
                    {/* Article Column */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-12 h-12 rounded-lg object-cover shrink-0 border border-neutral-800"
                        />
                        <div className="min-w-0 max-w-xs sm:max-w-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs truncate block hover:text-blue-400 cursor-pointer" onClick={() => handleOpenEdit(post)}>
                              {post.title}
                            </span>
                            {post.isFeatured && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-400 text-neutral-950 text-[9px] font-bold uppercase shrink-0">
                                Featured
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-neutral-500 font-mono truncate block">
                            /blog/{post.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 font-medium">
                        {post.category}
                      </span>
                    </td>

                    {/* Author */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-neutral-300 text-xs font-medium">
                          {post.authorName}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(post)}
                        title="Click to toggle publish status"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                          post.status === "published"
                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800 hover:bg-emerald-900"
                            : "bg-amber-950/80 text-amber-400 border border-amber-800 hover:bg-amber-900"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            post.status === "published" ? "bg-emerald-400" : "bg-amber-400"
                          }`}
                        />
                        <span>{post.status}</span>
                      </button>
                    </td>

                    {/* SEO Health */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            post.seoTitle && post.seoDescription
                              ? "bg-emerald-900/60 text-emerald-300"
                              : "bg-amber-900/60 text-amber-300"
                          }`}
                        >
                          {post.seoTitle && post.seoDescription ? "SEO Configured" : "Needs SEO"}
                        </span>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          {post.readTimeMinutes}m read
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/blog/${post.slug}`)}
                          className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                          title="View live post"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicatePost(post)}
                          className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                          title="Duplicate article"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(post)}
                          className="p-1.5 rounded-lg bg-neutral-900 hover:bg-blue-600 text-neutral-400 hover:text-white transition-colors"
                          title="Edit article & SEO"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id, post.title)}
                          className="p-1.5 rounded-lg bg-neutral-900 hover:bg-red-600 text-neutral-400 hover:text-white transition-colors"
                          title="Delete article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full-featured Article & SEO Editor Modal */}
      {isModalOpen && editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-5xl bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-900/60 text-blue-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {editingPost.id ? "Edit Article & SEO Directives" : "Create New Engineering Article"}
                  </h3>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {editingPost.slug ? `techelevant.com/blog/${editingPost.slug}` : "Draft Slug Pending"}
                  </span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setActiveModalTab("content")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeModalTab === "content"
                      ? "bg-neutral-800 text-white shadow-xs"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  1. Article Content
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTab("seo")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    activeModalTab === "seo"
                      ? "bg-blue-950 text-blue-300 border border-blue-800 shadow-xs"
                      : "text-neutral-400 hover:text-blue-400"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>2. SEO Suite ({seoAudit.score}/100)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTab("preview")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeModalTab === "preview"
                      ? "bg-neutral-800 text-white shadow-xs"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  3. SERP & Live Preview
                </button>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSavePost} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: Content & Details */}
              {activeModalTab === "content" && (
                <div className="space-y-6">
                  {/* Title & Slug */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-8 space-y-1.5">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                        Article Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Architecting High-Concurrency Microfrontends in 2026"
                        value={editingPost.title || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingPost({
                            ...editingPost,
                            title: val,
                            // If slug is empty or matched previous auto-generated, keep sync
                            slug: editingPost.slug ? editingPost.slug : generateSlugFromTitle(val),
                          });
                        }}
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="sm:col-span-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                          URL Slug *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            if (editingPost.title) {
                              setEditingPost({
                                ...editingPost,
                                slug: generateSlugFromTitle(editingPost.title),
                              });
                            }
                          }}
                          className="text-[10px] text-blue-400 hover:underline"
                        >
                          Auto-generate
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. architecting-high-concurrency-microfrontends"
                        value={editingPost.slug || ""}
                        onChange={(e) =>
                          setEditingPost({
                            ...editingPost,
                            slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Category, Status, Featured, Read Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-400">
                        Category
                      </label>
                      <input
                        type="text"
                        list="category-suggestions"
                        value={editingPost.category || ""}
                        onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none"
                      />
                      <datalist id="category-suggestions">
                        {PRESET_CATEGORIES.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-400">
                        Publication Status
                      </label>
                      <select
                        value={editingPost.status || "published"}
                        onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none"
                      >
                        <option value="published">Published (Live)</option>
                        <option value="draft">Draft (Admin Only)</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-400">
                        Reading Time (Minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={editingPost.readTimeMinutes || 5}
                        onChange={(e) =>
                          setEditingPost({
                            ...editingPost,
                            readTimeMinutes: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col justify-end space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer pt-2">
                        <input
                          type="checkbox"
                          checked={editingPost.isFeatured || false}
                          onChange={(e) => setEditingPost({ ...editingPost, isFeatured: e.target.checked })}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-neutral-950 border-neutral-700"
                        />
                        <span className="text-xs font-bold text-amber-300">
                          Featured Post ⭐
                        </span>
                      </label>
                      <span className="text-[10px] text-neutral-500">
                        Highlights article as hero banner
                      </span>
                    </div>
                  </div>

                  {/* Excerpt / Summary */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                        Article Excerpt / Teaser Summary *
                      </label>
                      <span className="text-[11px] text-neutral-500">
                        {(editingPost.excerpt || "").length} / 160 chars
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      required
                      placeholder="Brief 1-2 sentence executive summary of this engineering topic for card previews and search results..."
                      value={editingPost.excerpt || ""}
                      onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-blue-500 leading-relaxed"
                    />
                  </div>

                  {/* Cover Image Picker */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                      Cover Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={editingPost.coverImage || ""}
                        onChange={(e) => setEditingPost({ ...editingPost, coverImage: e.target.value })}
                        className="flex-1 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none"
                      />
                    </div>
                    {/* Quick Presets */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] text-neutral-500">Quick Tech Photos:</span>
                      {PRESET_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditingPost({ ...editingPost, coverImage: preset.url })}
                          className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300 hover:text-white hover:border-neutral-700"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    {editingPost.coverImage && (
                      <div className="mt-2 h-28 rounded-xl overflow-hidden border border-neutral-800 max-w-sm">
                        <img
                          src={editingPost.coverImage}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Rich Content Editor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                        Article Content (Markdown Supported)
                      </label>
                      {/* Editor Tool Toolbar */}
                      <div className="flex items-center gap-1 bg-neutral-900 px-2 py-1 rounded-lg border border-neutral-800">
                        <button
                          type="button"
                          onClick={() => insertFormatting("## ")}
                          className="px-1.5 py-0.5 text-xs text-neutral-400 hover:text-white font-bold"
                          title="Heading 2"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting("### ")}
                          className="px-1.5 py-0.5 text-xs text-neutral-400 hover:text-white font-bold"
                          title="Heading 3"
                        >
                          H3
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting("**", "**")}
                          className="px-1.5 py-0.5 text-xs text-neutral-400 hover:text-white font-bold"
                          title="Bold Text"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting("- ")}
                          className="px-1.5 py-0.5 text-xs text-neutral-400 hover:text-white"
                          title="Bullet List"
                        >
                          • List
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting("```typescript\n// Code snippet\n```")}
                          className="px-1.5 py-0.5 text-xs text-neutral-400 hover:text-white font-mono"
                          title="Code Block"
                        >
                          {"</>"}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertFormatting("> ")}
                          className="px-1.5 py-0.5 text-xs text-neutral-400 hover:text-white"
                          title="Quote"
                        >
                          Quote
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={14}
                      placeholder="Write your article body using headings (##), bold (**text**), lists (- item), or code blocks (```)..."
                      value={editingPost.content || ""}
                      onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-blue-500 leading-relaxed"
                    />
                  </div>

                  {/* Author Details & Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-400">
                        Author Name
                      </label>
                      <input
                        type="text"
                        value={editingPost.authorName || ""}
                        onChange={(e) => setEditingPost({ ...editingPost, authorName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-400">
                        Author Role
                      </label>
                      <input
                        type="text"
                        value={editingPost.authorRole || ""}
                        onChange={(e) => setEditingPost({ ...editingPost, authorRole: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-400">
                        Author Avatar URL
                      </label>
                      <input
                        type="url"
                        value={editingPost.authorAvatar || ""}
                        onChange={(e) => setEditingPost({ ...editingPost, authorAvatar: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Interactive Tags */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                      Article Tags
                    </label>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {(editingPost.tags || []).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-200 text-xs flex items-center gap-1.5"
                        >
                          <span>#{tag}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const nextTags = (editingPost.tags || []).filter((_, i) => i !== idx);
                              setEditingPost({ ...editingPost, tags: nextTags });
                            }}
                            className="text-neutral-400 hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 max-w-sm">
                      <input
                        type="text"
                        placeholder="Add tag (e.g. Next.js, Cloud)..."
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (newTagInput.trim()) {
                              setEditingPost({
                                ...editingPost,
                                tags: [...(editingPost.tags || []), newTagInput.trim()],
                              });
                              setNewTagInput("");
                            }
                          }
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newTagInput.trim()) {
                            setEditingPost({
                              ...editingPost,
                              tags: [...(editingPost.tags || []), newTagInput.trim()],
                            });
                            setNewTagInput("");
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 text-white text-xs font-semibold hover:bg-neutral-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Complete SEO Suite (The core requirement) */}
              {activeModalTab === "seo" && (
                <div className="space-y-6">
                  {/* SEO Health Score Banner */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/80 to-neutral-900 border border-blue-900/60 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest block">
                        On-Page SEO Optimization Score
                      </span>
                      <h4 className="text-xl font-black text-white mt-0.5">
                        {seoAudit.score} / 100 Points
                      </h4>
                      <p className="text-xs text-neutral-400 mt-1">
                        Ensures high ranking in Google Search Console and beautiful rich snippets on social networks.
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-blue-900/40 border border-blue-700 flex items-center justify-center text-xl font-black text-blue-300">
                      {seoAudit.score}%
                    </div>
                  </div>

                  {/* SEO Audit Checklist */}
                  <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-2">
                    <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2">
                      SEO Technical Audit
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {seoAudit.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs py-1 px-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80"
                        >
                          {item.pass ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          )}
                          <span className={item.pass ? "text-neutral-300" : "text-amber-300"}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SEO Meta Title */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                        SEO Meta Title (Title Tag for Google SERP)
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (editingPost.title) {
                              setEditingPost({
                                ...editingPost,
                                seoTitle: `${editingPost.title} | Tech Elevant`,
                              });
                            }
                          }}
                          className="text-[10px] text-blue-400 hover:underline"
                        >
                          Auto-fill from Title
                        </button>
                        <span
                          className={`text-[11px] font-mono ${
                            (editingPost.seoTitle || "").length >= 35 &&
                            (editingPost.seoTitle || "").length <= 65
                              ? "text-emerald-400 font-bold"
                              : "text-neutral-500"
                          }`}
                        >
                          {(editingPost.seoTitle || "").length} / 60 chars (Optimal: 40-60)
                        </span>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. High-Concurrency Microfrontends Architecture in 2026 | Tech Elevant"
                      value={editingPost.seoTitle || ""}
                      onChange={(e) => setEditingPost({ ...editingPost, seoTitle: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* SEO Meta Description */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                        SEO Meta Description (Google SERP Snippet)
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (editingPost.excerpt) {
                              setEditingPost({
                                ...editingPost,
                                seoDescription: editingPost.excerpt,
                              });
                            }
                          }}
                          className="text-[10px] text-blue-400 hover:underline"
                        >
                          Auto-fill from Excerpt
                        </button>
                        <span
                          className={`text-[11px] font-mono ${
                            (editingPost.seoDescription || "").length >= 100 &&
                            (editingPost.seoDescription || "").length <= 165
                              ? "text-emerald-400 font-bold"
                              : "text-neutral-500"
                          }`}
                        >
                          {(editingPost.seoDescription || "").length} / 160 chars (Optimal: 120-160)
                        </span>
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="e.g. Discover proven patterns for module federation, edge SSR composition, and isolated state in enterprise architectures handling millions of users."
                      value={editingPost.seoDescription || ""}
                      onChange={(e) => setEditingPost({ ...editingPost, seoDescription: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-blue-500 leading-relaxed"
                    />
                  </div>

                  {/* Focus Keywords */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                      Focus Keywords / Target Phrases (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. microfrontends, enterprise web development, module federation, react architecture"
                      value={editingPost.seoKeywords || ""}
                      onChange={(e) => setEditingPost({ ...editingPost, seoKeywords: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[11px] text-neutral-500 block">
                      Injected directly into HTML meta keywords tag for indexing bots and search engines.
                    </span>
                  </div>

                  {/* Canonical URL & OG Social Image */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                        Canonical URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://techelevant.com/blog/..."
                        value={
                          editingPost.canonicalUrl ||
                          (editingPost.slug ? `https://techelevant.com/blog/${editingPost.slug}` : "")
                        }
                        onChange={(e) => setEditingPost({ ...editingPost, canonicalUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-mono focus:outline-none"
                      />
                      <span className="text-[10px] text-neutral-500">
                        Prevents duplicate content penalties in Google Search Console.
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                        Open Graph Social Image (OG Image)
                      </label>
                      <input
                        type="url"
                        placeholder="Default uses cover image"
                        value={editingPost.ogImage || ""}
                        onChange={(e) => setEditingPost({ ...editingPost, ogImage: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:outline-none"
                      />
                      <span className="text-[10px] text-neutral-500">
                        Shared preview image for LinkedIn, Twitter / X, and WhatsApp cards.
                      </span>
                    </div>
                  </div>

                  {/* Robots Directive & Schema Structured Data */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">
                        Robots Directives
                      </label>
                      <select
                        value={editingPost.robots || "index, follow"}
                        onChange={(e) => setEditingPost({ ...editingPost, robots: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none"
                      >
                        <option value="index, follow">index, follow (Standard - Allows Google Indexing)</option>
                        <option value="noindex, follow">noindex, follow (Hide from Google, follow links)</option>
                        <option value="noindex, nofollow">noindex, nofollow (Complete privacy)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">
                        Schema.org Structured Data
                      </label>
                      <select
                        value={editingPost.structuredDataType || "TechArticle"}
                        onChange={(e) => setEditingPost({ ...editingPost, structuredDataType: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none"
                      >
                        <option value="TechArticle">TechArticle (Recommended for Software Engineering)</option>
                        <option value="Article">Article (Standard general journalism)</option>
                        <option value="BlogPosting">BlogPosting (Short informal blog post)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Google SERP Preview & Social Snippet Preview */}
              {activeModalTab === "preview" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                      Google Search Result Snippet Simulation
                    </span>
                    {/* Google SERP Box */}
                    <div className="p-5 rounded-2xl bg-white text-neutral-900 shadow-md border border-neutral-200 max-w-2xl font-sans">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center text-[10px] font-black">
                          TE
                        </div>
                        <div className="text-xs text-neutral-700 leading-none">
                          <span className="font-semibold text-neutral-900 block">Tech Elevant</span>
                          <span className="text-[11px] text-neutral-500 font-mono">
                            https://techelevant.com › blog › {editingPost.slug || "article-slug"}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-lg text-[#1a0dab] hover:underline font-medium cursor-pointer leading-snug">
                        {editingPost.seoTitle || `${editingPost.title || "Article Title"} | Tech Elevant`}
                      </h4>
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                        {editingPost.seoDescription ||
                          editingPost.excerpt ||
                          "No meta description specified yet. Google will automatically generate a snippet from your content."}
                      </p>
                    </div>
                  </div>

                  {/* Social Share Card Preview */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                      Social Share Card Simulation (LinkedIn / Twitter / Slack)
                    </span>
                    <div className="max-w-md rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-lg">
                      <div className="h-44 bg-neutral-950 overflow-hidden">
                        <img
                          src={editingPost.ogImage || editingPost.coverImage}
                          alt="Social Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 space-y-1">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                          TECHELEVANT.COM
                        </span>
                        <h5 className="text-sm font-bold text-white line-clamp-1">
                          {editingPost.seoTitle || editingPost.title}
                        </h5>
                        <p className="text-xs text-neutral-400 line-clamp-2">
                          {editingPost.seoDescription || editingPost.excerpt}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  {activeModalTab !== "seo" && (
                    <button
                      type="button"
                      onClick={() => setActiveModalTab("seo")}
                      className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Review SEO Settings →</span>
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Saving..." : editingPost.id ? "Update Article & SEO" : "Publish Article"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
