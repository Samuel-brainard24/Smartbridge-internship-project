import React, { useEffect, useState } from "react";
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, Inbox, Eye } from "lucide-react";
import { Complaint, ComplaintCategory } from "../types";
import { complaintApi, categoryApi } from "../api";

interface ComplaintHistoryProps {
  userId: number;
  role: "user" | "admin";
  onSelectComplaint: (id: string) => void;
  onShowToast: (msg: string, type: "success" | "error") => void;
}

export default function ComplaintHistory({
  userId,
  role,
  onSelectComplaint,
  onShowToast,
}: ComplaintHistoryProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  async function loadData() {
    try {
      setLoading(true);
      const cats = await categoryApi.list();
      setCategories(cats);

      const list = await complaintApi.list({
        userId: role === "user" ? userId : undefined,
        role,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        categoryId: categoryFilter || undefined,
        priority: priorityFilter || undefined,
      });
      setComplaints(list);
      setCurrentPage(1); // Reset to page 1 on search
    } catch (err: any) {
      onShowToast(err.message || "Failed to retrieve complaints data", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [statusFilter, priorityFilter, categoryFilter]); // Auto reload on dropdown selection

  // Trigger manual search button
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case "critical": return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50";
      case "high": return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50";
      case "medium": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50";
      default: return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    }
  };

  const getStatusStyle = (s: string) => {
    switch (s) {
      case "pending": return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/50";
      case "in_progress": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50";
      case "resolved": return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50";
      case "closed": return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/30 dark:text-slate-400 dark:border-slate-700/50";
      default: return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const getCategoryName = (id: number) => {
    return categories.find((c) => c.id === id)?.name || "Other";
  };

  // Pagination Math
  const totalPages = Math.ceil(complaints.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentComplaints = complaints.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            {role === "admin" ? "Complaint Inbox" : "My Complaint History"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {role === "admin" 
              ? "View and manage all user-submitted complaints for the platform." 
              : "Track progress, check timeline logs, and provide feedback on your active files."}
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center justify-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Advanced Filter Bar */}
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              id="search-input-box"
              type="text"
              placeholder="Search by ID, title, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-xs font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex lg:items-center">
            {/* Status Filter */}
            <select
              id="filter-status-dropdown"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            {/* Priority Filter */}
            <select
              id="filter-priority-dropdown"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            {/* Category Filter */}
            <select
              id="filter-category-dropdown"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <button
              id="filter-search-btn"
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-800" />
            <p className="mt-2 text-xs text-slate-400">Loading complaints database...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
            <Inbox className="h-12 w-12 stroke-[1.2] mb-3 text-slate-300" />
            <h4 className="font-display text-sm font-semibold text-slate-700 dark:text-slate-300">
              No matching records found
            </h4>
            <p className="mt-1 text-xs text-slate-400">
              Try adjusting your filter terms or keywords.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-950/40">
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider">Complaint ID</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider">Title</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider">Priority</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider">Filing Date</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {currentComplaints.map((c) => (
                  <tr 
                    key={c.id} 
                    onClick={() => onSelectComplaint(c.id)}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 cursor-pointer transition-all"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {c.id}
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {c.title}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-400 line-clamp-1 max-w-sm">
                          {c.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                      {getCategoryName(c.category_id)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${getPriorityStyle(c.priority)}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold capitalize ${getStatusStyle(c.status)}`}>
                        {c.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectComplaint(c.id);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginated Footer */}
        {complaints.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-950/20">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-800 dark:text-slate-200">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {Math.min(indexOfLastItem, complaints.length)}
              </span>{" "}
              of <span className="font-bold text-slate-800 dark:text-slate-200">{complaints.length}</span> complaints
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
