"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Classroom = {
  id: string;
  name: string;
  code: string;
  createdAt: string;
};

export default function Page({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("teacher_classrooms_v1");
    if (!raw) return;
    try {
      const list: Classroom[] = JSON.parse(raw);
      const found = list.find((c) => c.id === id) || null;
      setClassroom(found);
    } catch {
      setClassroom(null);
    }
  }, [id]);

  if (!classroom) {
    return (
      <main className="min-h-screen bg-[#FFF3D4] flex items-center justify-center">
        <div className="max-w-xl w-full px-6">
          <Card className="p-6 text-center">
            <p className="text-slate-700">Classroom not found.</p>
            <div className="mt-4">
              <Button onClick={() => router.push("/teacher/dashboard")} className="bg-[#2165D1] text-white">Back to Dashboard</Button>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF3D4] text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          {/* Left: Start Session */}
          <div>
            <Button
              onClick={() => setSessionStarted((s) => !s)}
              className={`px-4 py-2 ${sessionStarted ? "bg-green-600 hover:bg-green-700" : "bg-[#FF6A00] hover:bg-[#e05500]"} text-white`}
            >
              {sessionStarted ? "End Session" : "Start Session"}
            </Button>
          </div>

          {/* Center: Classroom title */}
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold text-[#2165D1]">{classroom.name}</h2>
            <div className="text-sm text-slate-600">Code: <span className="font-mono text-[#FF9B42]">{classroom.code}</span></div>
          </div>

          {/* Right: Edit Level (coming soon) */}
          <div>
            <Button disabled className="opacity-60 cursor-not-allowed bg-slate-200 text-slate-600">
              Edit Level (Coming Soon)
            </Button>
          </div>
        </div>

        {/* Students table placeholder */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#2165D1]">Students</h3>
            <div className="text-sm text-slate-600">{students.length} students</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-slate-600">
                  <th className="py-2">Name</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-500">
                      No students yet. Students will appear here when they join.
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="py-3">{s.name}</td>
                      <td className="py-3">{sessionStarted ? "In Session" : "Idle"}</td>
                      <td className="py-3">
                        <Button className="bg-[#2165D1] text-white">View</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={() => router.push("/teacher/dashboard")} className="bg-slate-200">Back</Button>
            <Link href={`/teacher/classroom/${id}/manage`}>
              <Button className="bg-[#2165D1] text-white">Manage</Button>
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}