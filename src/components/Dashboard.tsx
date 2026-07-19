import React, { useEffect, useState } from "react";
import { 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  FileText, 
  Users, 
  Star, 
  PlusCircle, 
  ChevronRight, 
  Info,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { User, Admin, Complaint, ComplaintCategory } from "../types";
import { reportApi, complaintApi, categoryApi } from "../api";

interface DashboardProps {
  user: User | Admin;
  role: "user" | "admin";
  onViewChange: (view: string) => void;
  onSelectComplaint: (id: string) => void;
  onShowToast: (msg: string, type: "success" | "error") => void;
}

export default function Dashboard({
  user,
  role,
  onViewChange,
  onSelectComplaint,
  onShowToast,
}: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Load report statistics
        const statsData = await reportApi.getStats();
        setStats(statsData);

        // Load complaints
        const complaintsData = await complaintApi.list({
          userId: role === "user" ? user.id : undefined,
          role: role,
        });
        setRecentComplaints(complaintsData.slice(0, 5)); // Show top 5 recent

        // Load categories
        const cats = await categoryApi.list();
        setCategories(cats);
      } catch (err: any) {
        onShowToast(err.message || "Failed to load dashboard data", "error");
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user.id, role]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-800" />
      </div>
    );
  }

  const summary = stats?.summary || { total: 0, pending: 0, inProgress: 0, resolved: 0, closed: 0, usersCount: 0, averageRating: "0.0" };
  const priorityBreakdown = stats?.priorityBreakdown || { low: 0, medium: 0, high: 0, critical: 0 };
  const categoryBreakdown = stats?.categoryBreakdown || [];
  const monthlyReport = stats?.monthlyReport || [];

  // Priorities badge styles
  const getPriorityStyle = (p: string) => {
    switch (p) {
      case "critical": return "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900";
      case "high": return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900";
      case "medium": return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900";
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700";
    }
  };

  // Status badge styles
  const getStatusStyle = (s: string) => {
    switch (s) {
      case "pending": return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/50";
      case "in_progress": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50";
      case "resolved": return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50";
      case "closed": return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/30 dark:text-slate-400 dark:border-slate-700/50";
      default: return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  // Helper to map category id to name
  const getCategoryName = (id: number) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : "Other";
  };

  // Compute SVG parameters for charts
  const maxMonthlyVal = Math.max(...monthlyReport.map((m: any) => m.total), 5);
  const maxCatVal = Math.max(...categoryBreakdown.map((c: any) => c.count), 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 text-white shadow-lg shadow-blue-500/15 dark:from-blue-800 dark:via-blue-900 dark:to-slate-900">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold md:text-2xl">
              Hello, {user.name}!
            </h2>
            <p className="mt-1 text-xs text-blue-100 dark:text-slate-300">
              {role === "admin" 
                ? "Welcome back to the administrator hub. Real-time platform states and complaint timelines are active."
                : "Easily register complaints, track resolution timelines, and give feedback to administrators."}
            </p>
          </div>
          {role === "user" && (
            <button
              id="dash-quick-file-btn"
              onClick={() => onViewChange("register-complaint")}
              className="flex items-center justify-center gap-1.5 self-start rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-blue-600 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md"
            >
              <PlusCircle className="h-4.5 w-4.5" />
              File New Complaint
            </button>
          )}
        </div>
        {/* Background decorative circles */}
        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute right-20 top-2 h-20 w-20 rounded-full bg-white/5" />
      </div>

      {/* Numerical Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Pending */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              {summary.pending}
            </span>
            <p className="mt-1 text-[10px] text-slate-400">Awaiting assignment</p>
          </div>
        </div>

        {/* Card 2: In Progress */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">In Progress</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              {summary.inProgress}
            </span>
            <p className="mt-1 text-[10px] text-slate-400">Under investigation</p>
          </div>
        </div>

        {/* Card 3: Resolved */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Resolved</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              {summary.resolved + (summary.closed || 0)}
            </span>
            <p className="mt-1 text-[10px] text-slate-400">Successfully handled</p>
          </div>
        </div>

        {/* Card 4: Action/User metrics */}
        {role === "admin" ? (
          <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Satisfaction</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400">
                <Star className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                {summary.averageRating}
              </span>
              <p className="mt-1 text-[10px] text-slate-400">Avg complaint feedback rating</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Filed</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                {summary.total}
              </span>
              <p className="mt-1 text-[10px] text-slate-400">Your total complaints filed</p>
            </div>
          </div>
        )}
      </div>

      {/* Admin Visual Reports section */}
      {role === "admin" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Trend area chart */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  Complaint Intake Trend
                </h3>
                <p className="text-[10px] text-slate-400">Monthly breakdown of registered vs resolved</p>
              </div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">6-Month View</span>
            </div>

            {/* Custom SVG Line Area Chart */}
            <div className="mt-6 flex h-48 w-full items-end">
              <svg className="h-full w-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Gridlines */}
                <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" className="dark:stroke-slate-800" strokeWidth="1" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" className="dark:stroke-slate-800" strokeWidth="1" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" className="dark:stroke-slate-800" strokeWidth="1" />
                <line x1="0" y1="190" x2="500" y2="190" stroke="#e2e8f0" className="dark:stroke-slate-800" strokeWidth="1.5" />

                {/* SVG Area Paths */}
                {monthlyReport.length > 1 && (() => {
                  const points = monthlyReport.map((m: any, idx: number) => {
                    const x = (idx / (monthlyReport.length - 1)) * 480 + 10;
                    const y = 190 - (m.total / maxMonthlyVal) * 150;
                    return `${x},${y}`;
                  });
                  const areaPath = `M 10,190 L ${points.join(" L ")} L 490,190 Z`;
                  const linePath = `M ${points.join(" L ")}`;
                  return (
                    <>
                      <path d={areaPath} fill="url(#gradient-area)" />
                      <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
                      {/* Dots */}
                      {monthlyReport.map((m: any, idx: number) => {
                        const x = (idx / (monthlyReport.length - 1)) * 480 + 10;
                        const y = 190 - (m.total / maxMonthlyVal) * 150;
                        return (
                          <g key={idx} className="group cursor-pointer">
                            <circle cx={x} cy={y} r="5" fill="#ffffff" stroke="#2563eb" strokeWidth="3" />
                            <circle cx={x} cy={y} r="9" fill="#2563eb" className="opacity-0 group-hover:opacity-20 transition-opacity" />
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>
            {/* Chart X Axis Labels */}
            <div className="mt-3 flex justify-between px-2">
              {monthlyReport.map((m: any, idx: number) => (
                <span key={idx} className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  {m.monthLabel.split(" ")[0]}
                </span>
              ))}
            </div>
          </div>

          {/* Category distribution bar chart */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h3 className="font-display text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Category Distribution
              </h3>
              <p className="text-[10px] text-slate-400">Distribution of registered complaints by category</p>
            </div>

            <div className="mt-6 space-y-4">
              {categoryBreakdown.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">No category data available</p>
              ) : (
                categoryBreakdown.map((cat: any, idx: number) => {
                  const percent = cat.count > 0 ? (cat.count / summary.total) * 100 : 0;
                  return (
                    <div key={cat.categoryId} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {cat.categoryName}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {cat.count} ({Math.round(percent)}%)
                        </span>
                      </div>
                      <div className="relative h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                        <div 
                          className="h-2 rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
                          style={{ width: `${Math.max(percent, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity / Complaints section */}
      <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-50 pb-3 dark:border-slate-800/60">
          <div>
            <h3 className="font-display text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              {role === "admin" ? "Recent Platform Complaints" : "Your Recent Complaints"}
            </h3>
            <p className="text-[10px] text-slate-400">
              {role === "admin" ? "Latest submissions requiring review or follow-up" : "Track status of your most recent filings"}
            </p>
          </div>
          <button
            id="dash-view-all-link"
            onClick={() => onViewChange("complaint-history")}
            className="flex items-center gap-0.5 text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/50">
          {recentComplaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500">
              <Layers className="h-10 w-10 mb-2 stroke-[1.2]" />
              <p className="text-xs">No complaints registered yet</p>
            </div>
          ) : (
            recentComplaints.map((c) => (
              <div 
                key={c.id} 
                onClick={() => onSelectComplaint(c.id)}
                className="group flex flex-col md:flex-row md:items-center justify-between gap-3 py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 cursor-pointer rounded-lg px-2 -mx-2 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    <span className="text-[10px] font-bold">CMP</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400">
                        {c.id}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getPriorityStyle(c.priority)}`}>
                        {c.priority}
                      </span>
                    </div>
                    <h4 className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {c.title}
                    </h4>
                    <p className="mt-0.5 text-[10px] text-slate-400 line-clamp-1 sm:text-[11px]">
                      {getCategoryName(c.category_id)} • Registered on {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                  <span className={`inline-block rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${getStatusStyle(c.status)}`}>
                    {c.status.replace("_", " ")}
                  </span>
                  <div className="hidden h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-slate-800 dark:group-hover:bg-slate-700 sm:flex">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
