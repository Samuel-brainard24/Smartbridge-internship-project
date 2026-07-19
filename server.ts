import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { DatabaseState, User, Admin, ComplaintCategory, Complaint, ComplaintTimeline, Notification, AdminActivityLog } from "./src/types";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "database.json");

// Middleware to parse JSON and urlencoded requests with size limits (for base64 uploads)
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Helper: Hash password using SHA-256 (built-in, safe, and secure)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Initial Database State (Matching the MySQL database.sql schema exactly)
const INITIAL_DB: DatabaseState = {
  users: [
    {
      id: 1,
      name: "John Doe",
      email: "john@gmail.com",
      password: hashPassword("user123"),
      phone: "9876543210",
      address: "123, Green Valley Apartments, Sector 4, Metro City",
      status: "active",
      created_at: "2026-07-15T10:00:00Z"
    } as any,
    {
      id: 2,
      name: "Sarah Jenkins",
      email: "sarah@gmail.com",
      password: hashPassword("user123"),
      phone: "8765432109",
      address: "A-45, Sunrise Heights, Park Lane, Metro City",
      status: "active",
      created_at: "2026-07-17T09:00:00Z"
    } as any
  ],
  admins: [
    {
      id: 1,
      name: "Super Admin",
      email: "admin@complaints.com",
      password: hashPassword("admin123"),
      role: "superadmin",
      created_at: "2026-07-15T08:00:00Z"
    } as any,
    {
      id: 2,
      name: "Support Specialist",
      email: "support@complaints.com",
      password: hashPassword("admin123"),
      role: "support",
      created_at: "2026-07-15T09:00:00Z"
    } as any
  ],
  complaint_categories: [
    { id: 1, name: "Water Supply", description: "Issues related to pipeline leaks, water shortage, dirty water, or billing discrepancies.", created_at: "2026-07-15T08:00:00Z" },
    { id: 2, name: "Electricity", description: "Power outages, fluctuating voltage, broken streetlights, or dangerous wiring.", created_at: "2026-07-15T08:00:00Z" },
    { id: 3, name: "Roads & Infrastructure", description: "Potholes, broken footpaths, blocked drains, or structural damage to public utilities.", created_at: "2026-07-15T08:00:00Z" },
    { id: 4, name: "Sanitation & Garbage", description: "Garbage accumulation, uncleaned streets, overflowing drains, or public toilets maintenance.", created_at: "2026-07-15T08:00:00Z" },
    { id: 5, name: "Security & Public Safety", description: "Suspicious activities, lack of patrolling, public nuisance, or safety concerns.", created_at: "2026-07-15T08:00:00Z" }
  ],
  complaints: [
    {
      id: "CMP-2026-0001",
      user_id: 1,
      category_id: 1,
      title: "Burst Water Pipeline in Sector 4",
      description: "There is a major burst in the main water supply pipeline near Green Valley block B gate. Hundreds of gallons of clean drinking water are being wasted, and the water pressure in our apartment has dropped to zero.",
      priority: "high",
      status: "resolved",
      assigned_to: 1,
      rating: 5,
      feedback: "Thank you! The municipal team came within 3 hours and successfully repaired the pipeline. Excellent response.",
      created_at: "2026-07-15T10:30:00Z",
      updated_at: "2026-07-15T14:20:00Z"
    },
    {
      id: "CMP-2026-0002",
      user_id: 1,
      category_id: 2,
      title: "Non-functioning Streetlights on main road",
      description: "All streetlights from block C corner to Sector 4 park have been broken/non-functioning for the last 4 days. It is pitch dark at night, posing safety issues for senior citizens and women walking late.",
      priority: "medium",
      status: "in_progress",
      assigned_to: 2,
      created_at: "2026-07-17T14:15:00Z",
      updated_at: "2026-07-18T10:00:00Z"
    },
    {
      id: "CMP-2026-0003",
      user_id: 2,
      category_id: 4,
      title: "Uncleaned Garbage Pile in Park Lane",
      description: "The public dump container has overflowed, and garbage is scattered all over the lane. It is attracting stray dogs and spreading a terrible stench throughout the neighborhood. Please clear this immediately.",
      priority: "critical",
      status: "pending",
      created_at: "2026-07-18T09:00:00Z",
      updated_at: "2026-07-18T09:00:00Z"
    }
  ],
  complaint_timeline: [
    { id: 1, complaint_id: "CMP-2026-0001", status: "pending", description: "Complaint registered successfully.", created_at: "2026-07-15T10:30:00Z" },
    { id: 2, complaint_id: "CMP-2026-0001", status: "in_progress", description: "Complaint assigned to Super Admin. Dispatching engineering team to the location.", updated_by_admin: 1, created_at: "2026-07-15T11:45:00Z" },
    { id: 3, complaint_id: "CMP-2026-0001", status: "resolved", description: "Water line repaired, welded, and pressure restored. Verified with local residents.", updated_by_admin: 1, created_at: "2026-07-15T14:20:00Z" },
    { id: 4, complaint_id: "CMP-2026-0002", status: "pending", description: "Complaint registered successfully.", created_at: "2026-07-17T14:15:00Z" },
    { id: 5, complaint_id: "CMP-2026-0002", status: "in_progress", description: "Assigned to Support Specialist. Notified electricity board for street light lamp replacements.", updated_by_admin: 2, created_at: "2026-07-18T10:00:00Z" },
    { id: 6, complaint_id: "CMP-2026-0003", status: "pending", description: "Complaint registered successfully.", created_at: "2026-07-18T09:00:00Z" }
  ],
  notifications: [
    { id: 1, user_id: 1, message: "Your complaint CMP-2026-0001 status has been updated to In Progress.", is_read: true, created_at: "2026-07-15T11:45:00Z" },
    { id: 2, user_id: 1, message: "Your complaint CMP-2026-0001 status has been resolved! Please leave your feedback.", is_read: false, created_at: "2026-07-15T14:20:00Z" },
    { id: 3, user_id: 1, message: "Your complaint CMP-2026-0002 status has been updated to In Progress.", is_read: false, created_at: "2026-07-18T10:00:00Z" }
  ],
  admin_activity_logs: [
    { id: 1, admin_id: 1, action: "assigned_complaint", target: "Assigned CMP-2026-0001 to self", created_at: "2026-07-15T11:45:00Z" },
    { id: 2, admin_id: 1, action: "resolved_complaint", target: "Resolved water pipe issue CMP-2026-0001", created_at: "2026-07-15T14:20:00Z" },
    { id: 3, admin_id: 2, action: "assigned_complaint", target: "Assigned CMP-2026-0002 to self", created_at: "2026-07-18T10:00:00Z" }
  ]
};

