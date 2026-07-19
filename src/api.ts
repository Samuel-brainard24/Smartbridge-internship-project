import { User, Admin, Complaint, ComplaintCategory, ComplaintTimeline, Notification, AdminActivityLog } from "./types";

const BASE_URL = ""; // Relative paths since it runs on the same server

export async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const authApi = {
  login: (payload: any) => 
    apiRequest<{ message: string; user: User | Admin; role: "user" | "admin" }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  register: (payload: any) => 
    apiRequest<{ message: string; user: User; role: "user" }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateProfile: (payload: any) => 
    apiRequest<{ message: string; user: User | Admin }>("/api/auth/profile", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  changePassword: (payload: any) => 
    apiRequest<{ message: string }>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const complaintApi = {
  list: (params: { userId?: number; role?: "user" | "admin"; search?: string; status?: string; categoryId?: string; priority?: string }) => {
    const q = new URLSearchParams();
    if (params.userId) q.append("userId", String(params.userId));
    if (params.role) q.append("role", params.role);
    if (params.search) q.append("search", params.search);
    if (params.status) q.append("status", params.status);
    if (params.categoryId) q.append("categoryId", params.categoryId);
    if (params.priority) q.append("priority", params.priority);
    return apiRequest<Complaint[]>(`/api/complaints?${q.toString()}`);
  },

  detail: (id: string) => 
    apiRequest<{ complaint: Complaint; timeline: ComplaintTimeline[] }>(`/api/complaints/${id}`),

  create: (payload: { userId: number; categoryId: number; title: string; description: string; priority: string; image_url?: string }) => 
    apiRequest<{ message: string; complaint: Complaint }>("/api/complaints", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateAction: (id: string, payload: { adminId: number; status?: string; assigned_to?: number | null; note: string }) => 
    apiRequest<{ message: string; complaint: Complaint }>(`/api/complaints/${id}/action`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  submitFeedback: (id: string, payload: { rating: number; feedback: string; userId: number }) => 
    apiRequest<{ message: string; complaint: Complaint }>(`/api/complaints/${id}/feedback`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

export const categoryApi = {
  list: () => apiRequest<ComplaintCategory[]>("/api/categories"),
  create: (payload: { name: string; description: string; adminId: number }) => 
    apiRequest<{ message: string; category: ComplaintCategory }>("/api/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const adminApi = {
  listUsers: () => apiRequest<Omit<User, "password">[]>("/api/admin/users"),
  updateUserStatus: (id: number, payload: { status: "active" | "suspended"; adminId: number }) => 
    apiRequest<{ message: string; user: User }>(`/api/admin/users/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  getLogs: () => apiRequest<AdminActivityLog[]>("/api/admin/logs"),
};

export const notificationApi = {
  list: (userId: number) => apiRequest<Notification[]>(`/api/notifications?userId=${userId}`),
  readAll: (userId: number) => 
    apiRequest<{ message: string }>("/api/notifications/read-all", {
      method: "PUT",
      body: JSON.stringify({ userId }),
    }),
  markAsRead: (id: number, userId: number) => 
    apiRequest<{ message: string }>(`/api/notifications/${id}/read`, {
      method: "PUT",
      body: JSON.stringify({ userId }),
    }),
};

export const reportApi = {
  getStats: () => apiRequest<{
    summary: {
      total: number;
      pending: number;
      inProgress: number;
      resolved: number;
      closed: number;
      usersCount: number;
      averageRating: string;
    };
    priorityBreakdown: { low: number; medium: number; high: number; critical: number };
    categoryBreakdown: { categoryId: number; categoryName: string; count: number }[];
    monthlyReport: { monthLabel: string; total: number; resolved: number }[];
  }>("/api/reports/stats"),
};
