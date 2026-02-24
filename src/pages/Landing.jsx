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
      "rounded-full bg-white px-8 py-3 text-sm font-semibold text-indigo-700 shadow-lg shadow-indigo-900/30 transition hover:-translate-y-0.5 hover:bg-slate-100 scale-105 hover:shadow-indigo-900/50",
  },
  {
    to: "/register",
    label: "Register",
    className:
      "rounded-full border border-white/80 px-8 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10 scale-105 hover:border-white/100",
  },
];

function Landing() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">
      <section className="relative isolate overflow-hidden px-6 py-24 text-center md:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#818cf8_0%,#312e81_35%,#020617_70%)]" />
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
            ASTU Smart Complaint
            <br />
            Tracking System
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-200 md:text-lg">
            A centralized platform for complaint submission, tracking, and resolution
            that improves transparency, efficiency, and accountability.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {ctaLinks.map((linkItem) => (
              <Link key={linkItem.to} className={linkItem.className} to={linkItem.to}>
                {linkItem.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-16 text-slate-900">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h2 className="text-xl font-bold text-slate-900">{feature.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
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
