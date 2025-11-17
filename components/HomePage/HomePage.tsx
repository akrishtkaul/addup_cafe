// components/HomePage/HomePage.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* TOP NAV */}
      <header className="border-b bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white">
              AC
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Add Up Café
            </span>
          </div>

          {/* Center nav links */}
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a href="#about" className="hover:text-slate-900">
              About
            </a>
            <a href="#help" className="hover:text-slate-900">
              Help
            </a>
            <a href="#resources" className="hover:text-slate-900">
              Resources
            </a>
          </nav>

          {/* Right auth buttons */}
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/signin"
              className="inline-flex h-9 items-center justify-center rounded-full border border-slate-300 px-4 text-xs font-medium hover:border-slate-400 hover:bg-slate-50"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center justify-center rounded-full bg-violet-600 px-4 text-xs font-medium text-white shadow-sm hover:bg-violet-700"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section
        className="flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.08),_transparent_55%)]"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-16 text-center">
          <h1 className="mb-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Add Up Cafe
          </h1>
          <p className="mb-8 text-lg text-slate-600 sm:text-xl">
            Explore different “restaurants” as you improve your addition
            abilities in a calm, supportive environment.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-full bg-violet-600 px-8 text-sm font-semibold text-white shadow-md hover:bg-violet-700"
            >
              Register to Start Playing
            </Link>
            <Link
              href="/signin"
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 px-8 text-sm font-medium text-slate-800 hover:border-slate-400 hover:bg-white"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ABOUT + HELP (simple placeholders you can expand later) */}
      <section
        id="about"
        className="mx-auto max-w-4xl px-6 pb-16 pt-6 text-sm text-slate-700"
      >
        <h2 className="mb-2 text-base font-semibold">About Add Up Café</h2>
        <p>
          Add Up Café is designed for adult learners with special abilities.
          Each “restaurant” offers a different style of addition practice, with
          clear visuals and gentle pacing so no one feels rushed.
        </p>
      </section>

      <section
        id="help"
        className="mx-auto max-w-4xl px-6 pb-16 text-sm text-slate-700"
      >
        <h2 className="mb-2 text-base font-semibold">Need help?</h2>
        <p>
          Teachers and support staff can use the Help section to find guides on
          setting up a class, adjusting difficulty levels, and reading
          student progress reports.
        </p>
      </section>
    </main>
  );
}
