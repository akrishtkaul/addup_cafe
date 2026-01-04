"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  onContinue: (showAll?: boolean) => void;
}

export default function WaiterGreeting({ onContinue }: { onContinue: (showAll: boolean) => void }) {
  return (
    <div className="min-h-[520px] flex flex-col items-center justify-center text-center space-y-6 px-6">
      <div className="w-full max-w-xl rounded-3xl border-2 border-[#E7D6C8] bg-white/80 p-8 shadow-sm">
        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={() => onContinue(false)}
            className="w-full max-w-xs rounded-2xl border-2 border-[#E7D6C8] bg-white shadow hover:shadow-md transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2165D1]/30"
          >
            <img
              src="/waiter.png"
              alt="Waiter"
              className="mx-auto h-40 w-40 object-contain animate-pulse"
            />
          </button>

          <div className="space-y-2">
            <p className="text-2xl font-extrabold text-[#2B1B14]">
              Welcome to Add Up Café!
            </p>
            <p className="text-base text-slate-700">
              Pick what you want to order, then add up the total.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => onContinue(false)}
              className="flex-1 h-14 px-8 text-xl font-extrabold rounded-2xl bg-[#C97C2B] text-white shadow hover:bg-[#B06A23] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2165D1]/30 transition"
            >
              Start Ordering
            </button>
            <button
              onClick={() => onContinue(true)}
              className="flex-1 h-14 px-8 text-xl font-extrabold rounded-2xl bg-white text-[#2B1B14] border-2 border-[#C97C2B] shadow hover:bg-[#F8EFE5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2165D1]/30 transition"
            >
              Show More Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}