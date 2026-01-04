"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import dynamic from "next/dynamic";

// Import the actual gameplay component from student/game
const StudentGamePlay = dynamic(
  () => import("@/app/student/game/page"),
  { ssr: false }
);

export default function GamePlay() {
  const [role, setRole] = useState<"student" | "teacher" | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadRole = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const db = getFirestore();
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!mounted) return;
        if (snap.exists()) {
          const data = snap.data() as any;
          if (data?.role === "teacher" || data?.role === "student") {
            setRole(data.role);
          } else {
            setRole(null);
          }
        }
      } catch (err) {
        console.error("Failed to load user role:", err);
      }
    };
    loadRole();
    return () => {
      mounted = false;
    };
  }, []);

  if (!role) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#FFF7ED] to-[#FEF3C7] text-[#2B1B14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 px-6 py-8 rounded-2xl border border-[#E7D6C8] bg-white/80 shadow-sm">
          <div className="h-10 w-10 rounded-full border-2 border-[#C97C2B]/40 border-t-[#C97C2B] animate-spin" aria-hidden="true" />
          <p className="text-lg font-semibold text-[#6B4F3F]">Loading game...</p>
        </div>
      </main>
    );
  }

  return <StudentGamePlay />;
}