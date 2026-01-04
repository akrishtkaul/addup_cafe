"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  onPasteResult?: (value: string) => void;
  onClose?: () => void;
}

export default function Calculator({ onPasteResult, onClose }: Props) {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);

  const inputNumber = (n: string) => {
    if (waiting) {
      setDisplay(n);
      setWaiting(false);
    } else {
      setDisplay(display === "0" ? n : display + n);
    }
  };
  const inputDecimal = () => {
    if (!display.includes(".")) setDisplay(display + ".");
  };
  const compute = (a: number, b: number, o: string) => {
    switch (o) {
      case "+":
        return a + b;
      case "−":
        return a - b;
      case "×":
        return a * b;
      case "÷":
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  };
  const chooseOp = (o: string) => {
    const cur = parseFloat(display);
    if (prev === null) setPrev(cur);
    else if (op) {
      const r = compute(prev, cur, op);
      setDisplay(String(r));
      setPrev(r);
    }
    setOp(o);
    setWaiting(true);
  };
  const pressEquals = () => {
    if (op && prev !== null) {
      const r = compute(prev, parseFloat(display), op);
      setDisplay(String(r));
      setPrev(null);
      setOp(null);
      setWaiting(true);
    }
  };
  const clearAll = () => {
    setDisplay("0");
    setPrev(null);
    setOp(null);
    setWaiting(false);
  };
  const pasteResult = () => {
    onPasteResult?.(display);
  };

  // High-contrast coffee theme (logic unchanged)
  const btnBase =
    "h-16 text-xl font-bold rounded-2xl border-2 shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2165D1]/40";
  const digitBtn = `${btnBase} bg-white text-[#2B1B14] border-[#C97C2B] hover:bg-[#FDF4E7]`;
  const operatorBtn = `${btnBase} bg-[#C97C2B] text-white border-[#B06A23] hover:bg-[#B06A23]`;
  const equalsBtn = `${btnBase} bg-[#2165D1] text-white border-[#184fa1] hover:bg-[#184fa1]`;
  const utilityBtn = `${btnBase} bg-red text-[#2B1B14] border-[#2165D1] press:bg-red-600`;

  const digits = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", "."];
  const operators = ["÷", "×", "−", "+"];

  const expressionLine =
    prev !== null
      ? `${prev} ${op ?? ""} ${waiting ? "" : display}`.trim()
      : display;

  return (
    <Card className="rounded-3xl border-2 border-[#E7D6C8] bg-white/95 shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-extrabold text-[#2165D1]">Calculator</h3>
        <div className="flex gap-3">
          <button
            className={`${utilityBtn} h-12 px-4 text-base font-extrabold bg-[#36A161] text-white border-[#2f8a54]`}
            onClick={pasteResult}
          >
            Paste
          </button>
          <button
            className={`${utilityBtn} h-12 px-4 text-base font-extrabold bg-[#C97C2B] text-white border-[#B06A23]`}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-[#C97C2B] bg-white shadow-inner px-4 py-4 text-right space-y-1">
        
        <div className="text-3xl font-extrabold text-[#2B1B14]">{expressionLine}</div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <button
          className={`${utilityBtn} bg-[#E53935] text-white border-[#c92e2a]`}
          onClick={clearAll}
        >
          C
        </button>
        {operators.map((o) => (
          <button key={o} className={operatorBtn} onClick={() => chooseOp(o)}>
            {o}
          </button>
        ))}

        {digits.map((d) => (
          <button
            key={d}
            className={digitBtn}
            onClick={() => (d === "." ? inputDecimal() : inputNumber(d))}
          >
            {d}
          </button>
        ))}

        <button className={equalsBtn} onClick={pressEquals}>
          =
        </button>
      </div>
    </Card>
  );
}