// Database utility class to handle operations safely with file locking / persistence
class Database {
  private state: DatabaseState;

  constructor() {
    this.state = INITIAL_DB;
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const data = fs.readFileSync(DB_FILE, "utf-8");
        this.state = JSON.parse(data);
      } else {
        this.save();
      }
    } catch (e) {
      console.error("Error loading database, resetting to default seed data:", e);
      this.state = INITIAL_DB;
      this.save();
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), "utf-8");
    } catch (e) {
      console.error("Error writing database:", e);
    }
  }

  public getUsers(): User[] {
    return this.state.users;
  }

  public getAdmins(): Admin[] {
    return this.state.admins;
  }

  public getCategories(): ComplaintCategory[] {
    return this.state.complaint_categories;
  }

  public getComplaints(): Complaint[] {
    return this.state.complaints;
  }

  public getTimeline(): ComplaintTimeline[] {
    return this.state.complaint_timeline;
  }

  public getNotifications(): Notification[] {
    return this.state.notifications;
  }

  public getLogs(): AdminActivityLog[] {
    return this.state.admin_activity_logs;
  }

  // Auto-generation of complaint numbers: CMP-YYYY-XXXX
  public generateComplaintId(): string {
    const year = new Date().getFullYear();
    const prefix = `CMP-${year}-`;
    const yearComplaints = this.state.complaints.filter(c => c.id.startsWith(prefix));
    let nextNum = 1;
    if (yearComplaints.length > 0) {
      const numbers = yearComplaints.map(c => parseInt(c.id.substring(9), 10)).filter(num => !isNaN(num));
      if (numbers.length > 0) {
        nextNum = Math.max(...numbers) + 1;
      }
    }
    return `${prefix}${nextNum.toString().padStart(4, "0")}`;
  }
}

