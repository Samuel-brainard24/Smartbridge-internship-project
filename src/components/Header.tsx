import React, { useState } from "react";
import { Bell, Moon, Sun, User, LogOut, Menu, X, CheckSquare, MessageSquare } from "lucide-react";
import { User as UserType, Admin as AdminType, Notification } from "../types";

interface HeaderProps {
  user: UserType | AdminType;
  role: "user" | "admin";
  notifications: Notification[];
  darkMode: boolean;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  toggleDarkMode: () => void;
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  toggleSidebar: () => void;
}

export default function Header({
  user,
  role,
  notifications,
  darkMode,
  onViewChange,
  onLogout,
  toggleDarkMode,
  onMarkRead,
  onMarkAllRead,
  toggleSidebar,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header id="app-header" className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 no-print">
      {/* Left side: Mobile menu toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-sidebar-toggle"
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden"
          title="Toggle Navigation Menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white md:text-lg">
              CMS Portal
            </h1>
            <p className="hidden text-[10px] text-slate-500 dark:text-slate-400 sm:block">
              Complaint Management & tracking
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Utilities */}
      <div className="flex items-center gap-2">
        {/* Dark Mode Toggle */}
        <button
          id="dark-mode-toggle"
          onClick={toggleDarkMode}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications Dropdown */}
        {role === "user" && (
          <div className="relative">
            <button
              id="notifications-dropdown-toggle"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserDropdown(false);
              }}
              className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white py-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in slide-in-from-top-3 duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 pb-2 dark:border-slate-800">
                  <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => {
                        onMarkAllRead();
                        setShowNotifications(false);
                      }}
                      className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-slate-400 dark:text-slate-500">
                      <Bell className="h-8 w-8 stroke-[1.5] mb-1.5" />
                      <p className="text-xs">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`flex gap-2.5 border-b border-slate-50 p-3 last:border-0 hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/50 ${
                          !n.is_read ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
                        }`}
                      >
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                          <MessageSquare className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-700 dark:text-slate-300">
                            {n.message}
                          </p>
                          <span className="mt-1 block text-[10px] text-slate-400 dark:text-slate-500">
                            {new Date(n.created_at).toLocaleString()}
                          </span>
                        </div>
                        {!n.is_read && (
                          <button
                            onClick={() => onMarkRead(n.id)}
                            className="text-[10px] font-semibold text-blue-600 hover:underline dark:text-blue-400 shrink-0 self-center"
                          >
                            Read
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Account Menu */}
        <div className="relative">
          <button
            id="user-profile-menu-toggle"
            onClick={() => {
              setShowUserDropdown(!showUserDropdown);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {user.profile_pic ? (
              <img
                src={user.profile_pic}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-sm font-semibold text-white">
                {user.name.substring(0, 1).toUpperCase()}
              </div>
            )}
            <span className="hidden text-xs font-semibold text-slate-700 dark:text-slate-300 sm:block">
              {user.name}
            </span>
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {user.email}
                </p>
                <span className="mt-1.5 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  {role}
                </span>
              </div>

              <button
                id="menu-nav-profile"
                onClick={() => {
                  onViewChange("profile");
                  setShowUserDropdown(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <User className="h-4 w-4 text-slate-400" />
                My Profile
              </button>

              <button
                id="menu-logout-button"
                onClick={() => {
                  onLogout();
                  setShowUserDropdown(false);
                }}
                className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-slate-800 dark:text-rose-400 dark:hover:bg-rose-955/20"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
