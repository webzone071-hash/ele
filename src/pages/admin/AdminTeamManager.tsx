import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { TeamMember } from "../../types";
import { api } from "../../services/api";
import { Users, Plus, Pencil, Trash2, X, Search } from "lucide-react";

export const AdminTeamManager: React.FC = () => {
  const { data, refreshData, showToast } = useApp();
  const team = data?.team || [];

  const [editingItem, setEditingItem] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const defaultFormState: Partial<TeamMember> = {
    name: "",
    position: "Senior Systems Architect",
    bio: "",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    linkedinUrl: "https://linkedin.com",
    githubUrl: "https://github.com",
    twitterUrl: "https://twitter.com",
    isActive: true,
    displayOrder: team.length + 1,
  };

  const [formData, setFormData] = useState<Partial<TeamMember>>(defaultFormState);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData(defaultFormState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: TeamMember) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Remove team member "${name}"?`)) return;
    try {
      await api.deleteTeamMember(id);
      showToast("Team member removed.", "success");
      await refreshData();
    } catch (err: any) {
      showToast(err.message || "Failed to remove.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.position) {
      showToast("Please provide name and position.", "error");
      return;
    }

    try {
      setIsSaving(true);
      if (editingItem) {
        await api.updateTeamMember(editingItem.id, formData);
        showToast("Team member updated!", "success");
      } else {
        await api.createTeamMember(formData as any);
        showToast("Team member added!", "success");
      }
      setIsModalOpen(false);
      await refreshData();
    } catch (err: any) {
      showToast(err.message || "Failed to save team member.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-neutral-300" />
            <span>Leadership & Engineering Team CMS</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Showcase technical leads, architects, and engineering talent on the About page.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {team.map((member) => (
          <div
            key={member.id}
            className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between"
          >
            <div>
              <div className="aspect-square rounded-xl overflow-hidden bg-neutral-900 mb-4 border border-neutral-800">
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-white text-sm tracking-tight">{member.name}</h3>
              <span className="text-xs font-semibold text-neutral-400 block mb-2">{member.position}</span>
              <p className="text-[11px] text-neutral-500 line-clamp-3 leading-relaxed">{member.bio}</p>
            </div>

            <div className="pt-4 mt-3 border-t border-neutral-900 flex items-center justify-between">
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                  member.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-800 text-neutral-500"
                }`}
              >
                {member.isActive ? "Active" : "Hidden"}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(member)}
                  className="p-1.5 rounded-lg bg-neutral-900 text-neutral-300 hover:text-white"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDelete(member.id, member.name)}
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
                {editingItem ? "Edit Team Member" : "Add Team Member"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Position / Role *</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                  required
                />
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
                <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">Brief Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded bg-neutral-900 border-neutral-800 text-white"
                  />
                  <span>Active & Visible on Public Site</span>
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
                  {isSaving ? "Saving..." : "Save Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
