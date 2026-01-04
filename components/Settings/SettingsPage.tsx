"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Coffee } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [userRole, setUserRole] = useState<"student" | "teacher" | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = auth.currentUser;
      if (user) {
        setName(user.displayName || "");
        setEmail(user.email || "");

        // Get user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role || null);
          }
        } catch (err) {
          console.error("Error loading user role:", err);
        }

        setPageLoading(false);
      } else {
        router.push("/signin");
      }
    };

    loadUser();
  }, [router]);

  const handleNameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
        setSuccess("Name updated successfully");
      }
    } catch (err) {
      const firebaseErr = err as { message: string };
      setError(firebaseErr.message || "Failed to update name");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (auth.currentUser) {
        await updateEmail(auth.currentUser, email);
        setSuccess("Email updated successfully");
      }
    } catch (err) {
      const firebaseErr = err as { message: string };
      setError(firebaseErr.message || "Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (user && user.email) {
        // Reauthenticate user
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Update password
        await updatePassword(user, newPassword);
        setSuccess("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      const firebaseErr = err as { message: string };
      setError(firebaseErr.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#FFF7ED] to-[#FEF3C7] flex items-center justify-center">
        <p className="text-[#6B4F3F]">Loading...</p>
      </main>
    );
  }

  const dashboardUrl = userRole === "teacher" ? "/teacher/dashboard" : "/student/dashboard";

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FFF7ED] to-[#FEF3C7] text-[#2B1B14]">
      {/* Header */}
      <header className="border-b border-[#E7D6C8] bg-white/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Coffee className="h-6 w-6 text-[#C97C2B]" />
            <span className="text-lg font-semibold tracking-tight text-[#2B1B14]">
              Add Up Café
            </span>
          </div>
          <Link href={dashboardUrl}>
            <Button
              variant="outline"
              size="sm"
              className="border-[#E7D6C8] text-[#6B4F3F] hover:bg-[#C97C2B]/5"
            >
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-2 text-3xl font-bold text-[#2B1B14]">Settings</h1>
        <p className="mb-8 text-sm text-[#6B4F3F]">Manage your account preferences</p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">{success}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Change Name */}
          <Card className="rounded-2xl border border-[#E7D6C8] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#2B1B14]">
              Change Name
            </h2>
            <form onSubmit={handleNameChange} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-[#2B1B14]">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11 border-[#E7D6C8] focus:border-[#C97C2B] focus:ring-2 focus:ring-[#C97C2B]/20"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-11 bg-[#C97C2B] text-white hover:bg-[#B06A23] font-medium"
              >
                {loading ? "Updating..." : "Update Name"}
              </Button>
            </form>
          </Card>

          {/* Change Email */}
          <Card className="rounded-2xl border border-[#E7D6C8] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#2B1B14]">
              Change Email
            </h2>
            <form onSubmit={handleEmailChange} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#2B1B14]">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 border-[#E7D6C8] focus:border-[#C97C2B] focus:ring-2 focus:ring-[#C97C2B]/20"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-11 bg-[#C97C2B] text-white hover:bg-[#B06A23] font-medium"
              >
                {loading ? "Updating..." : "Update Email"}
              </Button>
            </form>
          </Card>

          {/* Change Password */}
          <Card className="rounded-2xl border border-[#E7D6C8] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#2B1B14]">
              Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="current-password" className="mb-2 block text-sm font-medium text-[#2B1B14]">
                  Current Password
                </label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="h-11 border-[#E7D6C8] focus:border-[#C97C2B] focus:ring-2 focus:ring-[#C97C2B]/20"
                />
              </div>
              <div>
                <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-[#2B1B14]">
                  New Password
                </label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="h-11 border-[#E7D6C8] focus:border-[#C97C2B] focus:ring-2 focus:ring-[#C97C2B]/20"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-[#2B1B14]">
                  Confirm Password
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 border-[#E7D6C8] focus:border-[#C97C2B] focus:ring-2 focus:ring-[#C97C2B]/20"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-11 bg-[#C97C2B] text-white hover:bg-[#B06A23] font-medium"
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </main>
  );
}