const db = new Database();

// ==========================================
// API ROUTES
// ==========================================

// 1. AUTHENTICATION MODULE
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password || !phone || !address) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const users = db.getUsers();
  const admins = db.getAdmins();

  // Validate email uniqueness
  const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase()) || 
                      admins.some(a => a.email.toLowerCase() === email.toLowerCase());

  if (emailExists) {
    return res.status(400).json({ error: "Email address is already registered" });
  }

  const newUser: User = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    name,
    email: email.toLowerCase(),
    password: hashPassword(password),
    phone,
    address,
    status: "active",
    created_at: new Date().toISOString()
  } as any;

  users.push(newUser);
  db.save();

  // Exclude password from response
  const { password: _, ...userWithoutPassword } = newUser as any;
  res.status(201).json({ message: "Registration successful", user: userWithoutPassword, role: "user" });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const hashedInput = hashPassword(password);
  const users = db.getUsers();
  const admins = db.getAdmins();

  // Check user database
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (user) {
    if ((user as any).password === hashedInput) {
      if (user.status === "suspended") {
        return res.status(403).json({ error: "Your account is suspended. Please contact administration." });
      }
      const { password: _, ...userWithoutPassword } = user as any;
      return res.json({ message: "Login successful", user: userWithoutPassword, role: "user" });
    }
  }

  // Check admin database
  const admin = admins.find(a => a.email.toLowerCase() === email.toLowerCase());
  if (admin) {
    if ((admin as any).password === hashedInput) {
      const { password: _, ...adminWithoutPassword } = admin as any;
      return res.json({ message: "Admin login successful", user: adminWithoutPassword, role: "admin" });
    }
  }

  res.status(401).json({ error: "Invalid email or password" });
});

app.post("/api/auth/profile", (req, res) => {
  const { userId, role, name, phone, address, profile_pic } = req.body;

  if (!userId || !role) {
    return res.status(400).json({ error: "Incomplete profile details provided" });
  }

  if (role === "user") {
    const users = db.getUsers();
    const userIndex = users.findIndex(u => u.id === Number(userId));
    if (userIndex === -1) {
      return res.status(444).json({ error: "User not found" });
    }
    const user = users[userIndex];
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (profile_pic) user.profile_pic = profile_pic;

    db.save();
    const { password: _, ...userWithoutPassword } = user as any;
    return res.json({ message: "Profile updated successfully", user: userWithoutPassword });
  } else if (role === "admin") {
    const admins = db.getAdmins();
    const adminIndex = admins.findIndex(a => a.id === Number(userId));
    if (adminIndex === -1) {
      return res.status(404).json({ error: "Admin not found" });
    }
    const admin = admins[adminIndex];
    if (name) admin.name = name;

    db.save();
    const { password: _, ...adminWithoutPassword } = admin as any;
    return res.json({ message: "Profile updated successfully", user: adminWithoutPassword });
  }

  res.status(400).json({ error: "Invalid role specified" });
});

