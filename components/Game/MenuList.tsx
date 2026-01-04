"use client";
import React from "react";
import { Button } from "@/components/ui/button";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
}

interface Props {
  menuItems: MenuItem[];
  visibleMenuItems: number;
  order: { [key: string]: number };
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
}

export default function MenuList({ menuItems, visibleMenuItems, order, addItem, removeItem }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-[#2B1B14]">Our Menu</h3>

      <div className="space-y-2">
        {menuItems.slice(0, visibleMenuItems).map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-[#E7D6C8] bg-white/80 px-4 py-3"
          >
            <div className="text-lg font-semibold text-[#2B1B14]">{item.name}</div>

            <div className="flex items-center gap-3">
              <div className="text-xl font-bold text-[#C97C2B]">${item.price.toFixed(2)}</div>

              <div className="flex items-center gap-2">
                {order[item.id] ? (
                  <>
                    <Button
                      onClick={() => removeItem(item.id)}
                      className="h-12 w-12 p-0 border border-[#C97C2B] text-[#C97C2B] bg-white hover:bg-[#C97C2B]/10 focus-visible:ring-2 focus-visible:ring-[#C97C2B]/40"
                    >
                      −
                    </Button>
                    <span className="min-w-[44px] h-10 rounded-full bg-[#C97C2B]/10 border border-[#C97C2B]/40 text-[#2B1B14] text-lg font-bold flex items-center justify-center">
                      {order[item.id]}
                    </span>
                  </>
                ) : null}
                <Button
                  onClick={() => addItem(item.id)}
                  className="h-12 w-12 p-0 bg-[#C97C2B] hover:bg-[#B06A23] text-white text-xl font-bold focus-visible:ring-2 focus-visible:ring-[#C97C2B]/40"
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}