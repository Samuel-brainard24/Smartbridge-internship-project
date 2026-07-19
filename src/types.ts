export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  phone: string;
  address: string;
  profile_pic?: string; // base64 string
  status: 'active' | 'suspended';
  created_at: string;
}

export interface Admin {
  id: number;
  name: string;
  email: string;
  password?: string;
  profile_pic?: string; // base64 string
  role: 'superadmin' | 'moderator' | 'support';
  created_at: string;
}

export interface ComplaintCategory {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Complaint {
  id: string; // CMP-YYYY-XXXX
  user_id: number;
  category_id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  image_url?: string; // base64 representation or path
  assigned_to?: number; // Admin ID
  rating?: number; // 1 to 5
  feedback?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplaintTimeline {
  id: number;
  complaint_id: string;
  status: string;
  description: string;
  updated_by_admin?: number;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminActivityLog {
  id: number;
  admin_id: number;
  action: string;
  target: string;
  created_at: string;
}

export interface DatabaseState {
  users: User[];
  admins: Admin[];
  complaint_categories: ComplaintCategory[];
  complaints: Complaint[];
  complaint_timeline: ComplaintTimeline[];
  notifications: Notification[];
  admin_activity_logs: AdminActivityLog[];
}
