import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { ProcessStep } from "../../types";
import { api } from "../../services/api";
import { DynamicIcon } from "../../components/common/DynamicIcon";
import { Repeat, Plus, Pencil, Trash2, X } from "lucide-react";

export const AdminProcessManager: React.FC = () => {
  const { data, refreshData, showToast } = useApp();
  const processSteps = data?.process || [];

  const [editingItem, setEditingItem] = useState<ProcessStep | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const defaultFormState: Partial<ProcessStep> = {
    stepNumber: processSteps.length + 1,
    title: "",
    description: "",
    icon: "Compass",
    isActive: true,
  };

  const [formData, setFormData] = useState<Partial<ProcessStep>>(defaultFormState);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData(defaultFormState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ProcessStep) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete step "${title}"?`)) return;
    try {
      await api.deleteProcessStep(id);
      showToast("Step deleted.", "success");
      await refreshData();
    } catch (err: any) {
      showToast(err.message || "Failed to delete.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      showToast("Please provide a step title.", "error");
      return;
    }

    try {
      setIsSaving(true);
      if (editingItem) {
        await api.updateProcessStep(editingItem.id, formData);
        showToast("Step updated!", "success");
      } else {
        await api.createProcessStep(formData as any);
        showToast("Step added!", "success");
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
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Repeat className="w-5 h-5 text-neutral-300" />
            <span>Development Process & Methodology CMS</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Configure the 7-step engineering progression displayed on the homepage and about page.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Process Step</span>
        </button>
      </div>

      <div className="space-y-3">
        {processSteps.map((step) => (
          <div
            key={step.id}
            className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <span className="w-8 h-8 rounded-lg bg-neutral-900 text-white font-black text-xs flex items-center justify-center border border-neutral-800 shrink-0">
                0{step.stepNumber}
              </span>
              <div className="w-8 h-8 rounded-lg bg-neutral-900 text-neutral-300 flex items-center justify-center shrink-0">
                <DynamicIcon name={step.icon} size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{step.title}</h3>
                <p className="text-xs text-neutral-400 line-clamp-1">{step.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                  step.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-800 text-neutral-500"
                }`}
              >
                {step.isActive ? "Active" : "Hidden"}
              </span>
              <button
                onClick={() => handleOpenEdit(step)}
                className="p-1.5 rounded-lg bg-neutral-900 text-neutral-300 hover:text-white"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(step.id, step.title)}
                className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white">
                {editingItem ? "Edit Step" : "Add Step"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Step Number</label>
                  <input
                    type="number"
                    value={formData.stepNumber}
                    onChange={(e) => setFormData({ ...formData, stepNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Icon Name</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Step Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
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
                  <span>Active & Visible</span>
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
                  {isSaving ? "Saving..." : "Save Step"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
