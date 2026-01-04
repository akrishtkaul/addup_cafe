"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Coffee, CheckCircle2, Users, TrendingUp } from "lucide-react";

export default function HomePage() {
  const [orderVisible, setOrderVisible] = useState([false, false, false]);
  const [heroVisible, setHeroVisible] = useState(false);
  const [howItWorksVisible, setHowItWorksVisible] = useState(false);
  const [builtForVisible, setBuiltForVisible] = useState(false);
  const [resourcesVisible, setResourcesVisible] = useState(false);

  // Animate order items on mount
  useEffect(() => {
    const timers = [
      setTimeout(() => setOrderVisible([true, false, false]), 400),
      setTimeout(() => setOrderVisible([true, true, false]), 700),
      setTimeout(() => setOrderVisible([true, true, true]), 1000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Scroll animation observer
  useEffect(() => {
    setHeroVisible(true);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id === "about") setHowItWorksVisible(true);
            if (id === "help") setBuiltForVisible(true);
            if (id === "resources") setResourcesVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    const sections = document.querySelectorAll("#about, #help, #resources");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-[#FFF7ED] text-[#2B1B14]">
      {/* TOP NAV */}
      <header className="border-b border-[#E7D6C8] bg-white/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Coffee className="h-6 w-6 text-[#C97C2B]" />
            <span className="text-lg font-semibold tracking-tight text-[#2B1B14]">
              Add Up Café
            </span>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden items-center gap-6 text-sm text-[#6B4F3F] md:flex">
              <a href="#about" className="hover:text-[#C97C2B] transition-colors">
                About
              </a>
              <a href="#help" className="hover:text-[#C97C2B] transition-colors">
                Help
              </a>
              <a href="#resources" className="hover:text-[#C97C2B] transition-colors">
                Resources
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/signin">
                <Button variant="ghost" size="sm" className="text-[#3B2A23] hover:bg-[#3B2A23]/5">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-[#C97C2B] text-white hover:bg-[#B06A23] shadow-sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left column */}
            <div
              className={`flex flex-col gap-6 transition-all duration-700 ${
                heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-[#2B1B14]">
                Addition practice that feels like a game.
              </h1>
              <p className="text-lg text-[#6B4F3F] leading-relaxed">
                Teachers assign quick activities. Students practice ordering and paying—progress tracks
                automatically.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-[#C97C2B] text-white hover:bg-[#B06A23] shadow-md text-base px-8">
                    Get Started
                  </Button>
                </Link>
                <Link href="/signin">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-[#3B2A23] text-[#3B2A23] hover:bg-[#3B2A23]/5 text-base px-8"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-[#6B4F3F] mt-2">
                Designed for classrooms and learners who benefit from structure.
              </p>
            </div>

            {/* Right column - Preview Card */}
            <div
              className={`rounded-2xl border border-[#E7D6C8] bg-white p-6 shadow-lg transition-all duration-700 delay-300 ${
                heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#2B1B14]">Today&#39;s Order</h3>
                <span className="rounded-full bg-[#C97C2B]/10 px-3 py-1 text-xs font-medium text-[#C97C2B]">
                  3 correct in a row
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div
                  className={`flex items-center justify-between py-2 border-b border-[#E7D6C8] transition-all duration-500 ${
                    orderVisible[0] ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  }`}
                >
                  <span className="text-sm text-[#6B4F3F]">Coffee</span>
                  <span className="font-medium text-[#2B1B14]">$4.50</span>
                </div>
                <div
                  className={`flex items-center justify-between py-2 border-b border-[#E7D6C8] transition-all duration-500 delay-300 ${
                    orderVisible[1] ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  }`}
                >
                  <span className="text-sm text-[#6B4F3F]">Croissant</span>
                  <span className="font-medium text-[#2B1B14]">$3.25</span>
                </div>
                <div
                  className={`flex items-center justify-between py-2 border-b border-[#E7D6C8] transition-all duration-500 delay-500 ${
                    orderVisible[2] ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  }`}
                >
                  <span className="text-sm text-[#6B4F3F]">Juice</span>
                  <span className="font-medium text-[#2B1B14]">$2.75</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 py-3 border-t-2 border-[#E7D6C8]">
                <span className="font-semibold text-[#2B1B14]">Total</span>
                <span className="text-xl font-bold text-[#C97C2B]">$10.50</span>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#6B4F3F]">Enter payment</label>
                <input
                  type="text"
                  disabled
                  placeholder="Type your answer..."
                  className="w-full rounded-lg border border-[#E7D6C8] bg-[#FFF7ED] px-4 py-3 text-[#2B1B14] placeholder:text-[#6B4F3F]/40"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="about" className="py-16 bg-white/40">
        <div className="mx-auto max-w-7xl px-6">
          <h2
            className={`mb-12 text-center text-3xl font-bold text-[#2B1B14] transition-all duration-700 ${
              howItWorksVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            How it works
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                num: 1,
                title: "Teacher creates a class",
                desc: "Set up your classroom and generate a join code for students in seconds.",
              },
              {
                num: 2,
                title: "Student joins with a code",
                desc: "Students enter the classroom code and immediately see their assignments.",
              },
              {
                num: 3,
                title: "Play + progress recorded",
                desc: "Automatic tracking shows what's working—no extra paperwork needed.",
              },
            ].map((step, i) => (
              <div
                key={step.num}
                className={`flex flex-col items-center text-center transition-all duration-700 ${
                  howItWorksVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#C97C2B] text-2xl font-bold text-white shadow-md">
                  {step.num}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[#2B1B14]">{step.title}</h3>
                <p className="text-sm text-[#6B4F3F]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUILT FOR SECTION */}
      <section id="help" className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2
            className={`mb-12 text-center text-3xl font-bold text-[#2B1B14] transition-all duration-700 ${
              builtForVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Built for
          </h2>

          <div className="grid gap-8 md:grid-cols-2">
            <div
              className={`rounded-2xl border border-[#E7D6C8] bg-white p-8 shadow-sm transition-all duration-700 ${
                builtForVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#C97C2B]/10">
                <Users className="h-6 w-6 text-[#C97C2B]" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-[#2B1B14]">For Teachers</h3>
              <p className="text-[#6B4F3F] leading-relaxed">
                Create up to 2 assignments per class, see progress at a glance, and remove students as needed.
                Simple classroom management without the clutter.
              </p>
            </div>

            <div
              className={`rounded-2xl border border-[#E7D6C8] bg-white p-8 shadow-sm transition-all duration-700 delay-200 ${
                builtForVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#C97C2B]/10">
                <TrendingUp className="h-6 w-6 text-[#C97C2B]" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-[#2B1B14]">For Students</h3>
              <p className="text-[#6B4F3F] leading-relaxed">
                Clear steps, immediate feedback, low-friction practice. Visit different &quot;restaurants&quot; and build
                confidence with every correct answer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RESOURCES / TRUST SECTION */}
      <section id="resources" className="py-16 bg-white/40">
        <div
          className={`mx-auto max-w-4xl px-6 text-center transition-all duration-700 ${
            resourcesVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-[#C97C2B]" />
          <h2 className="mb-4 text-2xl font-bold text-[#2B1B14]">Designed with care</h2>
          <p className="text-[#6B4F3F] leading-relaxed max-w-2xl mx-auto">
            Add Up Café was built for adult learners with special abilities. Every interaction is intentional—from the
            pacing to the visuals—so everyone can practice addition in a supportive, accessible environment.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E7D6C8] bg-white/60 py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-[#6B4F3F]">
          <p>© 2026 Add Up Café. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}