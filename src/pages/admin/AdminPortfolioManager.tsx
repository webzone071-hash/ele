import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { PortfolioItem } from "../../types";
import { api } from "../../services/api";
import {
  FolderKanban,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  CheckCircle2,
  X,
  Search,
} from "lucide-react";

export const AdminPortfolioManager: React.FC = () => {
  const { data, refreshData, showToast } = useApp();
  const portfolio = data?.portfolio || [];

  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const defaultFormState: Partial<PortfolioItem> = {
    title: "",
    slug: "",
    category: "SaaS",
    client: "",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80",
    shortDescription: "",
    challenge: "",
    solution: "",
    result: "",
    technologies: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    metrics: [
      { label: "Performance", value: "99.9%" },
      { label: "Throughput", value: "10x" },
    ],
    projectUrl: "https://techelevant.com",
    isActive: true,
    isFeatured: true,
    displayOrder: portfolio.length + 1,
  };

  const [formData, setFormData] = useState<Partial<PortfolioItem>>(defaultFormState);
  const [techInput, setTechInput] = useState("");
  const [metric1Label, setMetric1Label] = useState("");
  const [metric1Value, setMetric1Value] = useState("");
  const [metric2Label, setMetric2Label] = useState("");
  const [metric2Value, setMetric2Value] = useState("");

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData(defaultFormState);
    setTechInput((defaultFormState.technologies || []).join(", "));
    setMetric1Label("Uptime");
    setMetric1Value("99.99%");
    setMetric2Label("Latency");
    setMetric2Value("<150ms");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData(item);
    setTechInput(item.technologies.join(", "));
    setMetric1Label(item.metrics?.[0]?.label || "");
    setMetric1Value(item.metrics?.[0]?.value || "");
    setMetric2Label(item.metrics?.[1]?.label || "");
    setMetric2Value(item.metrics?.[1]?.value || "");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete case study "${title}"?`)) return;
    try {
      await api.deletePortfolioItem(id);
      showToast("Case study deleted successfully.", "success");
      await refreshData();
    } catch (err: any) {
      showToast(err.message || "Failed to delete.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.client) {
      showToast("Please provide title and client name.", "error");
      return;
    }

    const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const cleanedTech = techInput.split(",").map((t) => t.trim()).filter(Boolean);

    const metrics = [];
    if (metric1Label && metric1Value) metrics.push({ label: metric1Label, value: metric1Value });
    if (metric2Label && metric2Value) metrics.push({ label: metric2Label, value: metric2Value });

    const payload = {
      ...formData,
      slug,
      technologies: cleanedTech,
      metrics,
    };

    try {
      setIsSaving(true);
      if (editingItem) {
        await api.updatePortfolioItem(editingItem.id, payload);
        showToast("Case study updated successfully!", "success");
      } else {
        await api.createPortfolioItem(payload as any);
        showToast("New case study added successfully!", "success");
      }
      setIsModalOpen(false);
      await refreshData();
    } catch (err: any) {
      showToast(err.message || "Failed to save case study.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = portfolio.filter((p) => {
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.client.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-neutral-300" />
            <span>Portfolio & Case Studies CMS</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Manage your verified case studies, client challenges, engineered solutions, and business outcomes.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Case Study</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by title, client, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
        />
      </div>

      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider bg-neutral-900/40">
                <th className="py-3.5 px-4">Case Study</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Metrics</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-900/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-12 h-8 object-cover rounded-lg border border-neutral-800 shrink-0"
                      />
                      <div className="max-w-xs">
                        <span className="font-bold text-white block truncate">{item.title}</span>
                        <span className="text-[11px] text-neutral-400 block truncate">
                          {item.shortDescription}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-300 font-medium">
                    {item.category}
                  </td>
                  <td className="py-3.5 px-4 text-neutral-300">
                    {item.client}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      {item.metrics?.map((m, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-neutral-900 text-emerald-400 font-bold text-[10px]">
                          {m.value}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.isActive
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-neutral-800 text-neutral-500"
                      }`}
                    >
                      {item.isActive ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                        title="Edit Case Study"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                        title="Delete Case Study"
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">
                {editingItem ? "Edit Case Study" : "Add New Case Study"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Case Study Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ApexTrader: High-Frequency WealthTech Platform"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NordicFin Tech (Zurich)"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
                  >
                    <option value="SaaS">SaaS</option>
                    <option value="AI">AI & Machine Learning</option>
                    <option value="Web">Web Application</option>
                    <option value="Mobile">Mobile (iOS / Android)</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="UI/UX">UI/UX Product Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Short Description
                </label>
                <input
                  type="text"
                  placeholder="One sentence summary for portfolio card preview..."
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  The Client Challenge
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the architectural bottleneck or business challenge..."
                  value={formData.challenge}
                  onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Our Engineering Solution
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the technical solution built..."
                  value={formData.solution}
                  onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Measurable Business Impact
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the results, conversion boost, latency drop, or revenue..."
                  value={formData.result}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Metric 1 (Value / Label)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 10x"
                      value={metric1Value}
                      onChange={(e) => setMetric1Value(e.target.value)}
                      className="w-1/2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Throughput"
                      value={metric1Label}
                      onChange={(e) => setMetric1Label(e.target.value)}
                      className="w-1/2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Metric 2 (Value / Label)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 99.99%"
                      value={metric2Value}
                      onChange={(e) => setMetric2Value(e.target.value)}
                      className="w-1/2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Uptime"
                      value={metric2Label}
                      onChange={(e) => setMetric2Label(e.target.value)}
                      className="w-1/2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Technologies (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="React, Next.js, Go, PostgreSQL, Redis, Kubernetes"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded bg-neutral-900 border-neutral-800 text-white focus:ring-0"
                  />
                  <span>Published on Public Site</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded bg-neutral-900 border-neutral-800 text-white focus:ring-0"
                  />
                  <span>Show on Homepage</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-900 text-neutral-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : editingItem ? "Update Case Study" : "Create Case Study"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
