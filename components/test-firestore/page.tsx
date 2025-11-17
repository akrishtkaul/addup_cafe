"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

type TestDoc = {
  id: string;
  createdAt: number;
  message: string;
};

export default function TestFirestorePage() {
  const [docs, setDocs] = useState<TestDoc[]>([]);

  const addTestDoc = async () => {
    await addDoc(collection(db, "testCollection"), {
      createdAt: Date.now(),
      message: "Hello from Add Up Café",
    });
    alert("Doc added!");
  };

  const loadDocs = async () => {
    const snapshot = await getDocs(collection(db, "testCollection"));
    const data: TestDoc[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<TestDoc, "id">),
    }));
    setDocs(data);
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Firestore Test</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={addTestDoc}
          className="px-3 py-2 border rounded text-sm"
        >
          Add test doc
        </button>
        <button
          onClick={loadDocs}
          className="px-3 py-2 border rounded text-sm"
        >
          Load docs
        </button>
      </div>

      <pre className="text-xs bg-black/80 text-white p-3 rounded overflow-x-auto">
        {JSON.stringify(docs, null, 2)}
      </pre>
    </main>
  );
}
