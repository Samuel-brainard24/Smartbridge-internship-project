import React, { useEffect, useState } from "react";
import { Users, UserMinus, UserCheck, ShieldAlert, Search } from "lucide-react";
import { User } from "../types";
import { adminApi } from "../api";

interface AdminUsersProps {
  adminId: number;
  onShowToast: (msg: string, type: "success" | "error") => void;
}

export default function AdminUsers({ adminId, onShowToast }: AdminUsersProps) {
  const [users, setUsers] = useState<Omit<User, "password">[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      const list = await adminApi.listUsers();
      setUsers(list);
    } catch (err: any) {
      onShowToast(err.message || "Failed to load registered users", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleUserStatus = async (id: number, currentStatus: "active" | "suspended") => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      await adminApi.updateUserStatus(id, { status: nextStatus, adminId });
      onShowToast(`User account status updated to ${nextStatus}`, "success");
      loadUsers(); // reload list
    } catch (err: any) {
      onShowToast(err.message || "Failed to alter account permissions", "error");
    }
  };

  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          Manage Platform Users
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Monitor registration directories, addresses, and restrict or suspend fraudulent accounts.
        </p>
      </div>

      {/* Directory Search */}
      <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            id="user-search-input"
            type="text"
            placeholder="Search users by name, email or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>
      </div>

      {/* Users table */}
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-800" />
            <p className="mt-2 text-xs text-slate-400">Loading user directory...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
            <Users className="h-10 w-10 stroke-[1.2] mb-2 text-slate-300" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No registered users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-950/40">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider">User Details</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider">Contact Details</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider">Physical Address</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider">Join Date</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold dark:bg-blue-950 dark:text-blue-400">
                          {u.name.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{u.name}</p>
                          <span className="text-[10px] text-slate-400">ID: {u.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                      <p className="font-medium">{u.email}</p>
                      <span className="text-[10px] text-slate-400">{u.phone}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={u.address}>
                      {u.address}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${
                        u.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
                          : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400"
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {u.status === "active" ? (
                        <button
                          onClick={() => toggleUserStatus(u.id, u.status)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-950/30 dark:bg-slate-900 dark:text-rose-400"
                          title="Suspend User Account"
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleUserStatus(u.id, u.status)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 dark:border-emerald-950/30 dark:bg-slate-900 dark:text-emerald-400"
                          title="Activate User Account"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          Activate
                        </button>
                      )}
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
