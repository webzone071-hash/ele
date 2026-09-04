import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Testimonial } from "../../types";
import { api } from "../../services/api";
import { MessageSquareQuote, Plus, Pencil, Trash2, X, Star } from "lucide-react";

export const AdminTestimonialsManager: React.FC = () => {
  const { data, refreshData, showToast } = useApp();
  const testimonials = data?.testimonials || [];

  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const defaultFormState: Partial<Testimonial> = {
    clientName: "",
    position: "Founder & CEO",
    company: "",
    country: "USA",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    quote: "",
    rating: 5,
    isActive: true,
    displayOrder: testimonials.length + 1,
  };

  const [formData, setFormData] = useState<Partial<Testimonial>>(defaultFormState);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData(defaultFormState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Testimonial) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete review from "${name}"?`)) return;
    try {
      await api.deleteTestimonial(id);
      showToast("Testimonial deleted.", "success");
      await refreshData();
    } catch (err: any) {
      showToast(err.message || "Failed to delete.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.quote) {
      showToast("Please provide client name and testimonial quote.", "error");
      return;
    }

    try {
      setIsSaving(true);
      if (editingItem) {
        await api.updateTestimonial(editingItem.id, formData);
        showToast("Testimonial updated!", "success");
      } else {
        await api.createTestimonial(formData as any);
        showToast("Testimonial added!", "success");
      }
      setIsModalOpen(false);
      await refreshData();
    } catch (err: any) {
      showToast(err.message || "Failed to save.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-neutral-300" />
            <span>Client Endorsements & Testimonials CMS</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Manage verified client testimonials, review ratings, country tags, and corporate affiliations.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((test) => (
          <div
            key={test.id}
            className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < test.rating ? "fill-amber-400 text-amber-400" : "text-neutral-700"
                      }`}
                    />
                  ))}
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    test.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-800 text-neutral-500"
                  }`}
                >
                  {test.isActive ? "Published" : "Hidden"}
                </span>
              </div>

              <p className="text-xs text-neutral-300 italic mb-6 leading-relaxed">
                "{test.quote}"
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-900">
              <div className="flex items-center gap-3">
                <img
                  src={test.avatarUrl}
                  alt={test.clientName}
                  className="w-10 h-10 rounded-full object-cover border border-neutral-800"
                />
                <div>
                  <h4 className="font-bold text-xs text-white">{test.clientName}</h4>
                  <span className="text-[11px] text-neutral-400 block">
                    {test.position}, {test.company}
                  </span>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                    {test.country}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(test)}
                  className="p-1.5 rounded-lg bg-neutral-900 text-neutral-300 hover:text-white"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDelete(test.id, test.clientName)}
                  className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white">
                {editingItem ? "Edit Testimonial" : "Add Testimonial"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Client Name *</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Position / Role</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Rating (1 to 5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Client Quote *</label>
                <textarea
                  rows={3}
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                  required
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded bg-neutral-900 border-neutral-800 text-white"
                  />
                  <span>Published on Public Site</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-white text-neutral-950 font-bold text-xs uppercase"
                >
                  {isSaving ? "Saving..." : "Save Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
