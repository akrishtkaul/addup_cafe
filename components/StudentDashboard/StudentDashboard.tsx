"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Coffee, Settings } from "lucide-react";

type Assignment = {
  restaurantName: string;
  restaurantKey: string;
  isActive: boolean;
};

type JoinedClassroom = {
  classroomId: string;
  name?: string;
  code: string;
  teacherId: string;
  joinedAt: string;
  slot1?: Assignment;
  slot2?: Assignment;
  slot1Progress?: { status: string; correctCount: number; questionsAnswered: number };
  slot2Progress?: { status: string; correctCount: number; questionsAnswered: number };
};

export default function StudentDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("Student");
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState<JoinedClassroom[]>([]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.replace("/signin");
        return;
      }
      
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data() as unknown as { name?: string; role?: string };
          setUserName(data?.name || user.displayName || "Student");
          if (data?.role !== "student") {
            router.replace("/teacher/dashboard");
            setLoading(false);
            return;
          }
        } else {
          setUserName(user.displayName || "Student");
          router.replace("/signin");
          setLoading(false);
          return;
        }

        // Query user's joinedClassrooms index
        const joinedRef = collection(db, "users", user.uid, "joinedClassrooms");
        const joinedSnaps = await getDocs(joinedRef);

        const joinedClassrooms: JoinedClassroom[] = [];
        for (const joinedDoc of joinedSnaps.docs) {
          const joinedData = joinedDoc.data();
          const classroomId = joinedData.classroomId || joinedDoc.id;

          try {
            const classSnap = await getDoc(doc(db, "classrooms", classroomId));
            if (!classSnap.exists()) {
              continue;
            }

            const classData = classSnap.data();
            
            // Load assignments from slot1 and slot2
            const slot1Snap = await getDoc(
              doc(db, "classrooms", classroomId, "sessions", "slot1")
            );
            const slot2Snap = await getDoc(
              doc(db, "classrooms", classroomId, "sessions", "slot2")
            );

            const slot1Data = slot1Snap.exists() ? (slot1Snap.data() as Assignment) : undefined;
            const slot2Data = slot2Snap.exists() ? (slot2Snap.data() as Assignment) : undefined;

            // Load student's progress for each slot
            const slot1SubSnap = slot1Data
              ? await getDoc(
                  doc(db, "classrooms", classroomId, "sessions", "slot1", "submissions", user.uid)
                )
              : null;

            const slot2SubSnap = slot2Data
              ? await getDoc(
                  doc(db, "classrooms", classroomId, "sessions", "slot2", "submissions", user.uid)
                )
              : null;

            joinedClassrooms.push({
              classroomId,
              name: classData.name,
              code: joinedData.joinCode || classData.code,
              teacherId: classData.teacherId,
              joinedAt: joinedData.joinedAt,
              slot1: slot1Data,
              slot2: slot2Data,
              slot1Progress: slot1SubSnap?.exists() ? slot1SubSnap.data() : undefined,
              slot2Progress: slot2SubSnap?.exists() ? slot2SubSnap.data() : undefined,
            });
          } catch (classErr: unknown) {
            console.error("Failed to load classroom", classroomId, classErr);
          }
        }

        setJoined(joinedClassrooms);
      } catch (e: unknown) {
        console.error("Error loading classrooms:", e);
        setError(e instanceof Error ? e.message : "Failed to load classrooms.");
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/");
    } catch (e: unknown) {
      console.error(e);
    }
  };

  const handleJoin = async () => {
    setError(null);
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      setError("Enter a classroom code.");
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      router.replace("/signin");
      return;
    }

    try {
      const codeSnap = await getDoc(doc(db, "classroomCodes", code));
      if (!codeSnap.exists()) {
        setError("Invalid code. Please check with your teacher.");
        return;
      }
      const { classroomId, teacherId } = codeSnap.data() as {
        classroomId: string;
        teacherId: string;
      };

      // Check if already joined via user's index
      const existingJoin = await getDoc(
        doc(db, "users", user.uid, "joinedClassrooms", classroomId)
      );
      if (existingJoin.exists()) {
        setError("You've already joined this classroom.");
        return;
      }

      const joinedAt = new Date().toISOString();

      // Get user's name from profile
      const userDocSnap = await getDoc(doc(db, "users", user.uid));
      const studentName = userDocSnap.exists()
        ? (userDocSnap.data()?.name || user.displayName || "Student")
        : user.displayName || "Student";

      // Write to members subcollection WITH name field
      await setDoc(
        doc(db, "classrooms", classroomId, "members", user.uid),
        {
          role: "student",
          joinedAt,
          joinCode: code,
          studentId: user.uid,
          name: studentName,
        },
        { merge: false }
      );

      // Write to user's joinedClassrooms index
      await setDoc(
        doc(db, "users", user.uid, "joinedClassrooms", classroomId),
        {
          classroomId,
          joinedAt,
          joinCode: code,
        },
        { merge: false }
      );

      // Fetch classroom to include name in local state
      const classSnap = await getDoc(doc(db, "classrooms", classroomId));
      const classData = classSnap.exists() ? classSnap.data() : undefined;

      // Fetch assignments from sessions
      const slot1Snap = await getDoc(
        doc(db, "classrooms", classroomId, "sessions", "slot1")
      );
      const slot2Snap = await getDoc(
        doc(db, "classrooms", classroomId, "sessions", "slot2")
      );

      const slot1Data = slot1Snap.exists() ? (slot1Snap.data() as Assignment) : undefined;
      const slot2Data = slot2Snap.exists() ? (slot2Snap.data() as Assignment) : undefined;

      // Update local state
      setJoined((prev) => [
        ...prev,
        {
          classroomId,
          name: classData?.name,
          code,
          teacherId,
          joinedAt,
          slot1: slot1Data,
          slot2: slot2Data,
        },
      ]);
      setJoinCode("");
    } catch (e: unknown) {
      console.error("Failed to join:", e);
      setError("Failed to join. Please try again.");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#FFF7ED] to-[#FEF3C7] flex items-center justify-center">
        <p className="text-[#6B4F3F] text-lg">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FFF7ED] to-[#FEF3C7] text-[#2B1B14]">
      {/* Header */}
      <header className="border-b border-[#E7D6C8] bg-white/60 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <Coffee className="h-8 w-8 text-[#C97C2B]" />
            <div>
              <span className="text-2xl font-semibold tracking-tight text-[#2B1B14]">
                Add Up Café
              </span>
              <div className="text-xl text-[#C97C2B] font-medium">Hi, {userName}!</div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="h-14 w-14 border-[#E7D6C8] text-[#6B4F3F] hover:bg-[#C97C2B]/5"
              >
                <Settings className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-[#E7D6C8]">
              <DropdownMenuItem 
                onClick={() => router.push("/settings")}
                className="cursor-pointer text-lg py-3 px-4"
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 cursor-pointer text-lg py-3 px-4"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Top Actions Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Join a Class Card */}
          <Card className="rounded-2xl border-2 border-[#E7D6C8] bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-[#2B1B14] mb-3">Join a Class</h2>
            <p className="text-lg text-[#6B4F3F] mb-6">
              Ask your teacher for a code
            </p>

            <div className="space-y-4">
              <Input
                placeholder="Enter classroom code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="h-14 text-lg border-[#E7D6C8] focus:border-[#C97C2B] focus:ring-2 focus:ring-[#C97C2B]/20 placeholder:text-base"
              />
              <Button
                onClick={handleJoin}
                disabled={!joinCode.trim()}
                className="w-full h-14 bg-[#C97C2B] text-white hover:bg-[#B06A23] text-lg font-semibold"
              >
                Join Class
              </Button>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-lg text-red-800">{error}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Practice Card */}
          <Card className="rounded-2xl border-2 border-[#C97C2B] bg-gradient-to-br from-[#C97C2B] to-[#B06A23] p-8 shadow-lg text-white">
            <h2 className="text-2xl font-bold mb-3">Practice Mode</h2>
            <p className="text-lg opacity-90 mb-6">
              Play anytime to practice your addition skills
            </p>

            <Button
              asChild
              className="w-full h-14 bg-white text-[#C97C2B] hover:bg-white/90 text-lg font-semibold"
            >
              <Link href="/game">
                🎮 Practice Now
              </Link>
            </Button>
          </Card>
        </div>

        {/* My Classes Section */}
        <div>
          <h3 className="text-3xl font-bold text-[#2B1B14] mb-6">My Classes</h3>

          {joined.length === 0 ? (
            <Card className="rounded-2xl border-2 border-[#E7D6C8] bg-white p-12 text-center shadow-sm">
              <p className="text-2xl text-[#6B4F3F] font-medium">
                No classes yet. Join one to get started!
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {joined.map((info) => {
                const slot1Active = info.slot1?.isActive === true;
                const slot1Href = slot1Active ? `/game/play?mode=assignment&classroomId=${encodeURIComponent(info.classroomId)}&slot=slot1` : "";
                
                const slot2Active = info.slot2?.isActive === true;
                const slot2Href = slot2Active ? `/game/play?mode=assignment&classroomId=${encodeURIComponent(info.classroomId)}&slot=slot2` : "";

                return (
                  <Card key={info.classroomId} className="rounded-2xl border-2 border-[#E7D6C8] bg-white p-8 shadow-lg">
                    {/* Class Header */}
                    <div className="mb-6 pb-6 border-b-2 border-[#E7D6C8]">
                      <h4 className="text-3xl font-bold text-[#2B1B14] mb-3">
                        {info.name || info.classroomId}
                      </h4>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-lg font-medium text-[#6B4F3F]">Code:</span>
                        <div className="rounded-xl bg-[#C97C2B]/10 px-4 py-2 border border-[#C97C2B]">
                          <span className="font-mono text-2xl font-bold text-[#C97C2B]">
                            {info.code}
                          </span>
                        </div>
                      </div>
                      <p className="text-lg text-[#6B4F3F]">
                        Joined: {new Date(info.joinedAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Assignments */}
                    {(slot1Active || slot2Active) ? (
                      <div className="space-y-4">
                        {slot1Active && (
                          <div className="rounded-xl bg-blue-50 border-2 border-blue-300 p-6">
                            <div className="text-2xl font-bold text-blue-900 mb-3">
                              {info.slot1?.restaurantName}
                            </div>
                            {info.slot1Progress ? (
                              <div className="text-lg text-blue-800 mb-4 font-medium">
                                Progress: {info.slot1Progress.correctCount}/{info.slot1Progress.questionsAnswered} correct
                              </div>
                            ) : (
                              <div className="text-lg text-blue-800 mb-4 font-medium">Not started yet</div>
                            )}
                            <Button
                              asChild
                              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold"
                            >
                              <Link href={slot1Href}>
                                {info.slot1Progress ? "Continue →" : "Start →"}
                              </Link>
                            </Button>
                          </div>
                        )}

                        {slot2Active && (
                          <div className="rounded-xl bg-green-50 border-2 border-green-300 p-6">
                            <div className="text-2xl font-bold text-green-900 mb-3">
                              {info.slot2?.restaurantName}
                            </div>
                            {info.slot2Progress ? (
                              <div className="text-lg text-green-800 mb-4 font-medium">
                                Progress: {info.slot2Progress.correctCount}/{info.slot2Progress.questionsAnswered} correct
                              </div>
                            ) : (
                              <div className="text-lg text-green-800 mb-4 font-medium">Not started yet</div>
                            )}
                            <Button
                              asChild
                              className="w-full h-14 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold"
                            >
                              <Link href={slot2Href}>
                                {info.slot2Progress ? "Continue →" : "Start →"}
                              </Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xl text-[#6B4F3F] font-medium">
                        No assignments available yet. Check back soon!
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Section */}
        <Card className="rounded-2xl border-2 border-[#E7D6C8] bg-white p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-[#2B1B14] mb-6">How It Works</h3>
          <div className="space-y-4 text-lg text-[#6B4F3F]">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#C97C2B]/20 text-xl font-bold text-[#C97C2B]">
                1
              </div>
              <p className="pt-1">Get a classroom code from your teacher</p>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#C97C2B]/20 text-xl font-bold text-[#C97C2B]">
                2
              </div>
              <p className="pt-1">Join the class using the code above</p>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#C97C2B]/20 text-xl font-bold text-[#C97C2B]">
                3
              </div>
              <p className="pt-1">Complete your assignments and track your progress</p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}