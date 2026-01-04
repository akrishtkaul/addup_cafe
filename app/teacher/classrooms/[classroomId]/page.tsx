"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { Coffee, Trash2 } from "lucide-react";
import { restaurantMenus } from "@/lib/restaurantMenus";

// Valid restaurants - using restaurantMenus as source of truth
const VALID_RESTAURANTS = Object.keys(restaurantMenus)
  .filter(key => key !== "asian-fusion") // Exclude legacy key
  .map(key => ({
    key,
    name: restaurantMenus[key].name
  }));

type Member = {
  uid: string;
  name: string;
  role: string;
  joinedAt: string;
};

type Session = {
  type: "assignment";
  restaurantKey: string;
  restaurantName: string;
  createdAt: string;
  isActive: boolean;
};

type Submission = {
  studentId: string;
  status: "in_progress" | "submitted";
  questionsAnswered: number;
  correctCount: number;
  updatedAt: string;
};

type MemberWithProgress = Member & {
  slot1Progress?: Submission;
  slot2Progress?: Submission;
};

export default function ClassroomPage() {
  const router = useRouter();
  const params = useParams();
  const classroomId = params.classroomId as string;

  const [loading, setLoading] = useState(true);
  const [classroom, setClassroom] = useState<{ name?: string; teacherId?: string } | null>(null);
  const [members, setMembers] = useState<MemberWithProgress[]>([]);
  const [sessions, setSessions] = useState<{ slot1?: Session; slot2?: Session }>({});
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Create assignment dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<"slot1" | "slot2">("slot1");
  const [createError, setCreateError] = useState<string | null>(null);

  // Delete assignment dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteSlot, setDeleteSlot] = useState<"slot1" | "slot2" | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Remove student dialog
  const [showRemoveStudentDialog, setShowRemoveStudentDialog] = useState(false);
  const [removeStudentId, setRemoveStudentId] = useState<string | null>(null);
  const [removeStudentName, setRemoveStudentName] = useState<string>("");
  const [removeStudentLoading, setRemoveStudentLoading] = useState(false);

  // Use ref to track if initial load is complete
  const initialLoadComplete = useRef(false);

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Polling for real-time updates
  useEffect(() => {
    const loadClassroom = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.replace("/signin");
        return;
      }

      try {
        // Load classroom
        const classroomSnap = await getDoc(doc(db, "classrooms", classroomId));
        if (!classroomSnap.exists()) {
          setError("Classroom not found");
          setLoading(false);
          return;
        }

        const classroomData = classroomSnap.data();
        
        // Verify teacher owns this classroom
        if (classroomData.teacherId !== user.uid) {
          setError("You don't have permission to view this classroom");
          setLoading(false);
          return;
        }

        setClassroom(classroomData);

        // Load members
        const membersSnap = await getDocs(
          collection(db, "classrooms", classroomId, "members")
        );
        const membersList: MemberWithProgress[] = [];
        for (const memberDoc of membersSnap.docs) {
          const memberData = memberDoc.data();
          membersList.push({
            uid: memberDoc.id,
            name: memberData.name || "Unknown",
            role: memberData.role,
            joinedAt: memberData.joinedAt,
          });
        }

        // Load sessions (slot1 and slot2)
        const sessionsRef = collection(db, "classrooms", classroomId, "sessions");
        const slot1Snap = await getDoc(doc(sessionsRef, "slot1"));
        const slot2Snap = await getDoc(doc(sessionsRef, "slot2"));

        const sessionData: { slot1?: Session; slot2?: Session } = {};
        if (slot1Snap.exists()) {
          sessionData.slot1 = slot1Snap.data() as Session;
        }
        if (slot2Snap.exists()) {
          sessionData.slot2 = slot2Snap.data() as Session;
        }

        // Load submissions for each member
        for (const member of membersList) {
          const slot1SubSnap = await getDoc(
            doc(
              db,
              "classrooms",
              classroomId,
              "sessions",
              "slot1",
              "submissions",
              member.uid
            )
          );
          const slot2SubSnap = await getDoc(
            doc(
              db,
              "classrooms",
              classroomId,
              "sessions",
              "slot2",
              "submissions",
              member.uid
            )
          );

          if (slot1SubSnap.exists()) {
            member.slot1Progress = slot1SubSnap.data() as Submission;
          }
          if (slot2SubSnap.exists()) {
            member.slot2Progress = slot2SubSnap.data() as Submission;
          }
        }

        // Update state without causing flicker
        setMembers(membersList);
        setSessions(sessionData);
        
        // Mark initial load as complete
        if (!initialLoadComplete.current) {
          initialLoadComplete.current = true;
          setLoading(false);
        }
      } catch (err: unknown) {
        console.error("Error loading classroom:", err);
        setError(err instanceof Error ? err.message : "Failed to load classroom");
        if (!initialLoadComplete.current) {
          setLoading(false);
        }
      }
    };

    if (classroomId) {
      loadClassroom();
      
      // Poll for updates every 5 seconds
      const interval = setInterval(loadClassroom, 5000);
      return () => clearInterval(interval);
    }
  }, [classroomId, router]);

  const handleCreateAssignment = async () => {
    setCreateError(null);
    
    if (!selectedRestaurant) {
      setCreateError("Please select a restaurant");
      return;
    }

    // Check if slot already has active assignment
    const slotData = sessions[selectedSlot];
    if (slotData?.isActive) {
      setCreateError(`${selectedSlot} already has an active assignment. Delete it first.`);
      return;
    }

    try {
      // Find the restaurant name from the valid list
      const restaurantData = VALID_RESTAURANTS.find(r => r.key === selectedRestaurant);
      if (!restaurantData) {
        setCreateError("Invalid restaurant selected");
        return;
      }

      const sessionRef = doc(
        db,
        "classrooms",
        classroomId,
        "sessions",
        selectedSlot
      );

      const newSession: Session = {
        type: "assignment",
        restaurantKey: selectedRestaurant,
        restaurantName: restaurantData.name,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      await setDoc(sessionRef, newSession);

      setSessions((prev) => ({
        ...prev,
        [selectedSlot]: newSession,
      }));

      setSelectedRestaurant("");
      setSelectedSlot("slot1");
      setShowCreateDialog(false);
      setSuccessMessage(`Assignment created: ${restaurantData.name} assigned to ${selectedSlot}`);
    } catch (err: unknown) {
      console.error("Error creating assignment:", err);
      setCreateError("Failed to create assignment. Please try again.");
    }
  };

  const handleDeleteAssignment = async () => {
    if (!deleteSlot) return;

    setDeleteLoading(true);
    try {
      const slotRef = doc(db, "classrooms", classroomId, "sessions", deleteSlot);
      const submissionsRef = collection(db, "classrooms", classroomId, "sessions", deleteSlot, "submissions");

      // Delete all submission docs for this slot (best effort cleanup)
      try {
        const submissionsSnap = await getDocs(submissionsRef);
        for (const subDoc of submissionsSnap.docs) {
          await deleteDoc(subDoc.ref);
        }
      } catch (subErr: unknown) {
        console.warn("Could not delete submissions (may not exist):", subErr);
      }

      // Delete the session doc itself
      await deleteDoc(slotRef);

      setSessions((prev) => {
        const updated = { ...prev };
        delete updated[deleteSlot as "slot1" | "slot2"];
        return updated;
      });

      setShowDeleteDialog(false);
      const slotName = deleteSlot;
      setDeleteSlot(null);
      setSuccessMessage(`Assignment removed from ${slotName}`);
    } catch (err: unknown) {
      console.error("Error deleting assignment:", err);
      setError("Failed to delete assignment. Please try again.");
      setShowDeleteDialog(false);
      setDeleteSlot(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRemoveStudent = async () => {
    if (!removeStudentId) return;

    setRemoveStudentLoading(true);
    try {
      // A) Delete membership doc
      await deleteDoc(doc(db, "classrooms", classroomId, "members", removeStudentId));

      // B) Delete student's joinedClassrooms index doc
      await deleteDoc(doc(db, "users", removeStudentId, "joinedClassrooms", classroomId));

      // C) Delete assignment submissions for slot1 and slot2 (best effort)
      for (const slotId of ["slot1", "slot2"]) {
        try {
          await deleteDoc(
            doc(db, "classrooms", classroomId, "sessions", slotId, "submissions", removeStudentId)
          );
        } catch (subErr: unknown) {
          // Ignore "not found" errors
          console.warn(`Submission not found for ${slotId}:`, subErr);
        }
      }

      // Update UI state - remove student from roster
      setMembers((prev) => prev.filter((m) => m.uid !== removeStudentId));

      const studentName = removeStudentName;
      setShowRemoveStudentDialog(false);
      setRemoveStudentId(null);
      setRemoveStudentName("");
      setSuccessMessage(`${studentName} has been removed from the classroom`);
    } catch (err: unknown) {
      console.error("Error removing student:", err);
      setError(err instanceof Error ? err.message : "Failed to remove student. Please try again.");
      setShowRemoveStudentDialog(false);
      setRemoveStudentId(null);
      setRemoveStudentName("");
    } finally {
      setRemoveStudentLoading(false);
    }
  };

  const canCreateAssignment = !sessions.slot1?.isActive || !sessions.slot2?.isActive;

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#FFF7ED] to-[#FEF3C7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 px-6 py-8 rounded-2xl border border-[#E7D6C8] bg-white/80 shadow-sm">
          <div className="h-10 w-10 rounded-full border-2 border-[#C97C2B]/40 border-t-[#C97C2B] animate-spin" />
          <p className="text-lg font-semibold text-[#6B4F3F]">Loading classroom...</p>
        </div>
      </main>
    );
  }

  if (error && !classroom) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#FFF7ED] to-[#FEF3C7] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="rounded-2xl border border-[#E7D6C8] bg-white p-8 shadow-sm">
            <p className="text-red-600 mb-6 text-lg font-medium">{error}</p>
            <Button 
              onClick={() => router.back()} 
              className="bg-[#C97C2B] hover:bg-[#B06A23] text-white h-12 px-8 text-base"
            >
              Go Back
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FFF7ED] to-[#FEF3C7] text-[#2B1B14]">
      {/* Header */}
      <header className="border-b border-[#E7D6C8] bg-white/60 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              className="text-[#C97C2B] hover:bg-[#C97C2B]/5 text-base"
            >
              ← Back
            </Button>
            <Coffee className="h-6 w-6 text-[#C97C2B]" />
            <h1 className="text-2xl font-bold text-[#2B1B14]">
              {classroom?.name || "Classroom"}
            </h1>
          </div>

          <Button
            onClick={() => setShowCreateDialog(true)}
            disabled={!canCreateAssignment}
            className="bg-[#C97C2B] hover:bg-[#B06A23] text-white disabled:opacity-60 h-11 px-6 text-base font-medium"
          >
            + Create Assignment
          </Button>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-base text-green-800 font-medium">{successMessage}</p>
          </div>
        )}
        {error && classroom && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-base text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Assignment Status Cards */}
        <div>
          <h2 className="text-2xl font-bold text-[#2B1B14] mb-4">Assignment Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["slot1", "slot2"].map((slot) => {
              const slotSession = sessions[slot as "slot1" | "slot2"];
              return (
                <Card key={slot} className="rounded-2xl border-2 border-[#E7D6C8] p-6 shadow-sm bg-white">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#2B1B14]">
                      {slot === "slot1" ? "Assignment 1" : "Assignment 2"}
                    </h3>
                    {slotSession && (
                      <Button
                        onClick={() => {
                          setDeleteSlot(slot as "slot1" | "slot2");
                          setShowDeleteDialog(true);
                        }}
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 p-2"
                        size="sm"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </div>

                  {slotSession ? (
                    <div className="space-y-2">
                      <p className="text-lg font-bold text-[#C97C2B]">
                        {slotSession.restaurantName}
                      </p>
                      <p className="text-sm text-[#6B4F3F]">
                        Key: {slotSession.restaurantKey}
                      </p>
                      <p className="text-sm text-[#6B4F3F]">
                        Created: {new Date(slotSession.createdAt).toLocaleDateString()}
                      </p>
                      <span className="inline-block mt-3 px-3 py-1 bg-[#C97C2B]/20 text-[#C97C2B] text-sm font-semibold rounded-full">
                        Active
                      </span>
                    </div>
                  ) : (
                    <p className="text-lg text-[#6B4F3F]">No assignment</p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Students Section */}
        <div>
          <h2 className="text-2xl font-bold text-[#2B1B14] mb-4">Student Progress</h2>
          
          {members.length === 0 ? (
            <Card className="rounded-2xl border-2 border-[#E7D6C8] bg-white p-8 text-center shadow-sm">
              <p className="text-lg text-[#6B4F3F]">No students joined yet</p>
            </Card>
          ) : (
            <Card className="rounded-2xl border-2 border-[#E7D6C8] overflow-hidden shadow-sm bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#C97C2B]/10 border-b-2 border-[#E7D6C8]">
                    <tr>
                      <th className="px-6 py-4 text-left text-base font-bold text-[#2B1B14]">
                        Student
                      </th>
                      <th className="px-6 py-4 text-left text-base font-bold text-[#2B1B14]">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-left text-base font-bold text-[#2B1B14]">
                        {sessions.slot1 ? sessions.slot1.restaurantName : "Assignment 1"}
                      </th>
                      <th className="px-6 py-4 text-left text-base font-bold text-[#2B1B14]">
                        {sessions.slot2 ? sessions.slot2.restaurantName : "Assignment 2"}
                      </th>
                      <th className="px-6 py-4 text-right text-base font-bold text-[#2B1B14]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, idx) => (
                      <tr
                        key={member.uid}
                        className={idx % 2 === 0 ? "bg-white" : "bg-[#FFF7ED]/50"}
                      >
                        <td className="px-6 py-4 text-base font-semibold text-[#2B1B14]">
                          {member.name}
                        </td>
                        <td className="px-6 py-4 text-base text-[#6B4F3F]">
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-base">
                          {member.slot1Progress ? (
                            <div className="space-y-2">
                              <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">
                                {member.slot1Progress.correctCount} / {member.slot1Progress.questionsAnswered}
                              </span>
                              <div className="text-sm text-[#6B4F3F] capitalize">
                                {member.slot1Progress.status}
                              </div>
                              {member.slot1Progress.status === "submitted" && (
                                <div className="text-sm font-bold text-green-600">
                                  ✓ Complete
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[#6B4F3F]">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-base">
                          {member.slot2Progress ? (
                            <div className="space-y-2">
                              <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-bold">
                                {member.slot2Progress.correctCount} / {member.slot2Progress.questionsAnswered}
                              </span>
                              <div className="text-sm text-[#6B4F3F] capitalize">
                                {member.slot2Progress.status}
                              </div>
                              {member.slot2Progress.status === "submitted" && (
                                <div className="text-sm font-bold text-green-600">
                                  ✓ Complete
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[#6B4F3F]">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            onClick={() => {
                              setRemoveStudentId(member.uid);
                              setRemoveStudentName(member.name);
                              setShowRemoveStudentDialog(true);
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Create Assignment Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md rounded-2xl border-[#E7D6C8] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#2B1B14]">Create Assignment</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            <div>
              <label className="mb-2 block text-base font-semibold text-[#2B1B14]">
                Restaurant *
              </label>
              <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                <SelectTrigger className="h-11 text-base border-[#E7D6C8] focus:border-[#C97C2B]">
                  <SelectValue placeholder="Select a restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {VALID_RESTAURANTS.map((restaurant) => (
                    <SelectItem key={restaurant.key} value={restaurant.key} className="text-base">
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-base font-semibold text-[#2B1B14]">
                Assignment Slot *
              </label>
              <Select value={selectedSlot} onValueChange={(value) => setSelectedSlot(value as "slot1" | "slot2")}>
                <SelectTrigger className="h-11 text-base border-[#E7D6C8] focus:border-[#C97C2B]">
                  <SelectValue placeholder="Select a slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slot1" disabled={sessions.slot1?.isActive} className="text-base">
                    Assignment 1 {sessions.slot1?.isActive ? "(Active)" : ""}
                  </SelectItem>
                  <SelectItem value="slot2" disabled={sessions.slot2?.isActive} className="text-base">
                    Assignment 2 {sessions.slot2?.isActive ? "(Active)" : ""}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {createError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-base text-red-600 font-medium">{createError}</p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6 flex gap-3 justify-end">
            <Button
              onClick={() => {
                setShowCreateDialog(false);
                setCreateError(null);
                setSelectedRestaurant("");
                setSelectedSlot("slot1");
              }}
              variant="outline"
              className="border-[#E7D6C8] text-[#6B4F3F] hover:bg-[#C97C2B]/5 h-11 text-base"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAssignment}
              className="bg-[#C97C2B] hover:bg-[#B06A23] text-white disabled:opacity-60 h-11 text-base font-medium"
              disabled={!selectedRestaurant}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Assignment Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl border-[#E7D6C8] bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-[#2B1B14]">Delete Assignment?</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-[#6B4F3F]">
              This will delete the assignment from <strong>{deleteSlot}</strong> and all student submissions for this assignment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end mt-6">
            <AlertDialogCancel className="border-[#E7D6C8] text-[#6B4F3F] hover:bg-[#C97C2B]/5 h-11 text-base">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAssignment}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white h-11 text-base"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Student Confirmation Dialog */}
      <AlertDialog open={showRemoveStudentDialog} onOpenChange={setShowRemoveStudentDialog}>
        <AlertDialogContent className="rounded-2xl border-[#E7D6C8] bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-[#2B1B14]">Remove Student?</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-[#6B4F3F]">
              This will remove <strong>{removeStudentName}</strong> from the classroom and delete all their assignment submissions. They will need to rejoin using the classroom code if they want to come back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end mt-6">
            <AlertDialogCancel className="border-[#E7D6C8] text-[#6B4F3F] hover:bg-[#C97C2B]/5 h-11 text-base">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveStudent}
              disabled={removeStudentLoading}
              className="bg-red-600 hover:bg-red-700 text-white h-11 text-base"
            >
              {removeStudentLoading ? "Removing..." : "Remove Student"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}