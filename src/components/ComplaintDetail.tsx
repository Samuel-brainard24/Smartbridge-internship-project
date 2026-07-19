import React, { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  Clock, 
  User, 
  UserCheck, 
  Tag, 
  AlertTriangle, 
  Calendar,
  Star,
  Send,
  CheckCircle2,
  Image as ImageIcon,
  MessageSquare
} from "lucide-react";
import { Complaint, ComplaintTimeline, Admin, User as UserType } from "../types";
import { complaintApi, adminApi } from "../api";

interface ComplaintDetailProps {
  complaintId: string;
  userId: number;
  role: "user" | "admin";
  onBack: () => void;
  onShowToast: (msg: string, type: "success" | "error") => void;
}

export default function ComplaintDetail({
  complaintId,
  userId,
  role,
  onBack,
  onShowToast,
}: ComplaintDetailProps) {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [timeline, setTimeline] = useState<ComplaintTimeline[]>(null as any);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  // User feedback states
  const [userRating, setUserRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [userFeedback, setUserFeedback] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Admin action states
  const [adminStatus, setAdminStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  async function loadDetail() {
    try {
      setLoading(true);
      const res = await complaintApi.detail(complaintId);
      setComplaint(res.complaint);
      setTimeline(res.timeline);

      setAdminStatus(res.complaint.status);
      setAssignedTo(res.complaint.assigned_to ? String(res.complaint.assigned_to) : "");

      // If user is admin, load admin list for the assignment dropdown
      if (role === "admin") {
        // Simple mock administrators lookup or we can fetch. Our seed data has 2 admins.
        setAdmins([
          { id: 1, name: "Super Admin", email: "admin@complaints.com", role: "superadmin", created_at: "" },
          { id: 2, name: "Support Specialist", email: "support@complaints.com", role: "support", created_at: "" }
        ]);
      }
    } catch (err: any) {
      onShowToast(err.message || "Failed to load complaint details", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDetail();
  }, [complaintId]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingFeedback(true);
      await complaintApi.submitFeedback(complaintId, {
        rating: userRating,
        feedback: userFeedback,
        userId,
      });
      onShowToast("Feedback submitted and complaint closed!", "success");
      loadDetail(); // reload state
    } catch (err: any) {
      onShowToast(err.message || "Failed to submit feedback", "error");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleAdminActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarks.trim()) {
      onShowToast("Please enter detailed remarks for this status update", "error");
      return;
    }

    try {
      setSubmittingAction(true);
      await complaintApi.updateAction(complaintId, {
        adminId: userId,
        status: adminStatus || undefined,
        assigned_to: assignedTo ? Number(assignedTo) : null,
        note: remarks,
      });

      onShowToast("Complaint actions saved successfully", "success");
      setRemarks(""); // Clear remarks field
      loadDetail(); // reload
    } catch (err: any) {
      onShowToast(err.message || "Failed to save administrator updates", "error");
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-800" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Complaint records could not be resolved.</p>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">Go Back</button>
      </div>
    );
  }

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case "critical": return "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900";
      case "high": return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900";
      case "medium": return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900";
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700";
    }
  };

  const getStatusStyle = (s: string) => {
    switch (s) {
      case "pending": return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/50";
      case "in_progress": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50";
      case "resolved": return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50";
      case "closed": return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/30 dark:text-slate-400 dark:border-slate-700/50";
      default: return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const getTimelineBulletColor = (s: string) => {
    switch (s) {
      case "pending": return "bg-yellow-500 ring-yellow-500/20";
      case "in_progress": return "bg-blue-500 ring-blue-500/20";
      case "resolved": return "bg-emerald-500 ring-emerald-500/20";
      case "closed": return "bg-slate-500 ring-slate-500/20";
      default: return "bg-slate-400 ring-slate-400/20";
    }
  };

  const getAdminName = (id: number) => {
    if (id === 1) return "Super Admin";
    if (id === 2) return "Support Specialist";
    return "Assigned Administrator";
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to List
      </button>

      {/* Grid: Details Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left Column (2 cols): Details & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Details Card */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                    {complaint.id}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getPriorityStyle(complaint.priority)}`}>
                    {complaint.priority}
                  </span>
                </div>
                <h3 className="mt-1.5 font-display text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                  {complaint.title}
                </h3>
              </div>
              <span className={`self-start rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusStyle(complaint.status)}`}>
                {complaint.status.replace("_", " ")}
              </span>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {complaint.description}
            </p>

            {/* Quick Metadata Info */}
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:grid-cols-3">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-wide text-slate-400">Date Filed</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-slate-400" />
                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-wide text-slate-400">Assigned To</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {complaint.assigned_to ? getAdminName(complaint.assigned_to) : "Unassigned"}
                  </span>
                </div>
              </div>

              <div className="col-span-2 flex items-center gap-1.5 sm:col-span-1">
                <Clock className="h-4 w-4 text-slate-400" />
                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-wide text-slate-400">Last Active</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {new Date(complaint.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Tracking Timeline Card */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-display text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-5">
              Complaint Timeline & History
            </h3>

            <div className="relative pl-6 space-y-6">
              {/* Vertical timeline spine */}
              <div className="absolute left-2.5 top-1.5 bottom-1.5 w-0.5 bg-slate-200 dark:bg-slate-800" />

              {timeline && timeline.map((t) => (
                <div key={t.id} className="relative">
                  {/* Timeline bullet dot */}
                  <div className={`absolute -left-6 top-1 h-3 w-3 rounded-full ring-4 ${getTimelineBulletColor(t.status)}`} />
                  
                  <div className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {t.status.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(t.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      {t.description}
                    </p>
                    {t.updated_by_admin && (
                      <span className="inline-block text-[10px] text-slate-400 font-semibold">
                        Actioned by: {getAdminName(t.updated_by_admin)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Attachment, Ratings or Action Panels */}
        <div className="space-y-6">
          
          {/* Attachment Preview Card */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-display text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-slate-400" />
              Attached Evidence
            </h3>

            {complaint.image_url ? (
              <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                <img
                  src={complaint.image_url}
                  alt="Evidence"
                  className="max-h-56 w-full object-cover cursor-zoom-in"
                  onClick={() => {
                    const w = window.open();
                    w?.document.write(`<img src="${complaint.image_url}" style="max-width:100%; height:auto;" />`);
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 dark:text-slate-500">
                <ImageIcon className="h-8 w-8 stroke-[1.5] mb-1.5" />
                <p className="text-[10px]">No image evidence provided</p>
              </div>
            )}
          </div>

          {/* Rating Display Card (Only if resolved and rating exists) */}
          {(complaint.rating || complaint.feedback) && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-xs dark:border-emerald-900/30 dark:bg-emerald-950/10">
              <h3 className="font-display text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                User Feedback
              </h3>
              
              {complaint.rating && (
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star 
                      key={idx} 
                      className={`h-4.5 w-4.5 ${
                        idx < (complaint.rating || 0) 
                          ? "fill-amber-400 text-amber-400" 
                          : "text-slate-300 dark:text-slate-700"
                      }`} 
                    />
                  ))}
                  <span className="ml-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    {complaint.rating}/5 Rating
                  </span>
                </div>
              )}
              {complaint.feedback && (
                <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  "{complaint.feedback}"
                </p>
              )}
            </div>
          )}

          {/* USER Feedback Form Panel (If status is resolved, and no feedback yet) */}
          {role === "user" && complaint.status === "resolved" && !complaint.rating && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-5 shadow-xs dark:border-blue-900/30 dark:bg-blue-950/15">
              <h3 className="font-display text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-4.5 w-4.5 text-blue-600" />
                Submit Closing Feedback
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                Your complaint has been marked as Resolved. Please provide your rating and comments below to close the complaint folder.
              </p>

              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                {/* Stars selector */}
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Satisfaction Rating</span>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const val = idx + 1;
                      const active = hoverRating !== null ? val <= hoverRating : val <= userRating;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onMouseEnter={() => setHoverRating(val)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setUserRating(val)}
                          className="p-0.5 text-slate-300 transition-colors hover:scale-110 active:scale-95"
                        >
                          <Star className={`h-6 w-6 ${active ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-700"}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Feedback notes */}
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Closing Comments</span>
                  <textarea
                    id="feedback-text-area"
                    rows={3}
                    placeholder="Provide any comments about the solution or support quality..."
                    value={userFeedback}
                    onChange={(e) => setUserFeedback(e.target.value)}
                    disabled={submittingFeedback}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 shadow-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <button
                  id="submit-feedback-btn"
                  type="submit"
                  disabled={submittingFeedback}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  {submittingFeedback ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    "Submit & Close Ticket"
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ADMIN Operations panel (Visible only to admins, if not already closed/resolved) */}
          {role === "admin" && (
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-display text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <MessageSquare className="h-4.5 w-4.5 text-blue-600" />
                Administrative Actions
              </h3>

              <form onSubmit={handleAdminActionSubmit} className="space-y-4">
                {/* Assign to Admin dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Assign Specialist</label>
                  <select
                    id="admin-assignee-select"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    disabled={submittingAction || complaint.status === "closed"}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  >
                    <option value="">Unassigned</option>
                    {admins.map((adm) => (
                      <option key={adm.id} value={adm.id}>
                        {adm.name} ({adm.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transition Status */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Update Case Status</label>
                  <select
                    id="admin-status-select"
                    value={adminStatus}
                    onChange={(e) => setAdminStatus(e.target.value)}
                    disabled={submittingAction || complaint.status === "closed"}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed (Archive)</option>
                  </select>
                </div>

                {/*remarks */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Status Update Note <span className="text-rose-500">*</span></label>
                  <textarea
                    id="admin-remarks-text-area"
                    rows={4}
                    placeholder="Enter detailed administrative actions taken, site inspection findings, or notes for the citizen timeline..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    disabled={submittingAction || complaint.status === "closed"}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    required
                  />
                </div>

                <button
                  id="admin-submit-action-btn"
                  type="submit"
                  disabled={submittingAction || complaint.status === "closed"}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {submittingAction ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    "Save & Log Timeline"
                  )}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
