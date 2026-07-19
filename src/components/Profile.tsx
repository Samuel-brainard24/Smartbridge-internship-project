import React, { useState, useRef } from "react";
import { User as UserIcon, Lock, Upload, X, Shield, Phone, MapPin, Mail } from "lucide-react";
import { User, Admin } from "../types";
import { authApi } from "../api";

interface ProfileProps {
  user: User | Admin;
  role: "user" | "admin";
  onProfileUpdate: (updatedUser: User | Admin) => void;
  onShowToast: (msg: string, type: "success" | "error") => void;
}

export default function Profile({
  user,
  role,
  onProfileUpdate,
  onShowToast,
}: ProfileProps) {
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Profile fields
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState((user as User).phone || "");
  const [address, setAddress] = useState((user as User).address || "");
  const [profilePic, setProfilePic] = useState(user.profile_pic || "");
  
  // Password change fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onShowToast("Only image attachments are supported for profile avatars", "error");
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      onShowToast("Avatar images must be less than 1MB in size", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfilePic(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      onShowToast("Name cannot be left blank", "error");
      return;
    }

    try {
      setProfileLoading(true);
      const res = await authApi.updateProfile({
        userId: user.id,
        role,
        name,
        phone: role === "user" ? phone : undefined,
        address: role === "user" ? address : undefined,
        profile_pic: profilePic || undefined,
      });

      onProfileUpdate(res.user);
      onShowToast("Account details updated successfully", "success");
    } catch (err: any) {
      onShowToast(err.message || "Failed to update profile", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      onShowToast("All password credentials are required", "error");
      return;
    }

    if (newPassword.length < 6) {
      onShowToast("New password must be at least 6 characters long", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      onShowToast("New passwords do not match", "error");
      return;
    }

    try {
      setPasswordLoading(true);
      await authApi.changePassword({
        userId: user.id,
        role,
        currentPassword,
        newPassword,
      });

      onShowToast("Your password was updated successfully", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      onShowToast(err.message || "Failed to change password", "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          My Account Profile
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Modify contact details, change profile pictures, or update account security keys.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 cols): Details and Edit Form */}
        <div className="lg:col-span-2 rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <h3 className="font-display text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            Personal Information
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            {/* Avatar Upload block */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt={user.name}
                    className="h-20 w-20 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-3xl font-semibold text-white">
                    {user.name.substring(0, 1).toUpperCase()}
                  </div>
                )}
                {profilePic && (
                  <button
                    type="button"
                    onClick={() => setProfilePic("")}
                    className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white border border-white hover:bg-rose-600 shadow-sm"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Upload className="h-4 w-4 text-slate-400" />
                  Upload Avatar Image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  JPEG or PNG up to 1MB. Fits to profile circle.
                </p>
              </div>
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-slate-400" />
                Email Address (Read-Only)
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-500 outline-none dark:border-slate-800 dark:bg-slate-950/40"
              />
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <UserIcon className="h-4 w-4 text-slate-400" />
                Full Name
              </label>
              <input
                id="profile-input-name"
                type="text"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={profileLoading}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                required
              />
            </div>

            {role === "user" && (
              <>
                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-slate-400" />
                    Phone Number
                  </label>
                  <input
                    id="profile-input-phone"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={profileLoading}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    required
                  />
                </div>

                {/* Physical Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    Permanent Home Address
                  </label>
                  <textarea
                    id="profile-input-address"
                    rows={3}
                    placeholder="Provide your complete building name, plot, sector, lane, and city details..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={profileLoading}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex justify-end pt-3">
              <button
                id="profile-submit-btn"
                type="submit"
                disabled={profileLoading}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
              >
                {profileLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column (1 col): Change Password Form */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 h-fit space-y-4">
          <h3 className="font-display text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="h-4.5 w-4.5 text-blue-600" />
            Security & Password
          </h3>
          <p className="text-[10px] text-slate-400 leading-relaxed mb-2">
            Change your account password. Ensure the new keys are alphanumeric and at least 6 characters in length.
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" />
                Current Password
              </label>
              <input
                id="password-input-current"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={passwordLoading}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                New Password
              </label>
              <input
                id="password-input-new"
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={passwordLoading}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                Confirm New Password
              </label>
              <input
                id="password-input-confirm"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={passwordLoading}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                required
              />
            </div>

            <button
              id="password-submit-btn"
              type="submit"
              disabled={passwordLoading}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-850 dark:hover:bg-slate-800"
            >
              {passwordLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
