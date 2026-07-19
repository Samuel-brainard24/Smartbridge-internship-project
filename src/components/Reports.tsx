import React, { useEffect, useState } from "react";
import { Printer, Calendar, FileText, ChevronRight, Activity, Star } from "lucide-react";
import { reportApi } from "../api";

interface ReportsProps {
  onShowToast: (msg: string, type: "success" | "error") => void;
}

export default function Reports({ onShowToast }: ReportsProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await reportApi.getStats();
        setStats(data);
      } catch (err: any) {
        onShowToast(err.message || "Failed to load report analytics", "error");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-800" />
      </div>
    );
  }

  const { summary, priorityBreakdown, categoryBreakdown, monthlyReport } = stats || {};

  return (
    <div className="space-y-6">
      {/* Printable Title Block */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800/60 no-print">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            System Performance Reports & Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Export monthly intakes, category loads, and citizen resolution percentages to paper or PDF files.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
        >
          <Printer className="h-4 w-4" />
          Export to PDF / Print
        </button>
      </div>

      {/* PRINT-ONLY TITLE (Only visible during standard printing) */}
      <div className="hidden print-only text-center space-y-1 pb-6 border-b border-slate-300">
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Online Complaint Registration and Management System
        </h1>
        <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">
          System Intake & Resolution Analytics Report
        </h2>
        <p className="text-xs text-slate-400">
          Report Generated On: {new Date().toLocaleDateString()} • Authorized by: Administrative Core
        </p>
      </div>

      {/* Bento Grid Analytics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Case Folders</span>
          <span className="mt-2 block font-display text-3xl font-bold text-slate-900 dark:text-white">{summary.total}</span>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Pending Actions</span>
          <span className="mt-2 block font-display text-3xl font-bold text-slate-900 dark:text-white text-yellow-600">{summary.pending}</span>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Active Investigation</span>
          <span className="mt-2 block font-display text-3xl font-bold text-slate-900 dark:text-white text-blue-600">{summary.inProgress}</span>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Resolved & Closed</span>
          <span className="mt-2 block font-display text-3xl font-bold text-slate-900 dark:text-white text-emerald-600">
            {summary.resolved + summary.closed}
          </span>
        </div>
      </div>

      {/* Multi Columns */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Intakes Category Table */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-display text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Activity className="h-4.5 w-4.5 text-blue-500" />
            Category Load Distributions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/20">
                  <th className="px-3 py-2 font-bold uppercase tracking-wider">Category</th>
                  <th className="px-3 py-2 font-bold uppercase tracking-wider text-center">Intake Count</th>
                  <th className="px-3 py-2 font-bold uppercase tracking-wider text-right">Percent Allocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {categoryBreakdown.map((cat: any) => {
                  const percent = cat.count > 0 ? (cat.count / summary.total) * 100 : 0;
                  return (
                    <tr key={cat.categoryId}>
                      <td className="px-3 py-2.5 font-semibold text-slate-800 dark:text-slate-200">{cat.categoryName}</td>
                      <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white text-center">{cat.count}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-500 dark:text-slate-400 text-right">{Math.round(percent)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Priority loads */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <FileText className="h-4.5 w-4.5 text-blue-500" />
              Priority Allocations
            </h3>

            <div className="space-y-3.5">
              {[
                { label: "Critical", value: priorityBreakdown.critical, color: "bg-rose-500" },
                { label: "High", value: priorityBreakdown.high, color: "bg-amber-500" },
                { label: "Medium", value: priorityBreakdown.medium, color: "bg-blue-500" },
                { label: "Low", value: priorityBreakdown.low, color: "bg-slate-400" },
              ].map((p) => {
                const percent = p.value > 0 ? (p.value / summary.total) * 100 : 0;
                return (
                  <div key={p.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{p.label} Priority</span>
                      <span className="font-bold text-slate-900 dark:text-white">{p.value} ({Math.round(percent)}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className={`h-2 rounded-full ${p.color}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              Citizen Rating index:
            </span>
            <span className="font-bold text-slate-900 dark:text-white">{summary.averageRating} / 5.0 Stars</span>
          </div>
        </div>
      </div>

      {/* Monthly Summary Ledger */}
      <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-display text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Calendar className="h-4.5 w-4.5 text-blue-500" />
          Intake & Resolution Ledger (6 Months)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/20">
                <th className="px-4 py-2.5 font-bold uppercase tracking-wider">Timeline Month</th>
                <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-center">New Registrations</th>
                <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-center">Total Resolved</th>
                <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-right">Backlog Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {monthlyReport.map((rep: any, idx: number) => {
                const backlog = rep.total > rep.resolved ? rep.total - rep.resolved : 0;
                const backlogRate = rep.total > 0 ? Math.round((backlog / rep.total) * 100) : 0;
                return (
                  <tr key={idx}>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{rep.monthLabel}</td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white text-center">{rep.total}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400 text-center">{rep.resolved}</td>
                    <td className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 text-right">
                      {backlogRate > 0 ? (
                        <span className="text-amber-600 font-bold">{backlogRate}%</span>
                      ) : (
                        <span className="text-emerald-600 font-bold">0%</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