app.post("/api/auth/change-password", (req, res) => {
  const { userId, role, currentPassword, newPassword } = req.body;

  if (!userId || !role || !currentPassword || !newPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const currentHashed = hashPassword(currentPassword);
  const newHashed = hashPassword(newPassword);

  if (role === "user") {
    const users = db.getUsers();
    const user = users.find(u => u.id === Number(userId));
    if (!user) return res.status(404).json({ error: "User not found" });
    if ((user as any).password !== currentHashed) {
      return res.status(400).json({ error: "Incorrect current password" });
    }
    (user as any).password = newHashed;
    db.save();
    return res.json({ message: "Password updated successfully" });
  } else if (role === "admin") {
    const admins = db.getAdmins();
    const admin = admins.find(a => a.id === Number(userId));
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    if ((admin as any).password !== currentHashed) {
      return res.status(400).json({ error: "Incorrect current password" });
    }
    (admin as any).password = newHashed;
    db.save();
    return res.json({ message: "Password updated successfully" });
  }

  res.status(400).json({ error: "Invalid credentials" });
});

// 2. COMPLAINT MODULE
app.get("/api/complaints", (req, res) => {
  const { userId, role, search, status, categoryId, priority } = req.query;

  let list = db.getComplaints();

  // Filter based on role (Users see only their own, Admins see all)
  if (role === "user") {
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    list = list.filter(c => c.user_id === Number(userId));
  }

  // Filter by category
  if (categoryId) {
    list = list.filter(c => c.category_id === Number(categoryId));
  }

  // Filter by status
  if (status) {
    list = list.filter(c => c.status === status);
  }

  // Filter by priority
  if (priority) {
    list = list.filter(c => c.priority === priority);
  }

  // Search by ID, Title, or Description
  if (search) {
    const term = String(search).toLowerCase();
    list = list.filter(c => 
      c.id.toLowerCase().includes(term) ||
      c.title.toLowerCase().includes(term) ||
      c.description.toLowerCase().includes(term)
    );
  }

  // Sort by created date descending
  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json(list);
});

app.get("/api/complaints/:id", (req, res) => {
  const { id } = req.params;
  const complaint = db.getComplaints().find(c => c.id === id);

  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  // Load timeline events for this complaint
  const timeline = db.getTimeline().filter(t => t.complaint_id === id);
  timeline.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  res.json({ complaint, timeline });
});

app.post("/api/complaints", (req, res) => {
  const { userId, categoryId, title, description, priority, image_url } = req.body;

  if (!userId || !categoryId || !title || !description || !priority) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  const complaints = db.getComplaints();
  const cid = db.generateComplaintId();

  const newComplaint: Complaint = {
    id: cid,
    user_id: Number(userId),
    category_id: Number(categoryId),
    title,
    description,
    priority,
    status: "pending",
    image_url: image_url || undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  complaints.push(newComplaint);

  // Add initial timeline event
  const timeline = db.getTimeline();
  timeline.push({
    id: timeline.length > 0 ? Math.max(...timeline.map(t => t.id)) + 1 : 1,
    complaint_id: cid,
    status: "pending",
    description: "Complaint registered successfully and auto-assigned ID: " + cid + ".",
    created_at: new Date().toISOString()
  });

  db.save();
  res.status(201).json({ message: "Complaint registered successfully", complaint: newComplaint });
});

// Admin update complaint details (Assign, Change Status, Add Timeline note)
app.put("/api/complaints/:id/action", (req, res) => {
  const { id } = req.params;
  const { adminId, status, assigned_to, note } = req.body;

  if (!adminId) {
    return res.status(400).json({ error: "Admin details missing" });
  }

  const complaints = db.getComplaints();
  const cIndex = complaints.findIndex(c => c.id === id);
  if (cIndex === -1) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  const complaint = complaints[cIndex];
  const oldStatus = complaint.status;
  const oldAssigned = complaint.assigned_to;

  let activityAction = "updated_complaint";
  let activityTarget = `Modified details for complaint ${id}`;

  if (assigned_to !== undefined) {
    complaint.assigned_to = assigned_to ? Number(assigned_to) : undefined;
    activityAction = "assigned_complaint";
    activityTarget = `Assigned ${id} to ${assigned_to ? 'admin #' + assigned_to : 'unassigned'}`;
  }

  if (status && status !== oldStatus) {
    complaint.status = status;
    complaint.updated_at = new Date().toISOString();
    activityAction = "status_change";
    activityTarget = `Changed status of ${id} from ${oldStatus} to ${status}`;

    // Add user notification
    const notifications = db.getNotifications();
    notifications.push({
      id: notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1,
      user_id: complaint.user_id,
      message: `Your complaint ${id} status has been updated to "${status.replace('_', ' ').toUpperCase()}".`,
      is_read: false,
      created_at: new Date().toISOString()
    });
  }

  // Create Timeline Record
  const timeline = db.getTimeline();
  timeline.push({
    id: timeline.length > 0 ? Math.max(...timeline.map(t => t.id)) + 1 : 1,
    complaint_id: id,
    status: status || oldStatus,
    description: note || `Complaint details updated by Administrator.`,
    updated_by_admin: Number(adminId),
    created_at: new Date().toISOString()
  });

  // Create Admin Log
  const logs = db.getLogs();
  logs.push({
    id: logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1,
    admin_id: Number(adminId),
    action: activityAction,
    target: activityTarget,
    created_at: new Date().toISOString()
  });

  db.save();
  res.json({ message: "Complaint updated successfully", complaint });
});

// User feedback & rating after resolution
app.put("/api/complaints/:id/feedback", (req, res) => {
  const { id } = req.params;
  const { rating, feedback, userId } = req.body;

  if (!userId || !rating) {
    return res.status(400).json({ error: "Rating and user authentication is required" });
  }

  const complaints = db.getComplaints();
  const cIndex = complaints.findIndex(c => c.id === id);
  if (cIndex === -1) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  const complaint = complaints[cIndex];
  if (complaint.user_id !== Number(userId)) {
    return res.status(403).json({ error: "Unauthorized action on this complaint" });
  }

  complaint.rating = Number(rating);
  complaint.feedback = feedback || "";
  complaint.status = "closed"; // Automatically close when feedback is completed
  complaint.updated_at = new Date().toISOString();

  // Timeline update for closing
  const timeline = db.getTimeline();
  timeline.push({
    id: timeline.length > 0 ? Math.max(...timeline.map(t => t.id)) + 1 : 1,
    complaint_id: id,
    status: "closed",
    description: `User closed the complaint and submitted rating (${rating}/5) & feedback.`,
    created_at: new Date().toISOString()
  });

  db.save();
  res.json({ message: "Feedback submitted successfully, complaint is now closed", complaint });
});

// 3. CATEGORY MODULE
app.get("/api/categories", (req, res) => {
  res.json(db.getCategories());
});

app.post("/api/categories", (req, res) => {
  const { name, description, adminId } = req.body;

  if (!name || !description || !adminId) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const categories = db.getCategories();
  const existing = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "A category with this name already exists" });
  }

  const newCat: ComplaintCategory = {
    id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
    name,
    description,
    created_at: new Date().toISOString()
  };

  categories.push(newCat);

  // Add Log
  const logs = db.getLogs();
  logs.push({
    id: logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1,
    admin_id: Number(adminId),
    action: "create_category",
    target: `Created category: ${name}`,
    created_at: new Date().toISOString()
  });

  db.save();
  res.status(201).json({ message: "Category created successfully", category: newCat });
});

