import React, { useEffect, useState } from "react";
import { PlusCircle, Tags, ListCollapse, MessageSquare } from "lucide-react";
import { ComplaintCategory } from "../types";
import { categoryApi } from "../api";

interface AdminCategoriesProps {
  adminId: number;
  onShowToast: (msg: string, type: "success" | "error") => void;
}

export default function AdminCategories({ adminId, onShowToast }: AdminCategoriesProps) {
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadCategories() {
    try {
      setLoading(true);
      const list = await categoryApi.list();
      setCategories(list);
    } catch (err: any) {
      onShowToast(err.message || "Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      onShowToast("Please enter a category name", "error");
      return;
    }
    if (!description.trim()) {
      onShowToast("Please enter a category description", "error");
      return;
    }

    try {
      setSubmitting(true);
      await categoryApi.create({ name, description, adminId });
      onShowToast("Category created successfully", "success");
      setName("");
      setDescription("");
      loadCategories(); // reload
    } catch (err: any) {
      onShowToast(err.message || "Failed to create category", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          Complaint Categories
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Set up or modify administrative categories which citizens use to route and file their tickets.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left block (1 col): Create category */}
        <div className="md:col-span-1 rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 h-fit">
          <h3 className="font-display text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4">
            Add New Category
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Category Name <span className="text-rose-500">*</span></label>
              <input
                id="cat-input-name"
                type="text"
                placeholder="e.g. Health & Wellness"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 shadow-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Description <span className="text-rose-500">*</span></label>
              <textarea
                id="cat-input-desc"
                rows={4}
                placeholder="Briefly explain what issues fall under this category..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 shadow-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                required
              />
            </div>

            <button
              id="cat-submit-btn"
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
            >
              {submitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  Add Category
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right block (2 cols): list categories */}
        <div className="md:col-span-2 rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-display text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4">
            Operational Categories
          </h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-800" />
            </div>
          ) : categories.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-6">No categories are currently operational</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {categories.map((cat) => (
                <div 
                  key={cat.id} 
                  className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/20"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    <Tags className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{cat.name}</h4>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {cat.description}
                    </p>
                    <span className="mt-2 block text-[9px] text-slate-400">
                      ID: #{cat.id} • Registered on {new Date(cat.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
