import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { FiverrService } from "../../types";
import { api } from "../../services/api";
import {
  ShoppingBag,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Star,
  CheckCircle2,
  X,
  Clock,
  Search,
} from "lucide-react";

export const AdminFiverrManager: React.FC = () => {
  const { data, refreshData, showToast } = useApp();
  const fiverrServices = data?.fiverrServices || [];

  const [editingItem, setEditingItem] = useState<FiverrService | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const defaultFormState: Partial<FiverrService> = {
    title: "",
    fiverrUrl: "https://www.fiverr.com",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    shortDescription: "",
    startingPrice: 495,
    rating: 5.0,
    reviewsCount: 48,
    deliveryTimeDays: 7,
    category: "Full Stack Web",
    features: ["Custom Architecture", "Production Deployment", "Full Documentation"],
    isActive: true,
    isFeatured: true,
    displayOrder: fiverrServices.length + 1,
  };

  const [formData, setFormData] = useState<Partial<FiverrService>>(defaultFormState);
  const [featuresInput, setFeaturesInput] = useState("");

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData(defaultFormState);
    setFeaturesInput((defaultFormState.features || []).join("\n"));
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: FiverrService) => {
    setEditingItem(item);
    setFormData(item);
    setFeaturesInput(item.features.join("\n"));
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the Fiverr gig "${title}"?`)) {
      return;
    }
    try {
      await api.deleteFiverrService(id);
      showToast("Fiverr gig deleted successfully.", "success");
      await refreshData();
    } catch (err: any) {
      showToast(err.message || "Failed to delete gig.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.fiverrUrl || !formData.startingPrice) {
      showToast("Please provide title, Fiverr URL, and starting price.", "error");
      return;
    }

    const cleanedFeatures = featuresInput
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      features: cleanedFeatures,
    };

    try {
      setIsSaving(true);
      if (editingItem) {
        await api.updateFiverrService(editingItem.id, payload);
        showToast("Fiverr gig updated successfully!", "success");
      } else {
        await api.createFiverrService(payload as any);
        showToast("New Fiverr gig added successfully!", "success");
      }
      setIsModalOpen(false);
      await refreshData();
    } catch (err: any) {
      showToast(err.message || "Failed to save gig.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = fiverrServices.filter((f) => {
    const q = searchQuery.toLowerCase();
    return (
      f.title.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      f.shortDescription.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <span>Fiverr Marketplace Gigs Manager</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Configure ready-to-order packages, direct Fiverr gig links, starting prices, and ratings shown on homepage & marketplace pages.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Fiverr Gig</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter gigs by title or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
        />
      </div>

      {/* Gigs Table */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider bg-neutral-900/40">
                <th className="py-3.5 px-4">Thumbnail & Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Fiverr Link</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {filtered.map((gig) => (
                <tr key={gig.id} className="hover:bg-neutral-900/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={gig.thumbnail}
                        alt={gig.title}
                        className="w-12 h-9 object-cover rounded-lg border border-neutral-800 shrink-0"
                      />
                      <div className="max-w-xs">
                        <span className="font-bold text-white block truncate">{gig.title}</span>
                        <span className="text-[11px] text-neutral-400 truncate block">
                          {gig.deliveryTimeDays}d delivery • {gig.features.length} features
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-300 font-medium">
                    {gig.category}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    ${gig.startingPrice}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{gig.rating.toFixed(1)}</span>
                      <span className="text-neutral-500 font-normal">({gig.reviewsCount})</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <a
                      href={gig.fiverrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-white inline-flex items-center gap-1 font-mono text-[11px] underline underline-offset-2 max-w-[150px] truncate"
                    >
                      <span>Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          gig.isActive
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-neutral-800 text-neutral-500"
                        }`}
                      >
                        {gig.isActive ? "Active" : "Draft"}
                      </span>
                      {gig.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(gig)}
                        className="p-1.5 rounded-lg bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                        title="Edit Gig"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(gig.id, gig.title)}
                        className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                        title="Delete Gig"
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">
                {editingItem ? "Edit Fiverr Gig" : "Add New Fiverr Gig"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Gig Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full-Stack Web App Development with Next.js & Node"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
                  required
                />
              </div>

              {/* CRITICAL: Dynamic editable Fiverr URL */}
              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-emerald-500/30">
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  Target Fiverr Gig URL (Dynamic External Link) *
                </label>
                <input
                  type="url"
                  placeholder="https://www.fiverr.com/your-username/your-gig-slug"
                  value={formData.fiverrUrl}
                  onChange={(e) => setFormData({ ...formData, fiverrUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                  required
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Whenever you update this URL, the "View Fiverr Gig" button immediately updates on the live website!
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Thumbnail Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Web Development, AI Solutions, Mobile Apps"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Starting Price ($) *
                  </label>
                  <input
                    type="number"
                    value={formData.startingPrice}
                    onChange={(e) => setFormData({ ...formData, startingPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Rating (e.g. 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Reviews Count
                  </label>
                  <input
                    type="number"
                    value={formData.reviewsCount}
                    onChange={(e) => setFormData({ ...formData, reviewsCount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Turnaround Time (Days)
                </label>
                <input
                  type="number"
                  value={formData.deliveryTimeDays}
                  onChange={(e) => setFormData({ ...formData, deliveryTimeDays: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Package Deliverables (One per line)
                </label>
                <textarea
                  rows={3}
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  placeholder="Custom Full-Stack Architecture&#10;Stripe/PayPal Integration&#10;Dockerized Deployment"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white font-mono focus:outline-none focus:border-white"
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
                  <span>Active & Visible on Public Site</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded bg-neutral-900 border-neutral-800 text-white focus:ring-0"
                  />
                  <span>Feature on Homepage ("Ready to Start?")</span>
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
                  {isSaving ? "Saving Gig..." : editingItem ? "Update Gig" : "Create Gig"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
