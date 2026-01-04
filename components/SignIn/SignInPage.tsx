"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Coffee } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const router = useRouter();

  // Fade in form on mount
  useEffect(() => {
    const timer = setTimeout(() => setFormVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const redirectByRole = async (user: { uid: string } | null) => {
    if (!user) {
      setShowRegisterPrompt(true);
      setError("Account not found. Please register first.");
      return;
    }
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) {
        setShowRegisterPrompt(true);
        setError("Account profile not found. Please complete registration.");
        // Sign out the user since they don't have a complete profile
        await auth.signOut();
        return;
      }
      const data = snap.data() as { role?: string };
      if (data?.role === "teacher") {
        router.replace("/teacher/dashboard");
      } else if (data?.role === "student") {
        router.replace("/student/dashboard");
      } else {
        // User has no role assigned
        setShowRegisterPrompt(true);
        setError("Account incomplete. Please register to set up your profile.");
        await auth.signOut();
      }
    } catch (err: unknown) {
      console.error("redirectByRole error:", err);
      setError("Failed to load account. Please try again.");
      await auth.signOut();
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowRegisterPrompt(false);
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await redirectByRole(cred.user ?? auth.currentUser);
    } catch (err: unknown) {
      console.error(err);

      const errorCode = err && typeof err === 'object' && 'code' in err ? err.code : null;
      const errorMessage = err && typeof err === 'object' && 'message' in err ? String(err.message) : null;

      // Check if it's a user-not-found or wrong-password error
      if (errorCode === "auth/user-not-found") {
        setError("We couldn't find an account with that email.");
        setShowRegisterPrompt(true);
      } else if (errorCode === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (errorCode === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (errorCode === "auth/invalid-credential") {
        setError("Invalid email or password. Please check your credentials.");
        setShowRegisterPrompt(true);
      } else {
        setError(errorMessage ?? "Sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setShowRegisterPrompt(false);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await redirectByRole(result.user ?? auth.currentUser);
    } catch (err: unknown) {
      console.error(err);

      const errorCode = err && typeof err === 'object' && 'code' in err ? err.code : null;
      const errorMessage = err && typeof err === 'object' && 'message' in err ? String(err.message) : null;

      if (errorCode === "auth/popup-closed-by-user") {
        setError("Sign-in was cancelled. Please try again.");
      } else if (errorCode === "auth/account-exists-with-different-credential") {
        setError("An account already exists with this email using a different sign-in method.");
      } else {
        setError(errorMessage ?? "Google sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FFF7ED] to-[#FEF3C7] text-[#2B1B14]">
      {/* Header */}
      <header className="border-b border-[#E7D6C8] bg-white/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Coffee className="h-6 w-6 text-[#C97C2B]" />
            <span className="text-lg font-semibold tracking-tight text-[#2B1B14]">
              Add Up Café
            </span>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="border-[#E7D6C8] text-[#6B4F3F] hover:bg-[#C97C2B]/5"
            >
              Back Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div
            className={`rounded-2xl border border-[#E7D6C8] bg-white p-8 shadow-lg transition-all duration-700 ${
              formVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="mb-2 text-3xl font-bold text-[#2B1B14]">
              Welcome back
            </h2>
            <p className="mb-8 text-sm text-[#6B4F3F]">
              Sign in to continue
            </p>

            <form
              onSubmit={handleEmailSignIn}
              className="flex flex-col gap-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-[#2B1B14]">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[#E7D6C8] bg-white px-4 text-sm text-[#2B1B14] placeholder:text-[#6B4F3D]/50 focus:border-[#C97C2B] focus:outline-none focus:ring-2 focus:ring-[#C97C2B]/20 transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#2B1B14]">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[#E7D6C8] bg-white px-4 text-sm text-[#2B1B14] placeholder:text-[#6B4F3D]/50 focus:border-[#C97C2B] focus:outline-none focus:ring-2 focus:ring-[#C97C2B]/20 transition-colors"
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                  {showRegisterPrompt && (
                    <Link
                      href="/register"
                      className="mt-2 inline-block text-sm font-medium text-[#C97C2B] hover:underline"
                    >
                      Would you like to create an account? →
                    </Link>
                  )}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full bg-[#C97C2B] text-white font-medium hover:bg-[#B06A23] focus:ring-2 focus:ring-[#C97C2B]/40 disabled:opacity-60 transition-all"
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E7D6C8]"></div>
              <span className="text-xs text-[#6B4F3F]">or</span>
              <div className="h-px flex-1 bg-[#E7D6C8]"></div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="h-11 w-full border-[#E7D6C8] text-[#6B4F3F] hover:bg-[#C97C2B]/5 focus:ring-2 focus:ring-[#C97C2B]/20 transition-all"
            >
              {loading ? "Please wait..." : "Continue with Google"}
            </Button>

            <p className="mt-8 text-center text-sm text-[#6B4F3F]">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-[#C97C2B] hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}