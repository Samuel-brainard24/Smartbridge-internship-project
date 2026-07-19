import React, { useState, useEffect } from "react";
import { CheckSquare, AlertCircle, X, Bell } from "lucide-react";
import Auth from "./components/Auth";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ComplaintForm from "./components/ComplaintForm";
import ComplaintHistory from "./components/ComplaintHistory";
import ComplaintDetail from "./components/ComplaintDetail";
import AdminUsers from "./components/AdminUsers";
import AdminCategories from "./components/AdminCategories";
import AdminLogs from "./components/AdminLogs";
import Reports from "./components/Reports";
import Profile from "./components/Profile";
import { User, Admin, Notification } from "./types";
import { notificationApi } from "./api";

export default function App() {
  const [user, setUser] = useState<User | Admin | null>(null);
  const [role, setRole] = useState<"user" | "admin" | null>(null);
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  // Shell Layout Layout states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Toast Notification states
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // 1. Session Recovery on Mount
  useEffect(() => {
    const savedUser = localStorage.getItem("cms_session_user");
    const savedRole = localStorage.getItem("cms_session_role");
    const savedTheme = localStorage.getItem("cms_theme_dark");

    if (savedUser && savedRole) {
      setUser(JSON.parse(savedUser));
      setRole(savedRole as "user" | "admin");
    }

    if (savedTheme === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // 2. Real-time Notifications Polling (for citizen notifications module)
  useEffect(() => {
    if (!user || role !== "user") return;

    async function loadNotifications() {
      try {
        const list = await notificationApi.list(user.id);
        setNotifications(list);
      } catch (e) {
        console.error("Failed to sync notifications", e);
      }
    }

    loadNotifications();
    const interval = setInterval(loadNotifications, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [user?.id, role]);

  const handleLoginSuccess = (loginUser: User | Admin, loginRole: "user" | "admin") => {
    setUser(loginUser);
    setRole(loginRole);
    setCurrentView("dashboard");
    setSelectedComplaintId(null);
    localStorage.setItem("cms_session_user", JSON.stringify(loginUser));
    localStorage.setItem("cms_session_role", loginRole);
  };

  const handleLogout = () => {
    setUser(null);
    setRole(null);
    setCurrentView("dashboard");
    setSelectedComplaintId(null);
    setNotifications([]);
    localStorage.removeItem("cms_session_user");
    localStorage.removeItem("cms_session_role");
    showToast("Signed out successfully", "success");
  };

  const handleProfileUpdate = (updatedUser: User | Admin) => {
    setUser(updatedUser);
    localStorage.setItem("cms_session_user", JSON.stringify(updatedUser));
  };

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem("cms_theme_dark", String(nextDark));
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Toast Trigger Helper
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    // Auto dismissal
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Notification Operations
  const handleMarkRead = async (id: number) => {
    if (!user) return;
    try {
      await notificationApi.markAsRead(id, user.id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await notificationApi.readAll(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      showToast("All notifications marked as read", "success");
    } catch (e) {
      console.error(e);
    }
  };

  const selectComplaintHandler = (id: string) => {
    setSelectedComplaintId(id);
    setCurrentView("complaint-detail");
  };

  // Switch Navigator for Body Panels
  const renderView = () => {
    if (currentView === "complaint-detail" && selectedComplaintId) {
      return (
        <ComplaintDetail
          complaintId={selectedComplaintId}
          userId={user!.id}
          role={role!}
          onBack={() => {
            setSelectedComplaintId(null);
            setCurrentView(role === "admin" ? "complaint-history" : "dashboard");
          }}
          onShowToast={showToast}
        />
      );
    }

    switch (currentView) {
      case "dashboard":
        return (
          <Dashboard
            user={user!}
            role={role!}
            onViewChange={setCurrentView}
            onSelectComplaint={selectComplaintHandler}
            onShowToast={showToast}
          />
        );
      case "register-complaint":
        return (
          <ComplaintForm
            userId={user!.id}
            onViewChange={setCurrentView}
            onSelectComplaint={selectComplaintHandler}
            onShowToast={showToast}
          />
        );
      case "complaint-history":
        return (
          <ComplaintHistory
            userId={user!.id}
            role={role!}
            onSelectComplaint={selectComplaintHandler}
            onShowToast={showToast}
          />
        );
      case "admin-users":
        return <AdminUsers adminId={user!.id} onShowToast={showToast} />;
      case "admin-categories":
        return <AdminCategories adminId={user!.id} onShowToast={showToast} />;
      case "admin-reports":
        return <Reports onShowToast={showToast} />;
      case "admin-logs":
        return <AdminLogs onShowToast={showToast} />;
      case "profile":
        return (
          <Profile
            user={user!}
            role={role!}
            onProfileUpdate={handleProfileUpdate}
            onShowToast={showToast}
          />
        );
      default:
        return (
          <div className="text-center py-12">
            <h3 className="font-display text-lg font-bold">Route not resolved</h3>
            <p className="text-xs text-slate-500">The selected view is missing.</p>
          </div>
        );
    }
  };

  // Render Login flow if unauthenticated
  if (!user || !role) {
    return (
      <div className={`${darkMode ? "dark" : ""}`}>
        <Auth onLoginSuccess={handleLoginSuccess} onShowToast={showToast} />
        {/* Unauthenticated Toast layer */}
        {toast && (
          <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs text-white shadow-xl dark:bg-slate-800 animate-bounce">
            <AlertCircle className={`h-4.5 w-4.5 ${toast.type === "success" ? "text-emerald-400" : "text-rose-400"}`} />
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:text-slate-300">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100 ${darkMode ? "dark" : ""}`}>
      
      {/* Top Header Navigation */}
      <Header
        user={user}
        role={role}
        notifications={notifications}
        darkMode={darkMode}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
        toggleDarkMode={toggleDarkMode}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Side Navigation panel */}
      <Sidebar
        role={role}
        currentView={currentView}
        onViewChange={(v) => {
          setSelectedComplaintId(null);
          setCurrentView(v);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Panel Content Container */}
      <main className="md:pl-64 pt-6 pb-12 px-4 md:px-8 max-w-7xl mx-auto transition-all">
        {renderView()}
      </main>

      {/* Global Success / Error Toast notification banner */}
      {toast && (
        <div 
          id="global-toast-notification"
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-xs text-white shadow-2xl transition-all duration-300 transform scale-100 dark:border dark:border-slate-800 ${
            toast.type === "success" 
              ? "bg-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300" 
              : "bg-rose-600 dark:bg-rose-950/80 dark:text-rose-300"
          } no-print`}
        >
          <Bell className="h-4 w-4 shrink-0 animate-swing" />
          <span className="font-semibold">{toast.message}</span>
          <button 
            onClick={() => setToast(null)} 
            className="ml-3 rounded-md p-0.5 hover:bg-white/10"
            title="Dismiss Notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
