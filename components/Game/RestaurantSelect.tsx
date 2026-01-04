"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Coffee, Utensils, Soup, Leaf, Fish, Flame, Salad, Pizza } from "lucide-react";
import { restaurantMenus } from "@/lib/restaurantMenus";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const restaurants: Restaurant[] = [
  {
    id: "america-cafe",
    name: restaurantMenus["america-cafe"].name,
    description: "American comfort food favorites",
    cuisine: "American",
    Icon: Coffee,
  },
  {
    id: "italian-trattoria",
    name: restaurantMenus["italian-trattoria"].name,
    description: "Classic Italian dishes",
    cuisine: "Italian",
    Icon: Pizza,
  },
  {
    id: "mexican-cantina",
    name: restaurantMenus["mexican-cantina"].name,
    description: "Authentic Mexican cuisine",
    cuisine: "Mexican",
    Icon: Utensils,
  },
  {
    id: "chinese-kitchen",
    name: restaurantMenus["chinese-kitchen"].name,
    description: "Traditional Chinese dishes",
    cuisine: "Chinese",
    Icon: Soup,
  },
  {
    id: "thai-kitchen",
    name: restaurantMenus["thai-kitchen"].name,
    description: "Flavorful Thai specialties",
    cuisine: "Thai",
    Icon: Leaf,
  },
  {
    id: "japanese-grill",
    name: restaurantMenus["japanese-grill"].name,
    description: "Japanese grilled favorites",
    cuisine: "Japanese",
    Icon: Fish,
  },
  {
    id: "indian-canteen",
    name: restaurantMenus["indian-canteen"].name,
    description: "Aromatic Indian cuisine",
    cuisine: "Indian",
    Icon: Flame,
  },
  {
    id: "mediterranean-bistro",
    name: restaurantMenus["mediterranean-bistro"].name,
    description: "Fresh Mediterranean fare",
    cuisine: "Mediterranean",
    Icon: Salad,
  },
];

export default function RestaurantSelect() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSelectRestaurant = (restaurantId: string) => {
    router.push(`/game/play?restaurant=${restaurantId}`);
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350; // Width of card + gap
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FFF7ED] to-[#FEF3C7] text-[#2B1B14]">
      {/* Header */}
      <header className="border-b border-[#E7D6C8] bg-white/70 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C97C2B]/15 text-xs font-semibold text-[#C97C2B] shadow-sm">
              AC
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold tracking-tight text-[#2B1B14]">
                Add Up Café
              </span>
              <span className="text-xs text-[#6B4F3F]">Choose your restaurant</span>
            </div>
          </div>
          <Link href="/student/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="border-[#E7D6C8] text-[#6B4F3F] hover:bg-[#C97C2B]/5"
            >
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#2B1B14] mb-3">
            Choose Your Restaurant
          </h1>
          <p className="text-lg text-[#6B4F3F]">
            Pick a menu to start practicing your addition skills.
          </p>
        </div>

        {/* Horizontal Scrolling Container with Buttons */}
        <div className="relative">
          {/* Left Scroll Button */}
          <Button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-[#C97C2B]/10 text-[#C97C2B] border-2 border-[#C97C2B] rounded-full w-12 h-12 p-0 shadow-lg"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          {/* Right Scroll Button */}
          <Button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-[#C97C2B]/10 text-[#C97C2B] border-2 border-[#C97C2B] rounded-full w-12 h-12 p-0 shadow-lg"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide px-12"
          >
            {restaurants.map((restaurant) => (
              <Card
                key={restaurant.id}
                className="flex-shrink-0 w-80 snap-center bg-white border-2 border-[#E7D6C8] hover:border-[#C97C2B] hover:shadow-md transition-all cursor-pointer rounded-2xl"
                onClick={() => handleSelectRestaurant(restaurant.id)}
              >
                <div className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#C97C2B]/10 text-[#C97C2B]">
                    <restaurant.Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#2B1B14] mb-1">
                      {restaurant.name}
                    </h3>
                    <p className="text-base text-[#6B4F3F] font-medium mb-1">
                      {restaurant.cuisine}
                    </p>
                    <p className="text-base text-[#6B4F3F]/80">
                      {restaurant.description}
                    </p>
                  </div>
                  <Button
                    className="w-full h-12 bg-[#C97C2B] hover:bg-[#B06A23] text-white text-base font-semibold rounded-xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectRestaurant(restaurant.id);
                    }}
                  >
                    Enter Restaurant
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Scroll hint */}
          <div className="text-center mt-4 text-base text-[#6B4F3F]">
            ← Use arrows or scroll to see more restaurants →
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}