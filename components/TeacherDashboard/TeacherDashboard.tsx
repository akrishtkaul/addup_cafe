"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { doc, getDoc, setDoc, collection, addDoc, deleteDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Coffee, Copy, Trash2, Settings, Play } from "lucide-react";

type Classroom = {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  teacherId: string;
};

function genCode(length = 6) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [className, setClassName] = useState("");
  const [userName, setUserName] = useState<string | null>(null);
  const [, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/signin");
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserName(data.name || user.displayName || "Teacher");
          setUserRole(data.role || "teacher");
          if (data.role !== "teacher") {
            router.replace("/student/dashboard");
            setLoading(false);
            return;
          }
        } else {
          setUserName(user.displayName || "Teacher");
          router.replace("/signin");
          setLoading(false);
          return;
        }

        // Load classrooms from Firestore
        const classroomsQuery = query(
          collection(db, "classrooms"),
          where("teacherId", "==", user.uid)
        );
        const classroomsSnap = await getDocs(classroomsQuery);
        const loadedClassrooms: Classroom[] = [];
        classroomsSnap.forEach((doc) => {
          loadedClassrooms.push({ id: doc.id, ...doc.data() } as Classroom);
        });
        setClassrooms(loadedClassrooms.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      } catch (err) {
        console.error("Error loading user data:", err);
        setUserName(user.displayName || "Teacher");
      }
      setLoading(false);
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadUserData();
      } else {
        router.push("/signin");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (e) {
      console.error(e);
    }
  };

  const createClassroom = async () => {
    setError(null);
    if (!className.trim()) {
      setError("Please enter a classroom name.");
      return;
    }
    if (classrooms.length >= 5) {
      setError("You can have at most 5 classrooms.");
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    try {
      const existing = new Set(classrooms.map((c) => c.code));
      let code = genCode();
      let attempts = 0;
      while (existing.has(code) && attempts++ < 10) code = genCode();

      const newClassroom = {
        name: className.trim(),
        code,
        createdAt: new Date().toISOString(),
        teacherId: user.uid,
      };

      const docRef = await addDoc(collection(db, "classrooms"), newClassroom);

      // Create code lookup doc (doc id = code, fields = classroomId + teacherId only)
      await setDoc(doc(db, "classroomCodes", code), {
        classroomId: docRef.id,
        teacherId: user.uid,
      });

      setClassrooms((s) => [{ id: docRef.id, ...newClassroom }, ...s]);
      setClassName("");
    } catch (err) {
      console.error("Error creating classroom:", err);
      setError("Failed to create classroom. Please try again.");
    }
  };

  const removeClassroom = async (id: string) => {
    try {
      // Find classroom to get its code
      const classroom = classrooms.find((c) => c.id === id);
      const code = classroom?.code;

      // Delete classroom doc
      await deleteDoc(doc(db, "classrooms", id));

      // Delete code lookup doc if present
      if (code) {
        await deleteDoc(doc(db, "classroomCodes", code));
      }

      setClassrooms((s) => s.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error deleting classroom:", err);
      setError("Failed to delete classroom. Please try again.");
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteId) removeClassroom(deleteId);
    setConfirmOpen(false);
    setDeleteId(null);
  };

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#FFF7ED] to-[#FEF3C7] flex items-center justify-center">
        <p className="text-[#6B4F3F]">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FFF7ED] to-[#FEF3C7] text-[#2B1B14]">
      {/* Header */}
      <header className="border-b border-[#E7D6C8] bg-white/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Coffee className="h-6 w-6 text-[#C97C2B]" />
            <div>
              <span className="text-lg font-semibold tracking-tight text-[#2B1B14]">
                Add Up Café
              </span>
              <span className="ml-2 text-xs text-[#6B4F3F]">Teacher Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-full bg-[#C97C2B]/10 px-4 py-2">
              <span className="text-sm font-medium text-[#2B1B14]">Welcome, {userName}!</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-[#6B4F3F] hover:bg-[#C97C2B]/5">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-[#E7D6C8]">
                <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Create Classroom Bar */}
            <Card className="rounded-2xl border border-[#E7D6C8] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#2B1B14] mb-1">Create a Classroom</h2>
                  <p className="text-sm text-[#6B4F3F]">Share the code with your students to get started</p>
                </div>
                
                <div className="flex gap-3 sm:flex-row flex-col sm:items-end">
                  <div className="flex-1 sm:w-64">
                    <Input
                      placeholder="Classroom name (e.g., Math 4A)"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="h-11 border-[#E7D6C8] focus:border-[#C97C2B] focus:ring-2 focus:ring-[#C97C2B]/20"
                    />
                  </div>
                  <Button 
                    onClick={createClassroom} 
                    className="h-11 bg-[#C97C2B] text-white hover:bg-[#B06A23] whitespace-nowrap" 
                    disabled={!className.trim() || classrooms.length >= 5}
                  >
                    Create
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-[#6B4F3F]">{classrooms.length}/5 classrooms used</p>
                {error && <p className="text-xs text-red-600">{error}</p>}
              </div>
            </Card>

            {/* Classrooms Grid */}
            <div>
              <h3 className="text-lg font-semibold text-[#2B1B14] mb-4">Your Classrooms</h3>
              {classrooms.length === 0 ? (
                <Card className="rounded-2xl border border-[#E7D6C8] bg-white p-12 text-center shadow-sm">
                  <p className="text-[#6B4F3F]">No classrooms yet. Create one to get started!</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {classrooms.map((c) => (
                    <Card key={c.id} className="rounded-2xl border border-[#E7D6C8] bg-white p-6 shadow-sm relative group hover:shadow-md transition-shadow">
                      {/* Trash Button */}
                      <button
                        onClick={() => confirmDelete(c.id)}
                        className="absolute top-4 right-4 rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        aria-label={`Delete classroom ${c.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div className="space-y-4">
                        {/* Name */}
                        <div>
                          <h4 className="font-semibold text-[#2B1B14] text-lg mb-1 pr-8">{c.name}</h4>
                          <p className="text-xs text-[#6B4F3F]">Created {new Date(c.createdAt).toLocaleDateString()}</p>
                        </div>

                        {/* Join Code */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-lg bg-[#C97C2B]/10 px-3 py-2">
                            <p className="text-xs text-[#6B4F3F] mb-0.5">Join Code</p>
                            <p className="font-mono text-lg font-bold text-[#C97C2B]">{c.code}</p>
                          </div>
                          <Button
                            onClick={() => copyCode(c.code)}
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 text-[#6B4F3F] hover:bg-[#C97C2B]/5"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            onClick={() => router.push(`/teacher/classrooms/${c.id}`)} 
                            className="flex-1 bg-[#C97C2B] text-white hover:bg-[#B06A23] h-10 text-sm"
                          >
                            View Classroom
                          </Button>
                          <Button
                            onClick={() => copyCode(c.code)}
                            variant="outline"
                            className="border-[#E7D6C8] text-[#6B4F3F] hover:bg-[#C97C2B]/5 h-10 text-sm"
                          >
                            Copy Code
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="rounded-2xl border border-[#E7D6C8] bg-gradient-to-br from-[#C97C2B] to-[#B06A23] p-6 text-white shadow-md">
              <h3 className="mb-2 text-lg font-semibold">Quick Actions</h3>
              <p className="mb-4 text-sm opacity-90">Try the game yourself!</p>
              <Button 
                onClick={() => router.push("/game")} 
                className="w-full bg-white text-[#C97C2B] font-semibold hover:bg-white/90 h-11"
              >
                <Play className="h-4 w-4 mr-2" />
                Play Now
              </Button>
            </Card>

            {/* How to Use */}
            <Card className="rounded-2xl border border-[#E7D6C8] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-base font-semibold text-[#2B1B14]">How to Use</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#C97C2B]/20 text-xs font-bold text-[#C97C2B]">
                    1
                  </span>
                  <p className="text-sm text-[#6B4F3F]">Create a classroom and share the code</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#C97C2B]/20 text-xs font-bold text-[#C97C2B]">
                    2
                  </span>
                  <p className="text-sm text-[#6B4F3F]">Monitor student progress and assignments</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#C97C2B]/20 text-xs font-bold text-[#C97C2B]">
                    3
                  </span>
                  <p className="text-sm text-[#6B4F3F]">Delete classrooms when finished</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md rounded-2xl border-[#E7D6C8]">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#2B1B14]">Delete Classroom?</DialogTitle>
            <DialogDescription className="text-[#6B4F3F]">
              Are you sure you want to delete this classroom? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <p className="text-sm font-medium text-[#2B1B14]">
              {deleteId ? `Classroom: ${classrooms.find((x) => x.id === deleteId)?.name || ""}` : ""}
            </p>
          </div>

          <DialogFooter className="mt-6 flex gap-2 justify-end">
            <Button 
              onClick={() => setConfirmOpen(false)} 
              variant="outline"
              className="border-[#E7D6C8] text-[#6B4F3F] hover:bg-[#C97C2B]/5"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}