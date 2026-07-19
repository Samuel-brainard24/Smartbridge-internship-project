import React from "react";
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  UserCircle, 
  ClipboardList, 
  Users, 
  Tags, 
  BarChart3, 
  ScrollText,
  ChevronLeft,
  X
} from "lucide-react";

interface SidebarProps {
  role: "user" | "admin";
  currentView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  role,
  currentView,
  onViewChange,
  isOpen,
  onClose,
}: SidebarProps) {
  
  const handleNav = (view: string) => {
    onViewChange(view);
    onClose(); // Close mobile overlay
  };

  const linkClass = (view: string) => {
    const isActive = currentView === view;
    return `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-all ${
      isActive 
        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
    }`;
  };

  return (
    <>
      {/* Mobile Back-drop overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-45 bg-slate-900/40 backdrop-blur-xs md:hidden no-print"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white pt-16 transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } no-print`}
      >
        {/* Mobile close button inside sidebar header */}
        <div className="absolute top-4 right-4 md:hidden">
          <button 
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
          {role === "user" ? (
            <div>
              <p className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                User Hub
              </p>
              <nav className="mt-3 space-y-1">
                <button 
                  id="side-nav-user-dashboard"
                  onClick={() => handleNav("dashboard")} 
                  className={linkClass("dashboard")}
                >
                  <LayoutDashboard className="h-4.5 w-4.5" />
                  Dashboard
                </button>
                <button 
                  id="side-nav-user-register"
                  onClick={() => handleNav("register-complaint")} 
                  className={linkClass("register-complaint")}
                >
                  <PlusCircle className="h-4.5 w-4.5" />
                  File New Complaint
                </button>
                <button 
                  id="side-nav-user-history"
                  onClick={() => handleNav("complaint-history")} 
                  className={linkClass("complaint-history")}
                >
                  <History className="h-4.5 w-4.5" />
                  Complaint History
                </button>
              </nav>
            </div>
          ) : (
            <div>
              <p className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Admin Console
              </p>
              <nav className="mt-3 space-y-1">
                <button 
                  id="side-nav-admin-dashboard"
                  onClick={() => handleNav("dashboard")} 
                  className={linkClass("dashboard")}
                >
                  <LayoutDashboard className="h-4.5 w-4.5" />
                  Admin Dashboard
                </button>
                <button 
                  id="side-nav-admin-complaints"
                  onClick={() => handleNav("complaint-history")} 
                  className={linkClass("complaint-history")}
                >
                  <ClipboardList className="h-4.5 w-4.5" />
                  Complaint Inbox
                </button>
                <button 
                  id="side-nav-admin-users"
                  onClick={() => handleNav("admin-users")} 
                  className={linkClass("admin-users")}
                >
                  <Users className="h-4.5 w-4.5" />
                  Manage Users
                </button>
                <button 
                  id="side-nav-admin-categories"
                  onClick={() => handleNav("admin-categories")} 
                  className={linkClass("admin-categories")}
                >
                  <Tags className="h-4.5 w-4.5" />
                  Categories Manager
                </button>
                <button 
                  id="side-nav-admin-reports"
                  onClick={() => handleNav("admin-reports")} 
                  className={linkClass("admin-reports")}
                >
                  <BarChart3 className="h-4.5 w-4.5" />
                  Analytics & Reports
                </button>
                <button 
                  id="side-nav-admin-logs"
                  onClick={() => handleNav("admin-logs")} 
                  className={linkClass("admin-logs")}
                >
                  <ScrollText className="h-4.5 w-4.5" />
                  System Activity Logs
                </button>
              </nav>
            </div>
          )}

          {/* Settings Section (Common to both) */}
          <div>
            <p className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Personal
            </p>
            <nav className="mt-3 space-y-1">
              <button 
                id="side-nav-profile"
                onClick={() => handleNav("profile")} 
                className={linkClass("profile")}
              >
                <UserCircle className="h-4.5 w-4.5" />
                My Profile
              </button>
            </nav>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/50">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <ScrollText className="h-4 w-4" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-800 dark:text-slate-200">
                v1.0.0 Stable
              </span>
              <span className="block text-[8px] text-slate-400 dark:text-slate-500">
                SmartBridge Project
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
