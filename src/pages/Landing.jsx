import { Link } from "react-router-dom";
import { ROUTES } from "../constants/routes";
const features = [
  {
    title: "Structured Role Management",
    icon: "roles",
    description:
      "Dedicated dashboards for students, staff, and administrators keep responsibilities clear and access controlled.",
  },
  {
    title: "Transparent Tracking",
    icon: "tracking",
    description:
      "Follow complaint progress in real time from submission to closure with complete status visibility.",
  },
  {
    title: "Efficient Resolution Workflow",
    icon: "workflow",
    description:
      "Improve turnaround by routing cases quickly to the right teams with clear communication at every step.",
  },
];

const quickMetrics = [
  { value: "24/7", label: "Availability" },
  { value: "3 Roles", label: "Role-Based Panels" },
  { value: "Real-Time", label: "Status Visibility" },
];
const SYSTEM_VERSION = "v1.0.0";

const ctaLinks = [
  {
    to: ROUTES.LOGIN,
    label: "Login",
    className:
      "w-full rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-indigo-700 shadow-lg shadow-indigo-900/30 transition hover:bg-slate-100 sm:w-auto",
  },
  {
    to: ROUTES.REGISTER,
    label: "Register",
    className:
      "w-full rounded-full border border-white/80 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 hover:border-white/100 sm:w-auto",
  },
];

function FeatureIcon({ type }) {
  if (type === "roles") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path
          d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm6 13a7 7 0 0 0-14 0M18 20a5 5 0 0 0-5-5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "tracking") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path
          d="M12 8v4l2.5 2.5M22 12A10 10 0 1 1 12 2a10 10 0 0 1 10 10Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path
        d="m4 14 4 4 12-12M4 6h10M4 10h8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Landing() {
  return (
    <main className="safe-area-y flex min-h-screen flex-col overflow-x-clip bg-slate-950 text-white">
      <section className="relative isolate overflow-hidden px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-7 md:pb-20 md:pt-8">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#818cf8_0%,#312e81_35%,#020617_70%)]" />
        <div className="mx-auto max-w-6xl">
          <header className="animate-slide-in-up mb-10 flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300"></span>
              ASTU Complaint Tracker
            </div>
            <div className="hidden rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 sm:block">
              Secure Campus Workflow
            </div>
          </header>

          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="animate-slide-in-up text-center lg:text-left">
              <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl">
                ASTU Smart Complaint Tracking System
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-slate-200 sm:text-base lg:mx-0">
                A centralized platform for complaint submission, tracking, and resolution that
                improves transparency, efficiency, and accountability.
              </p>

              <div className="mx-auto mt-7 flex w-full max-w-xs flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:gap-4 lg:mx-0 lg:justify-start">
                {ctaLinks.map((linkItem) => (
                  <Link key={linkItem.to} className={linkItem.className} to={linkItem.to}>
                    {linkItem.label}
                  </Link>
                ))}
              </div>

              <p className="mt-4 text-xs text-slate-400 sm:text-sm lg:text-left">
                Login or register to access your dashboard.
              </p>

              <div className="mx-auto mt-6 grid max-w-xl grid-cols-1 gap-2 text-left sm:grid-cols-3 lg:mx-0">
                {quickMetrics.map((metricItem) => (
                  <div
                    key={metricItem.label}
                    className="rounded-xl border border-white/15 bg-white/10 px-3 py-2"
                  >
                    <p className="text-sm font-semibold text-white">{metricItem.value}</p>
                    <p className="text-[11px] text-slate-300">{metricItem.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-slide-in-up-delay mx-auto w-full max-w-md lg:max-w-none">
              <div className="rounded-3xl border border-white/20 bg-slate-900/60 p-4 shadow-2xl shadow-indigo-950/40 backdrop-blur md:p-5">
                <div className="mb-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                  <span className="font-semibold text-white">Dashboard Snapshot</span>
                  <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] text-emerald-300">
                    Live
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-slate-400">Pending</p>
                    <p className="mt-1 text-2xl font-bold text-amber-300">8</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-slate-400">Resolved</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-300">26</p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] text-slate-400">Recent Ticket</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    "Library Wi-Fi Connectivity Issue"
                  </p>
                  <div className="mt-2 inline-flex rounded-full border border-sky-400/40 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-300">
                    In Progress
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-12 text-slate-900 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-5 sm:gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-6"
            >
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <FeatureIcon type={feature.icon} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 sm:mt-3">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-sm text-slate-400">
        <p>
          &copy; {new Date().getFullYear()} ASTU Smart Complaint Tracking System.
          All rights reserved.
        </p>
      </footer>

      <div
        className="fixed z-30 rounded-full border border-white/20 bg-slate-900/85 px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-300 shadow-lg backdrop-blur"
        style={{
          bottom: "calc(0.5rem + env(safe-area-inset-bottom, 0px))",
          right: "calc(0.5rem + env(safe-area-inset-right, 0px))",
        }}
      >
        {SYSTEM_VERSION}
      </div>
    </main>
  );
}

export default Landing;
