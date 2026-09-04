import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Service } from "../../types";
import { api } from "../../services/api";
import { DynamicIcon } from "../../components/common/DynamicIcon";
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  X,
  Search,
} from "lucide-react";

export const AdminServicesManager: React.FC = () => {
  const { data, refreshData, showToast } = useApp();
  const services = data?.services || [];

  const [editingItem, setEditingItem] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const defaultFormState: Partial<Service> = {
    name: "",
    slug: "",
    icon: "Globe",
    shortDescription: "",
    fullDescription: "",
    features: ["Custom UI Engineering", "High Performance Architecture", "Automated Testing"],
    technologies: ["React", "TypeScript", "Node.js"],
    benefits: ["Faster time to market", "Reduced infrastructure cost"],
    process: ["Discovery", "Architecture", "Build", "Deploy"],
    isActive: true,
    displayOrder: services.length + 1,
  };

  const [formData, setFormData] = useState<Partial<Service>>(defaultFormState);
  const [featuresInput, setFeaturesInput] = useState("");
  const [techInput, setTechInput] = useState("");

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData(defaultFormState);
    setFeaturesInput((defaultFormState.features || []).join("\n"));
    setTechInput((defaultFormState.technologies || []).join(", "));
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Service) => {
    setEditingItem(item);
    setFormData(item);
    setFeaturesInput(item.features.join("\n"));
    setTechInput(item.technologies.join(", "));
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the service "${name}"?`)) {
      return;
    }
    try {
      await api.deleteService(id);
      showToast("Service deleted successfully.", "success");
      await refreshData();
    } catch (err: any) {
      showToast(err.message || "Failed to delete service.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showToast("Please provide a service name.", "error");
      return;
    }

    const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const cleanedFeatures = featuresInput.split("\n").map((f) => f.trim()).filter(Boolean);
    const cleanedTech = techInput.split(",").map((t) => t.trim()).filter(Boolean);

    const payload = {
      ...formData,
      slug,
      features: cleanedFeatures,
      technologies: cleanedTech,
    };

    try {
      setIsSaving(true);
      if (editingItem) {
        await api.updateService(editingItem.id, payload);
        showToast("Service updated successfully!", "success");
      } else {
        await api.createService(payload as any);
        showToast("New service added successfully!", "success");
      }
      setIsModalOpen(false);
      await refreshData();
    } catch (err: any) {
      showToast(err.message || "Failed to save service.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = services.filter((s) => {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.shortDescription.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-neutral-300" />
            <span>Services & Engineering Capabilities CMS</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Manage your service offerings, technical feature lists, technology tags, and display order.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
        />
      </div>

      {/* Services Table */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider bg-neutral-900/40">
                <th className="py-3.5 px-4">Service & Icon</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Technologies</th>
                <th className="py-3.5 px-4">Features</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {filtered.map((service) => (
                <tr key={service.id} className="hover:bg-neutral-900/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-900 text-neutral-200 flex items-center justify-center shrink-0 border border-neutral-800">
                        <DynamicIcon name={service.icon} size={16} />
                      </div>
                      <div>
                        <span className="font-bold text-white block">{service.name}</span>
                        <span className="text-[11px] text-neutral-400 block line-clamp-1 max-w-xs">
                          {service.shortDescription}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-neutral-400">
                    {service.slug}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {service.technologies.slice(0, 3).map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 text-[10px]">
                          {t}
                        </span>
                      ))}
                      {service.technologies.length > 3 && (
                        <span className="text-[10px] text-neutral-500">+{service.technologies.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-400">
                    {service.features.length} items
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        service.isActive
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-neutral-800 text-neutral-500"
                      }`}
                    >
                      {service.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(service)}
                        className="p-1.5 rounded-lg bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                        title="Edit Service"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id, service.name)}
                        className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                        title="Delete Service"
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
                {editingItem ? "Edit Service" : "Add New Service"}
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
                    Service Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AI Agents & Machine Learning"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Icon Identifier (Lucide icon name)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Brain, Globe, Smartphone, Cloud, Layers"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Short Description (Card preview)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise-grade autonomous agents and custom LLM fine-tuning."
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Full Detailed Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Comprehensive explanation of what this service delivers..."
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Core Technologies (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next.js, Node.js, TypeScript, Docker, Redis"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Key Features / Deliverables (One per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Autonomous Multi-Agent Pipelines&#10;Vector Embeddings & Hybrid Search&#10;Enterprise Role-Based Access"
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white font-mono focus:outline-none focus:border-white"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded bg-neutral-900 border-neutral-800 text-white focus:ring-0"
                  />
                  <span>Active & Visible on Public Site</span>
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
                  {isSaving ? "Saving..." : editingItem ? "Update Service" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
