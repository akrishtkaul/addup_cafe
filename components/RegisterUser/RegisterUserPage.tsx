"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RegisterForm } from "@/components/register-form";
import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Coffee, GraduationCap, Users } from "lucide-react";

type UserRole = "student" | "teacher" | null;

export default function RegisterUserPage() {
  const [role, setRole] = useState<UserRole>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [roleCardsVisible, setRoleCardsVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const router = useRouter();

  // Fade in role cards on mount
  useEffect(() => {
    const timer = setTimeout(() => setRoleCardsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Fade in form when role is selected
  useEffect(() => {
    if (role) {
      setFormVisible(false);
      const timer = setTimeout(() => setFormVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [role]);

  const handleGoogleSignIn = async () => {
    setError(null);
    if (!role) return;

    try {
      console.log("DEBUG: Starting Google sign-in...");
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user ?? auth.currentUser;

      if (!user) {
        throw new Error("No user returned from Google sign-in");
      }

      console.log("DEBUG: Google sign-in successful, uid:", user.uid);
      const userName = user.displayName?.trim() || "User";

      await user.getIdToken(true);

      const userDocRef = doc(db, "users", user.uid);
      const existingDoc = await getDoc(userDocRef);

      if (existingDoc.exists()) {
        const existingData = existingDoc.data() as { role?: string; name?: string };
        const existingRole = existingData?.role;
        if (existingRole === "student" || existingRole === "teacher") {
          console.log("DEBUG: User already set up, redirecting to dashboard");
          router.replace(`/${existingRole}/dashboard`);
          return;
        }
      }

      const payload = {
        role: role,
        name: userName,
      };

      await setDoc(userDocRef, payload);
      router.replace(role === "student" ? "/student/dashboard" : "/teacher/dashboard");
    } catch (err: unknown) {
      console.error("DEBUG: Google sign-in error:", err);
      const errorMessage = err instanceof Error ? err.message : "Google sign-in failed. Please try again.";
      setError(errorMessage);
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
          {!role ? (
            <div
              className={`rounded-2xl border border-[#E7D6C8] bg-white p-8 shadow-lg transition-all duration-700 ${
                roleCardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <h2 className="mb-2 text-3xl font-bold text-[#2B1B14]">
                Welcome to Add Up Café
              </h2>
              <p className="mb-8 text-sm text-[#6B4F3F]">
                Choose your role to get started
              </p>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setRole("student")}
                  className={`group rounded-2xl border-2 border-[#E7D6C8] bg-white p-6 text-left transition-all duration-500 hover:border-[#C97C2B] hover:shadow-md hover:-translate-y-0.5 ${
                    roleCardsVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  }`}
                  style={{ transitionDelay: "200ms" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C97C2B]/10 group-hover:bg-[#C97C2B]/20 transition-colors flex-shrink-0">
                      <GraduationCap className="h-6 w-6 text-[#C97C2B]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#2B1B14]">I&apos;m a Student!</h3>
                  </div>
                  <p className="text-sm text-[#6B4F3F] pl-[60px]">Practice addition at your own pace.</p>
                </button>

                <button
                  onClick={() => setRole("teacher")}
                  className={`group rounded-2xl border-2 border-[#E7D6C8] bg-white p-6 text-left transition-all duration-500 hover:border-[#C97C2B] hover:shadow-md hover:-translate-y-0.5 ${
                    roleCardsVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  }`}
                  style={{ transitionDelay: "400ms" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C97C2B]/10 group-hover:bg-[#C97C2B]/20 transition-colors flex-shrink-0">
                      <Users className="h-6 w-6 text-[#C97C2B]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#2B1B14]">I&apos;m a Teacher!</h3>
                  </div>
                  <p className="text-sm text-[#6B4F3F] pl-[60px]">Manage classes and track progress.</p>
                </button>
              </div>

              <p className="mt-8 text-center text-sm text-[#6B4F3F]">
                Already have an account?{" "}
                <Link href="/signin" className="font-medium text-[#C97C2B] hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          ) : (
            <div
              className={`rounded-2xl border border-[#E7D6C8] bg-white p-8 shadow-lg transition-all duration-700 ${
                formVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <button
                onClick={() => {
                  setRole(null);
                  setError(null);
                }}
                className="mb-4 text-sm text-[#C97C2B] hover:underline font-medium"
              >
                ← Change role
              </button>
              
              <div className="mb-6">
                <h2 className="mb-2 text-3xl font-bold text-[#2B1B14]">
                  Create your account
                </h2>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#C97C2B]/10 px-3 py-1">
                  <span className="text-xs font-medium text-[#6B4F3F]">Registering as:</span>
                  <span className="text-xs font-semibold capitalize text-[#C97C2B]">{role}</span>
                </div>
              </div>

              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium text-[#2B1B14]">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[#E7D6C8] bg-white px-4 text-sm text-[#2B1B14] placeholder:text-[#6B4F3F]/50 focus:border-[#C97C2B] focus:outline-none focus:ring-2 focus:ring-[#C97C2B]/20 transition-colors"
                  placeholder="Your name"
                />
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              )}

              {/* Email/password registration */}
              <RegisterForm role={role} name={name} />

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#E7D6C8]"></div>
                <span className="text-xs text-[#6B4F3F]">or</span>
                <div className="h-px flex-1 bg-[#E7D6C8]"></div>
              </div>

              <Button
                type="button"
                onClick={handleGoogleSignIn}
                variant="outline"
                className="h-11 w-full border-[#E7D6C8] text-[#6B4F3F] hover:bg-[#C97C2B]/5 focus:ring-2 focus:ring-[#C97C2B]/20 transition-all"
              >
                Continue with Google
              </Button>

              <p className="mt-8 text-center text-sm text-[#6B4F3F]">
                Already have an account?{" "}
                <Link href="/signin" className="font-medium text-[#C97C2B] hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}