import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const departments = ["IT", "Maintenance", "Academic", "Finance", "Facility", "Discipline"];

const navItems = [
  { id: "overview", label: "Oversee all complaints" },
  { id: "manage", label: "Manage users and categories" },
  { id: "analytics", label: "View analytics dashboard" },
];

const statusBadgeClass = {
  pending: "bg-amber-100 text-amber-700 border border-amber-300",
  assigned: "bg-indigo-100 text-indigo-700 border border-indigo-300",
  "in-progress": "bg-sky-100 text-sky-700 border border-sky-300",
  resolved: "bg-emerald-100 text-emerald-700 border border-emerald-300",
};

const issueBarColors = ["bg-blue-600", "bg-emerald-500", "bg-amber-500", "bg-violet-500"];

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function toTitleCase(value) {
  return String(value ?? "")
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [activeSection, setActiveSection] = useState("overview");
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  const fetchComplaints = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/complaints");
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch {
      console.error("Failed to fetch complaints");
      setError("Failed to load complaints. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const assignDepartment = async (id, department) => {
    if (!department) return;

    setUpdatingId(id);
    setError("");
    try {
      await axios.patch(`http://localhost:5000/complaints/${id}`, {
        assignedDepartment: department,
        status: "assigned",
      });
      fetchComplaints();
    } catch {
      console.error("Assignment failed");
      setError("Department assignment failed. Please try again.");
    } finally {
      setUpdatingId("");
    }
  };

  const sortedComplaints = useMemo(
    () =>
      [...complaints].sort(
        (first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0)
      ),
    [complaints]
  );

  const metrics = useMemo(() => {
    const total = complaints.length;
    const resolved = complaints.filter((complaint) => complaint.status === "resolved").length;
    const pending = complaints.filter((complaint) => complaint.status === "pending").length;
    const inProgress = complaints.filter((complaint) => complaint.status === "in-progress").length;
    const assigned = complaints.filter((complaint) => complaint.status === "assigned").length;

    const categoryCounts = complaints.reduce((acc, complaint) => {
      const key = normalize(complaint.category) || "uncategorized";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const topCategoryEntry =
      Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];
    const resolutionRate = total === 0 ? 0 : Math.round((resolved / total) * 100);

    return {
      total,
      resolved,
      pending,
      inProgress,
      assigned,
      resolutionRate,
      mostCommonIssueType: topCategoryEntry[0] === "N/A" ? "N/A" : toTitleCase(topCategoryEntry[0]),
      mostCommonIssueCount: topCategoryEntry[1],
    };
  }, [complaints]);

  const issueBreakdown = useMemo(() => {
    const counts = complaints.reduce((acc, complaint) => {
      const key = normalize(complaint.category) || "uncategorized";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const total = complaints.length || 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count], index) => ({
        name: toTitleCase(name),
        count,
        percent: Math.round((count / total) * 100),
        colorClass: issueBarColors[index % issueBarColors.length],
      }));
  }, [complaints]);

  const recentComplaints = useMemo(() => sortedComplaints.slice(0, 6), [sortedComplaints]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const renderManagementList = () => {
    if (isLoading) {
      return <p className="text-slate-500">Loading complaints...</p>;
    }

    if (sortedComplaints.length === 0) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-600">No complaints found.</p>
        </div>
      );
    }

    return (
      <section className="space-y-4">
        {sortedComplaints.map((complaint) => (
          <article
            key={complaint.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">{complaint.title}</h3>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  statusBadgeClass[complaint.status] ||
                  "bg-slate-100 text-slate-700 border border-slate-300"
                }`}
              >
                {complaint.status || "unknown"}
              </span>
            </div>

            <p className="mb-3 text-sm text-slate-600">{complaint.description}</p>

            {(complaint.attachment?.dataUrl || complaint.attachment?.url) && (
              <div className="mb-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Attached Image
                </p>
                <a
                  className="inline-block"
                  href={complaint.attachment?.dataUrl || complaint.attachment?.url}
                  rel="noreferrer"
                  target="_blank"
                  title="Open image in new tab"
                >
                  <img
                    alt={`Attachment for ${complaint.title}`}
                    className="h-36 w-full max-w-sm rounded-xl border border-slate-200 object-cover transition hover:opacity-90"
                    src={complaint.attachment?.dataUrl || complaint.attachment?.url}
                  />
                </a>
                <p className="mt-2 text-xs text-slate-500">
                  {complaint.attachment?.fileName || "image-attachment"}
                </p>
              </div>
            )}

            <div className="mb-3 text-xs text-slate-500">
              <span>Category: {complaint.category || "N/A"}</span>
              <span className="mx-2">|</span>
              <span>Submitted: {new Date(complaint.createdAt).toLocaleString()}</span>
            </div>

            {complaint.status === "pending" && (
              <div className="flex flex-wrap gap-3">
                <select
                  className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500"
                  defaultValue=""
                  disabled={updatingId === complaint.id}
                  onChange={(event) => assignDepartment(complaint.id, event.target.value)}
                >
                  <option disabled value="">
                    Assign Department
                  </option>
                  {departments.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {complaint.assignedDepartment && (
              <p className="mt-3 text-sm text-emerald-700">
                Assigned to: {complaint.assignedDepartment}
              </p>
            )}
          </article>
        ))}
      </section>
    );
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-slate-600">Session not found. Please log in again.</p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <aside className="w-full bg-gradient-to-b from-blue-700 to-blue-900 text-blue-50 lg:w-[260px] lg:min-h-screen">
        <div className="flex h-full flex-col p-6">
          <div className="border-b border-white/20 pb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-lg font-black">
                A
              </div>
              <div>
                <p className="text-2xl font-black leading-tight">ASTU Portal</p>
                <p className="text-xs text-blue-100/90">Admin Control Center</p>
              </div>
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    isActive
                      ? "bg-white/20 text-white shadow-lg shadow-blue-950/40"
                      : "text-blue-100 hover:bg-white/15 hover:text-white"
                  }`}
                  onClick={() => setActiveSection(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <button
            className="mt-auto rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400"
            onClick={handleLogout}
            type="button"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:h-screen lg:overflow-y-auto">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-xl">
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500"
                placeholder="Search complaints, categories, departments..."
                type="text"
              />
            </div>
            <div className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              {user.name} • Admin
            </div>
          </div>
        </header>

        <main className="space-y-6 p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="rounded-xl border border-rose-300 bg-rose-100 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {activeSection === "overview" && (
            <>
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-500">Total complaints</p>
                  <p className="mt-2 text-5xl font-black text-slate-800">{metrics.total}</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-500">Resolution rate</p>
                  <p className="mt-2 text-5xl font-black text-blue-700">{metrics.resolutionRate}%</p>
                  <p className="mt-1 text-sm text-slate-500">Resolved tickets</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-500">Most common issue type</p>
                  <p className="mt-2 text-2xl font-bold text-slate-800">
                    {metrics.mostCommonIssueType}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {metrics.mostCommonIssueCount} complaint(s)
                  </p>
                </article>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h2 className="text-2xl font-black text-slate-800">Recent Complaints</h2>
                  <button
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500"
                    onClick={() => setActiveSection("manage")}
                    type="button"
                  >
                    View All
                  </button>
                </div>
                {recentComplaints.length === 0 ? (
                  <p className="text-slate-600">No complaints available.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="text-slate-500">
                        <tr>
                          <th className="pb-2 pr-4 font-semibold">ID</th>
                          <th className="pb-2 pr-4 font-semibold">Subject</th>
                          <th className="pb-2 pr-4 font-semibold">Category</th>
                          <th className="pb-2 pr-4 font-semibold">Status</th>
                          <th className="pb-2 font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700">
                        {recentComplaints.map((complaint) => (
                          <tr key={complaint.id} className="border-t border-slate-200">
                            <td className="py-2 pr-4 font-medium">#{complaint.id}</td>
                            <td className="py-2 pr-4">{complaint.title}</td>
                            <td className="py-2 pr-4">{complaint.category || "N/A"}</td>
                            <td className="py-2 pr-4">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  statusBadgeClass[complaint.status] ||
                                  "bg-slate-100 text-slate-700 border border-slate-300"
                                }`}
                              >
                                {complaint.status || "unknown"}
                              </span>
                            </td>
                            <td className="py-2">
                              {new Date(complaint.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {activeSection === "manage" && (
            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-2xl font-black text-slate-800">Manage Users and Categories</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Assign departments for pending complaints and supervise complaint routing.
                </p>
              </div>
              {renderManagementList()}
            </section>
          )}

          {activeSection === "analytics" && (
            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-2xl font-black text-slate-800">Analytics Dashboard</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Review issue distribution and response performance.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800">Status Summary</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-100 p-3">
                      <p className="text-xs font-semibold uppercase text-slate-500">Pending</p>
                      <p className="mt-1 text-2xl font-black text-slate-800">{metrics.pending}</p>
                    </div>
                    <div className="rounded-xl bg-slate-100 p-3">
                      <p className="text-xs font-semibold uppercase text-slate-500">Assigned</p>
                      <p className="mt-1 text-2xl font-black text-slate-800">{metrics.assigned}</p>
                    </div>
                    <div className="rounded-xl bg-slate-100 p-3">
                      <p className="text-xs font-semibold uppercase text-slate-500">In Progress</p>
                      <p className="mt-1 text-2xl font-black text-slate-800">
                        {metrics.inProgress}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-100 p-3">
                      <p className="text-xs font-semibold uppercase text-slate-500">Resolved</p>
                      <p className="mt-1 text-2xl font-black text-slate-800">{metrics.resolved}</p>
                    </div>
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800">Issue Breakdown</h3>
                  <div className="mt-4 space-y-3">
                    {issueBreakdown.length === 0 ? (
                      <p className="text-sm text-slate-500">No category data available yet.</p>
                    ) : (
                      issueBreakdown.map((item) => (
                        <div key={item.name}>
                          <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                            <span>{item.name}</span>
                            <span>{item.percent}%</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-slate-200">
                            <div
                              className={`h-2.5 rounded-full ${item.colorClass}`}
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </article>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