// 4. USER MANAGEMENT MODULE (ADMIN ONLY)
app.get("/api/admin/users", (req, res) => {
  // Return users with pass exclude
  const users = db.getUsers().map(({ password, ...u }) => u);
  res.json(users);
});

app.put("/api/admin/users/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, adminId } = req.body;

  if (!status || !adminId) {
    return res.status(400).json({ error: "Status and admin credentials required" });
  }

  const users = db.getUsers();
  const user = users.find(u => u.id === Number(id));

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  user.status = status;

  // Add Log
  const logs = db.getLogs();
  logs.push({
    id: logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1,
    admin_id: Number(adminId),
    action: "update_user_status",
    target: `Set status of user #${id} (${user.email}) to ${status}`,
    created_at: new Date().toISOString()
  });

  db.save();
  res.json({ message: `User status changed to ${status}`, user });
});

// Admin activity logs
app.get("/api/admin/logs", (req, res) => {
  const logs = db.getLogs();
  logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(logs);
});

// 5. NOTIFICATION MODULE
app.get("/api/notifications", (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const notifications = db.getNotifications().filter(n => n.user_id === Number(userId));
  notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(notifications);
});

app.put("/api/notifications/read-all", (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const notifications = db.getNotifications().filter(n => n.user_id === Number(userId));
  notifications.forEach(n => n.is_read = true);
  db.save();

  res.json({ message: "All notifications marked as read" });
});

