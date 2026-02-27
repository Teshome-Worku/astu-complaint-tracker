import { Link } from "react-router-dom";

const features = [
  {
    title: "Structured Role Management",
    description:
      "Dedicated dashboards for students, staff, and administrators keep responsibilities clear and access controlled.",
  },
  {
    title: "Transparent Tracking",
    description:
      "Follow complaint progress in real time from submission to closure with complete status visibility.",
  },
  {
    title: "Efficient Resolution Workflow",
    description:
      "Improve turnaround by routing cases quickly to the right teams with clear communication at every step.",
  },
];

const ctaLinks = [
  {
    to: "/login",
    label: "Login",
    className:
      "w-full rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-indigo-700 shadow-lg shadow-indigo-900/30 transition hover:bg-slate-100 sm:w-auto",
  },
  {
    to: "/register",
    label: "Register",
    className:
      "w-full rounded-full border border-white/80 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 hover:border-white/100 sm:w-auto",
  },
];

function Landing() {
  return (
    <main className="safe-area-y flex min-h-screen flex-col overflow-x-clip bg-slate-950 text-white">
      <section className="relative isolate overflow-hidden px-4 py-16 text-center sm:px-6 md:py-24 lg:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#818cf8_0%,#312e81_35%,#020617_70%)]" />
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-6xl">
            ASTU Smart Complaint
            <br />
            Tracking System
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-slate-200 sm:max-w-2xl sm:text-base md:text-lg">
            A centralized platform for complaint submission, tracking, and resolution
            that improves transparency, efficiency, and accountability.
          </p>

          <div className="mx-auto mt-8 flex w-full max-w-xs flex-col items-stretch justify-center gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:items-center sm:gap-4">
            {ctaLinks.map((linkItem) => (
              <Link key={linkItem.to} className={linkItem.className} to={linkItem.to}>
                {linkItem.label}
              </Link>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400 sm:text-sm">
            Login or register to access your dashboard.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-12 text-slate-900 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-5 sm:gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-6"
            >
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
    </main>
  );
}

export default Landing;
