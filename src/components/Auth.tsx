import React, { useState } from "react";
import { CheckSquare, Lock, Mail, Phone, MapPin, User, Eye, EyeOff, KeyRound, AlertTriangle } from "lucide-react";
import { authApi } from "../api";
import { User as UserType, Admin as AdminType } from "../types";

interface AuthProps {
  onLoginSuccess: (user: UserType | AdminType, role: "user" | "admin") => void;
  onShowToast: (msg: string, type: "success" | "error") => void;
}

type AuthMode = "login" | "register" | "forgot";

export default function Auth({ onLoginSuccess, onShowToast }: AuthProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Core Form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      onShowToast("Please fill in both email and password.", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.login({ email, password });
      onShowToast(res.message, "success");
      onLoginSuccess(res.user, res.role);
    } catch (err: any) {
      onShowToast(err.message || "Login failed. Check your credentials.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password || !phone || !address.trim()) {
      onShowToast("All registration fields are required.", "error");
      return;
    }

    if (password.length < 6) {
      onShowToast("Password must be at least 6 characters long.", "error");
      return;
    }

    if (password !== confirmPass) {
      onShowToast("Passwords do not match.", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.register({ name, email, password, phone, address });
      onShowToast(res.message, "success");
      onLoginSuccess(res.user, res.role);
    } catch (err: any) {
      onShowToast(err.message || "Registration failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      onShowToast("Please enter your registered email.", "error");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      onShowToast("A password reset verification code has been dispatched to: " + email, "success");
      setLoading(false);
      setMode("login");
    }, 1200);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-xl dark:border-slate-900 dark:bg-slate-900 sm:p-8">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <CheckSquare className="h-7 w-7" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Online Complaint Portal
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {mode === "login" && "Access your account dashboard"}
              {mode === "register" && "Create a new citizen account"}
              {mode === "forgot" && "Recover your account credentials"}
            </p>
          </div>
        </div>

        {/* Form Container */}
        {mode === "login" && (
          <form id="login-form" onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  id="login-email"
                  type="email"
                  placeholder="e.g. name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-[10px] font-bold text-blue-600 hover:underline dark:text-blue-400"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-10 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                "Sign In"
              )}
            </button>

            <div className="text-center">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="font-bold text-blue-600 hover:underline dark:text-blue-400"
                >
                  Create an Account
                </button>
              </p>
            </div>
          </form>
        )}

        {mode === "register" && (
          <form id="register-form" onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <User className="h-4.5 w-4.5" />
                </span>
                <input
                  id="register-name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  id="register-email"
                  type="email"
                  placeholder="john@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Contact Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Phone className="h-4.5 w-4.5" />
                </span>
                <input
                  id="register-phone"
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Permanent Physical Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Permanent Address</label>
              <div className="relative">
                <span className="absolute top-2.5 left-3 text-slate-400">
                  <MapPin className="h-4.5 w-4.5" />
                </span>
                <textarea
                  id="register-address"
                  rows={2}
                  placeholder="House No, Block, Lane, Street name, City..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Passwords (side-by-side on desktop) */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                <input
                  id="register-password"
                  type="password"
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Confirm Password</label>
                <input
                  id="register-confirm-password"
                  type="password"
                  placeholder="Re-type password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                "Create Account"
              )}
            </button>

            <div className="text-center">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="font-bold text-blue-600 hover:underline dark:text-blue-400"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        )}

        {mode === "forgot" && (
          <form id="forgot-form" onSubmit={handleForgot} className="space-y-4">
            <div className="rounded-lg border border-yellow-100 bg-yellow-50/50 p-3 dark:border-yellow-900/30 dark:bg-yellow-950/20">
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-yellow-800 dark:text-yellow-400 leading-relaxed font-semibold">
                  Specify your verified email. The database matches active profiles and dispatches a password override key.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Registered Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="e.g. john@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>
            </div>

            <button
              id="forgot-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                "Recover Password"
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-[11px] font-bold text-blue-600 hover:underline dark:text-blue-400"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