app.put("/api/notifications/:id/read", (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const notifications = db.getNotifications();
  const n = notifications.find(n => n.id === Number(id) && n.user_id === Number(userId));
  if (n) {
    n.is_read = true;
    db.save();
  }

  res.json({ message: "Notification marked as read" });
});

// 6. REPORTS AND ANALYTICS
app.get("/api/reports/stats", (req, res) => {
  const complaints = db.getComplaints();
  const categories = db.getCategories();
  const users = db.getUsers();

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === "pending").length;
  const inProgress = complaints.filter(c => c.status === "in_progress").length;
  const resolved = complaints.filter(c => c.status === "resolved").length;
  const closed = complaints.filter(c => c.status === "closed").length;

  // Breakdown by priority
  const priorityBreakdown = {
    low: complaints.filter(c => c.priority === "low").length,
    medium: complaints.filter(c => c.priority === "medium").length,
    high: complaints.filter(c => c.priority === "high").length,
    critical: complaints.filter(c => c.priority === "critical").length,
  };

  // Breakdown by category
  const categoryBreakdown = categories.map(cat => {
    return {
      categoryId: cat.id,
      categoryName: cat.name,
      count: complaints.filter(c => c.category_id === cat.id).length
    };
  });

  // Monthly breakdown for charting (last 6 months including current)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth();

  const monthlyReport = Array.from({ length: 6 }).map((_, idx) => {
    // Stagger backwards
    const m = (currentMonthIdx - idx + 12) % 12;
    const y = currentMonthIdx - idx < 0 ? currentYear - 1 : currentYear;
    
    const count = complaints.filter(c => {
      const d = new Date(c.created_at);
      return d.getMonth() === m && d.getFullYear() === y;
    }).length;

    const resolvedCount = complaints.filter(c => {
      const d = new Date(c.created_at);
      return d.getMonth() === m && d.getFullYear() === y && (c.status === "resolved" || c.status === "closed");
    }).length;

    return {
      monthLabel: `${monthNames[m]} ${y}`,
      total: count,
      resolved: resolvedCount,
      sortKey: y * 12 + m
    };
  }).reverse();

  // Ratings distribution
  const ratingsCount = complaints.filter(c => c.rating).map(c => c.rating as number);
  const avgRating = ratingsCount.length > 0 ? (ratingsCount.reduce((a, b) => a + b, 0) / ratingsCount.length).toFixed(1) : "0.0";

  res.json({
    summary: {
      total,
      pending,
      inProgress,
      resolved,
      closed,
      usersCount: users.length,
      averageRating: avgRating
    },
    priorityBreakdown,
    categoryBreakdown,
    monthlyReport
  });
});

// ==========================================
// VITE CLIENT INTEGRATION
// ==========================================

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Complaint Registration System server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
