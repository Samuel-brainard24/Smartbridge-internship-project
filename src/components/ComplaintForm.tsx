import React, { useState, useEffect, useRef } from "react";
import { Upload, X, HelpCircle, FileText, CheckCircle2 } from "lucide-react";
import { ComplaintCategory } from "../types";
import { categoryApi, complaintApi } from "../api";

interface ComplaintFormProps {
  userId: number;
  onViewChange: (view: string) => void;
  onSelectComplaint: (id: string) => void;
  onShowToast: (msg: string, type: "success" | "error") => void;
}

export default function ComplaintForm({
  userId,
  onViewChange,
  onSelectComplaint,
  onShowToast,
}: ComplaintFormProps) {
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const list = await categoryApi.list();
        setCategories(list);
        if (list.length > 0) {
          setCategoryId(String(list[0].id));
        }
      } catch (err: any) {
        onShowToast(err.message || "Failed to load complaint categories", "error");
      }
    }
    loadCategories();
  }, []);

  // Handle image conversion to Base64
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      onShowToast("Only image files are supported as attachments", "error");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      onShowToast("Image size must be smaller than 2MB", "error");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setBase64Image(reader.result as string);
    };
    reader.onerror = () => {
      onShowToast("Failed to process attachment file", "error");
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setBase64Image(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      onShowToast("Please enter a descriptive complaint title", "error");
      return;
    }
    if (!categoryId) {
      onShowToast("Please select a relevant category", "error");
      return;
    }
    if (description.trim().length < 15) {
      onShowToast("Description must be at least 15 characters long", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await complaintApi.create({
        userId,
        categoryId: Number(categoryId),
        title,
        description,
        priority,
        image_url: base64Image || undefined,
      });

      onShowToast("Complaint registered successfully!", "success");
      onSelectComplaint(res.complaint.id);
    } catch (err: any) {
      onShowToast(err.message || "Failed to file complaint", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          Register New Complaint
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Please fill out the form below with precise details. An official Complaint Number will be auto-generated.
        </p>
      </div>

      <form 
        id="new-complaint-form" 
        onSubmit={handleSubmit} 
        className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5"
      >
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Complaint Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="complaint-input-title"
            type="text"
            placeholder="e.g. Broken water mains flooding block B sector 4"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            maxLength={100}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 shadow-xs outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            required
          />
        </div>

        {/* Row: Category & Priority */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Complaint Category <span className="text-rose-500">*</span>
            </label>
            <select
              id="complaint-input-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 shadow-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Complaint Priority <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["low", "medium", "high", "critical"].map((p) => (
                <label
                  key={p}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border p-1.5 transition-all ${
                    priority === p
                      ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-400 font-bold"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={p}
                    checked={priority === p}
                    onChange={(e) => setPriority(e.target.value)}
                    disabled={loading}
                    className="sr-only"
                  />
                  <span className="text-[10px] uppercase tracking-wide">{p}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Complaint Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="complaint-input-description"
            rows={5}
            placeholder="Describe the complaint in detail. State the location, history, severity, and any other helpful context to speed up administrative routing..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 shadow-xs outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            required
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Minimum 15 characters</span>
            <span>{description.length} chars</span>
          </div>
        </div>

        {/* File Drag and Drop / Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Attach Image/Evidence (Optional)
          </label>
          
          {!base64Image ? (
            <div
              id="file-dropzone"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-blue-500 bg-blue-50/50 dark:border-blue-400 dark:bg-blue-950/20"
                  : "border-slate-300 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
              />
              <Upload className="h-8 w-8 text-slate-400 dark:text-slate-500 stroke-[1.5] mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Drag and drop your image here, or <span className="text-blue-600 dark:text-blue-400">browse</span>
              </p>
              <p className="mt-1 text-[10px] text-slate-400">
                PNG, JPG, or JPEG up to 2MB.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                  <img
                    src={base64Image}
                    alt="Attachment preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {fileName}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Ready to upload securely
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                disabled={loading}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800/60">
          <button
            type="button"
            onClick={() => onViewChange("dashboard")}
            disabled={loading}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            id="complaint-submit-btn"
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 disabled:bg-slate-300"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              "Submit Complaint"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
