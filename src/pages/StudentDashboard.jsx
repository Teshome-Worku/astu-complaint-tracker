import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const navigationItems = [
  {
    id: "submit",
    label: "Submit Complaint",
    helper: "Create a new complaint ticket",
  },
  {
    id: "history",
    label: "Complaint History",
    helper: "See your previous submissions",
  },
  {
    id: "track",
    label: "Track Status",
    helper: "Check progress and responses",
  },
  {
    id: "chatbot",
    label: "Ask Chatbot",
    helper: "Get guidance before submitting",
  },
];

const categoryOptions = ["General", "Academic", "Finance", "IT", "Facility", "Discipline"];

function StudentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [activeSection, setActiveSection] = useState("submit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState({
    type: "idle",
    message: "",
  });
  const [complaintData, setComplaintData] = useState({
    title: "",
    description: "",
    category: "General",
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleComplaintChange = (event) => {
    const { name, value } = event.target;
    setComplaintData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (submissionFeedback.type !== "idle") {
      setSubmissionFeedback({
        type: "idle",
        message: "",
      });
    }
  };

  const resetForm = () => {
    setComplaintData({
      title: "",
      description: "",
      category: "General",
    });
    setSubmissionFeedback({
      type: "idle",
      message: "",
    });
  };

  const handleComplaintSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!user?.id) {
      setSubmissionFeedback({
        type: "error",
        message: "Your session is invalid. Please log in again.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmissionFeedback({
      type: "idle",
      message: "",
    });

    try {
      await axios.post("http://localhost:5000/complaints", {
        ...complaintData,
        userId: user.id,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      setSubmissionFeedback({
        type: "success",
        message: "Complaint submitted successfully. You can track it in the status section.",
      });

      setComplaintData({
        title: "",
        description: "",
        category: "General",
      });
    } catch {
      setSubmissionFeedback({
        type: "error",
        message: "Failed to submit complaint. Please try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPlaceholderSection = (title, description) => (
    <section className="mx-auto w-full max-w-5xl">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-black/30">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-slate-400">{description}</p>
      </div>
    </section>
  );

  const feedbackClassName =
    submissionFeedback.type === "success"
      ? "rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
      : "rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 lg:flex lg:h-screen">
      <aside className="w-full border-b border-slate-800 bg-slate-900/90 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col p-6 lg:p-7 ">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-indigo-400">Student Panel</h2>
            <p className="mt-1 text-sm text-slate-400">Manage your complaints from one place.</p>
          </div>

          {/* <div className="flex justify-between flex-col"> */}

          <nav className="mt-8 space-y-2 " >
            {navigationItems.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  className={`group w-full rounded-xl px-4 py-3 text-left transition ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white bg-slate-800/20"
                  }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <span className="block text-base font-semibold">{item.label}</span>
                  <span
                    className={`mt-0.5 block text-xs ${
                      isActive ? "text-indigo-100" : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  >
                    {item.helper}
                  </span>
                </button>
              );
            })}
          </nav>

          <button
            className="mt-14 w-full rounded-xl bg-rose-600 px-4 py-2.5 font-semibold text-white transition hover:bg-rose-500"
            onClick={handleLogout}
          >
            Logout
          </button>
          {/* </div> */}
        </div>
      </aside>

      <div className="flex-1 lg:h-screen lg:overflow-y-auto">
        <header className="border-b border-slate-800 bg-slate-900/70 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold text-white">Welcome, {user?.name}</h1>
              <p className="text-sm text-slate-400">Submit, review, and track your cases.</p>
            </div>
            <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
              Role: {user?.role}
            </span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
            {/* submit section */}
          {activeSection === "submit" && (
            <section className="mx-auto w-full max-w-6xl">
              <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-black/30">
                  <div className="border-b border-slate-800 px-6 py-6 sm:px-8">
                    <p className="inline-flex rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-300">
                      New Ticket
                    </p>
                    <h2 className="mt-4 text-3xl font-black tracking-tight text-white">
                      Submit a Complaint
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                      Share what happened clearly so the right team can resolve it faster.
                    </p>
                  </div>

                  <form className="space-y-6 px-6 py-6 sm:px-8" onSubmit={handleComplaintSubmit}>
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-300">Title</span>
                      <input
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                        name="title"
                        onChange={handleComplaintChange}
                        placeholder="Example: Delay in exam result publication"
                        required
                        type="text"
                        value={complaintData.title}
                      />
                    </label>

                    <label className="block">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-300">Description</span>
                        <span className="text-xs text-slate-500">
                          {complaintData.description.length}/600
                        </span>
                      </div>
                      <textarea
                        className="min-h-44 w-full rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                        maxLength={600}
                        name="description"
                        onChange={handleComplaintChange}
                        placeholder="Provide key details like when it happened, where, and any steps you already took."
                        required
                        rows={7}
                        value={complaintData.description}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-300">Category</span>
                      <select
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                        name="category"
                        onChange={handleComplaintChange}
                        value={complaintData.category}
                      >
                        {categoryOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    {submissionFeedback.type !== "idle" && (
                      <div className={feedbackClassName}>{submissionFeedback.message}</div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <button
                        className={`rounded-xl px-6 py-3 text-sm font-semibold text-white transition ${
                          isSubmitting
                            ? "cursor-not-allowed bg-indigo-500/60"
                            : "bg-indigo-600 hover:-translate-y-0.5 hover:bg-indigo-500"
                        }`}
                        disabled={isSubmitting}
                        type="submit"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Complaint"}
                      </button>

                      <button
                        className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
                        onClick={resetForm}
                        type="button"
                      >
                        Reset Form
                      </button>
                    </div>
                  </form>
                </div>

                <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/30">
                  <h3 className="text-lg font-bold text-white">Before you submit</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Quick tips to help staff resolve your complaint sooner.
                  </p>
                  <ul className="mt-4 space-y-3 text-sm text-slate-200">
                    <li className="rounded-xl border border-slate-800 bg-slate-800/70 p-3">
                      Use a specific title that summarizes the issue.
                    </li>
                    <li className="rounded-xl border border-slate-800 bg-slate-800/70 p-3">
                      Include dates, locations, and relevant names in the description.
                    </li>
                    <li className="rounded-xl border border-slate-800 bg-slate-800/70 p-3">
                      Choose the right category to route the complaint correctly.
                    </li>
                  </ul>
                  <div className="mt-5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-xs text-indigo-100">
                    Tip: You can track updates after submission from the Track Status tab.
                  </div>
                </aside>
              </div>
            </section>
          )}

          {/* active section */}

          {activeSection === "history" &&
            renderPlaceholderSection(
              "Complaint History",
              "Your previous complaints and decisions will appear here in a timeline view."
            )}

          {activeSection === "track" &&
            renderPlaceholderSection(
              "Track Complaint Status",
              "Live updates, assigned office, and resolution progress will appear in this section."
            )}

          {activeSection === "chatbot" &&
            renderPlaceholderSection(
              "Ask the Support Chatbot",
              "Ask questions about complaint categories, expected timelines, and process guidance."
            )}
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;
