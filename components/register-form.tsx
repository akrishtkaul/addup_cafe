"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

type RegisterFormProps = {
  role: "student" | "teacher";
  name: string;
};

export function RegisterForm({ role, name }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);

    try {
      // 1) Create auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2) Write user doc to Firestore
      await setDoc(doc(db, "users", user.uid), {
        role,
        name: name.trim(),
      });

      // 3) Redirect to appropriate dashboard
      router.replace(role === "student" ? "/student/dashboard" : "/teacher/dashboard");
    } catch (err: unknown) {
      console.error("Registration error:", err);
      
      const errorCode = err && typeof err === 'object' && 'code' in err ? err.code : null;
      const errorMessage = err && typeof err === 'object' && 'message' in err ? String(err.message) : null;

      if (errorCode === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in instead.");
      } else if (errorCode === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (errorCode === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(errorMessage ?? "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-[#2B1B14]">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 w-full rounded-lg border border-[#E7D6C8] bg-white px-4 text-sm text-[#2B1B14] placeholder:text-[#6B4F3F]/50 focus:border-[#C97C2B] focus:outline-none focus:ring-2 focus:ring-[#C97C2B]/20"
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
          className="h-11 w-full rounded-lg border border-[#E7D6C8] bg-white px-4 text-sm text-[#2B1B14] placeholder:text-[#6B4F3F]/50 focus:border-[#C97C2B] focus:outline-none focus:ring-2 focus:ring-[#C97C2B]/20"
          placeholder="At least 6 characters"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || !name.trim()}
        className="h-11 w-full bg-[#C97C2B] text-white font-medium hover:bg-[#B06A23] focus:ring-2 focus:ring-[#C97C2B]/40 disabled:opacity-60"
      >
        {loading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}