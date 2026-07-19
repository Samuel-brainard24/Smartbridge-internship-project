import React, { useEffect, useState } from "react";
import { ScrollText, RefreshCw, Activity, Search } from "lucide-react";
import { AdminActivityLog } from "../types";
import { adminApi } from "../api";

interface AdminLogsProps {
  onShowToast: (msg: string, type: "success" | "error") => void;
}

export default function AdminLogs({ onShowToast }: AdminLogsProps) {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  async function loadLogs() {
    try {
      setLoading(true);
      const list = await adminApi.getLogs();
      setLogs(list);
    } catch (err: any) {
      onShowToast(err.message || "Failed to load audit logs", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  const getAdminLabel = (id: number) => {
    if (id === 1) return "Super Admin";
    if (id === 2) return "Support Specialist";
    return `Admin #${id}`;
  };

  const getActionColor = (act: string) => {
    switch (act) {
      case "assigned_complaint": return "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400";
      case "resolved_complaint": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400";
      case "status_change": return "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400";
      case "create_category": return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400";
      default: return "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const filteredLogs = logs.filter((log) => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getAdminLabel(log.admin_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            System Activity Logs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit logs mapping administrative updates, complaint routing changes, and system activities.
          </p>
        </div>
        <button
          onClick={loadLogs}
          className="flex items-center justify-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Audit Search bar */}
      <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            id="logs-search-input"
            type="text"
            placeholder="Filter logs by action, targeted complaint, or specialist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-800" />
            <p className="mt-2 text-xs text-slate-400">Loading system audits...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
            <ScrollText className="h-10 w-10 stroke-[1.2] mb-2 text-slate-300" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No audits found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 font-bold">
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider">Log ID</th>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider">Timestamp</th>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider">Specialist</th>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider">Action Type</th>
                  <th className="px-5 py-3 text-[10px] uppercase tracking-wider">Activity Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                    <td className="px-5 py-3 font-mono text-[11px] font-bold text-slate-500">
                      #{String(log.id).padStart(4, "0")}
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-700 dark:text-slate-200">
                      {getAdminLabel(log.admin_id)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getActionColor(log.action)}`}>
                        {log.action.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                      {log.target}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
