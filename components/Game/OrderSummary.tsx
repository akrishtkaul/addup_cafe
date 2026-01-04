"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MenuItem } from "./MenuList";

type Phase = "greeting" | "menu" | "placed" | "result";

interface OrderSummaryProps {
  menuItems: MenuItem[];
  order: { [key: string]: number };
  phase: Phase;
  userAnswer: string;
  setUserAnswer: (v: string) => void;
  feedback: string | null;
  checkAnswer: () => void;
  quitAndReveal: () => void;
  placeAnotherOrder: () => void;
  itemCount: number;
}

export default function OrderSummary({
  menuItems,
  order,
  phase,
  userAnswer,
  setUserAnswer,
  feedback,
  checkAnswer,
  quitAndReveal,
  placeAnotherOrder,
  itemCount,
}: OrderSummaryProps) {
  const orderedItems = Object.keys(order)
    .map((id) => {
      const item = menuItems.find((m) => m.id === id);
      return item ? { ...item, qty: order[id] } : null;
    })
    .filter(Boolean) as (MenuItem & { qty: number })[];

  return (
    <Card className="bg-white border-2 border-[#E7D6C8] rounded-2xl p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-[#2B1B14] mb-4">Your Order</h2>

      {itemCount === 0 ? (
        <p className="text-base text-[#6B4F3F]">No items yet. Add some from the menu!</p>
      ) : (
        <div className="space-y-3 mb-4">
          {orderedItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-base">
              <span className="text-[#2B1B14] font-medium">
                {item.qty}x {item.name}
              </span>
              <span className="text-[#6B4F3F] font-semibold">
                ${(item.price * item.qty).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}

      {phase === "placed" && (
        <div className="space-y-3 mt-6">
          <label className="block text-base font-semibold text-[#2B1B14]">Enter your total:</label>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="e.g. 35.50"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="h-12 text-lg border-2 border-[#E7D6C8] rounded-xl"
          />
          <div className="flex gap-3">
            <Button onClick={checkAnswer} className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 rounded-xl font-semibold">
              Check Answer
            </Button>
            <Button onClick={quitAndReveal} className="flex-1 bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl font-semibold">
              Quit
            </Button>
          </div>
          {feedback && (
            <Card className="bg-[#FFF7ED] border-2 border-[#E7D6C8] p-4 rounded-xl">
              <p className="text-base font-semibold text-[#2B1B14]">{feedback}</p>
            </Card>
          )}
        </div>
      )}

      {phase === "result" && feedback && (
        <div className="space-y-4 mt-6">
          <Card className="bg-[#FFF7ED] border-2 border-[#E7D6C8] p-4 rounded-xl">
            <p className="text-base font-semibold text-[#2B1B14]">{feedback}</p>
          </Card>
          <Button onClick={placeAnotherOrder} className="w-full bg-[#C97C2B] hover:bg-[#B06A23] text-white h-12 rounded-xl font-semibold">
            Place Another Order
          </Button>
        </div>
      )}
    </Card>
  );
}