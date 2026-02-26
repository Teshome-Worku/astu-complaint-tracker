import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const issuePalette = [
  { barClass: "bg-blue-600", pieColor: "#2563eb" },
  { barClass: "bg-emerald-500", pieColor: "#10b981" },
  { barClass: "bg-amber-500", pieColor: "#f59e0b" },
  { barClass: "bg-violet-500", pieColor: "#8b5cf6" },
];

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
  const [staffUsers, setStaffUsers] = useState([]);
  const [assignmentDrafts, setAssignmentDrafts] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [error, setError] = useState("");

  const knownComplaintIdsRef = useRef(new Set());
  const isInitialFetchRef = useRef(true);
  const latestSeenCreatedAtRef = useRef(0);

  const fetchComplaints = useCallback(async ({ showLoader = true } = {}) => {
    if (showLoader) {
      setIsLoading(true);
    }
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/complaints");
      const fetchedComplaints = Array.isArray(res.data) ? res.data : [];
      const incomingComplaintIds = new Set(
        fetchedComplaints.map((complaint) => String(complaint.id))
      );
      const latestCreatedAtMs = fetchedComplaints.reduce((latest, complaint) => {
        const complaintTimestamp = new Date(complaint.createdAt || 0).getTime() || 0;
        return complaintTimestamp > latest ? complaintTimestamp : latest;
      }, 0);

      if (!isInitialFetchRef.current) {
        const incomingNotifications = fetchedComplaints
          .filter((complaint) => {
            const complaintId = String(complaint.id);
            const complaintTimestamp = new Date(complaint.createdAt || 0).getTime() || 0;
            return (
              !knownComplaintIdsRef.current.has(complaintId) ||
              complaintTimestamp > latestSeenCreatedAtRef.current
            );
          })
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .map((complaint) => ({
            id: `${complaint.id}-${Date.now()}`,
            complaintId: complaint.id,
            title: complaint.title || "New complaint",
            createdAt: complaint.createdAt,
          }));

        if (incomingNotifications.length > 0) {
          setNotifications((prev) => {
            const knownNotificationComplaintIds = new Set(
              prev.map((entry) => String(entry.complaintId))
            );
            const uniqueIncoming = incomingNotifications.filter(
              (entry) => !knownNotificationComplaintIds.has(String(entry.complaintId))
            );
            return [...uniqueIncoming, ...prev].slice(0, 20);
          });
        }
      }

      isInitialFetchRef.current = false;
      knownComplaintIdsRef.current = incomingComplaintIds;
      latestSeenCreatedAtRef.current = Math.max(latestSeenCreatedAtRef.current, latestCreatedAtMs);
      setComplaints(fetchedComplaints);
    } catch {
      console.error("Failed to fetch complaints");
      setError("Failed to load complaints. Please refresh.");
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchComplaints({ showLoader: false });
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [fetchComplaints]);

  useEffect(() => {
    const handleFocus = () => {
      fetchComplaints({ showLoader: false });
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchComplaints]);

  useEffect(() => {
    const fetchStaffUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/users");
        const allUsers = Array.isArray(res.data) ? res.data : [];
        setStaffUsers(allUsers.filter((entry) => normalize(entry.role) === "staff"));
      } catch {
        console.error("Failed to fetch staff users");
      }
    };

    fetchStaffUsers();
  }, []);

  useEffect(() => {
    setAssignmentDrafts((prevDrafts) => {
      const nextDrafts = { ...prevDrafts };
      complaints.forEach((complaint) => {
        const currentDraft = nextDrafts[complaint.id] || {};
        nextDrafts[complaint.id] = {
          department: currentDraft.department ?? complaint.assignedDepartment ?? "",
          staffId: currentDraft.staffId ?? complaint.assignedStaffId ?? "",
        };
      });
      return nextDrafts;
    });
  }, [complaints]);

  const updateAssignmentDraft = (id, key, value) => {
    setAssignmentDrafts((prevDrafts) => ({
      ...prevDrafts,
      [id]: {
        ...(prevDrafts[id] || {}),
        [key]: value,
      },
    }));
  };

  const assignDepartment = async (id) => {
    const complaintToAssign = complaints.find((entry) => String(entry.id) === String(id));
    const complaintStatus = normalize(complaintToAssign?.status);
    if (complaintStatus !== "pending" && complaintStatus !== "new") {
      setError("Only pending/new complaints can be assigned.");
      return;
    }

    const selectedDraft = assignmentDrafts[id] || {};
    if (!selectedDraft.department || !selectedDraft.staffId) {
      setError("Select both department and staff before assigning.");
      return;
    }

    const selectedStaff = staffUsers.find(
      (staff) => String(staff.id) === String(selectedDraft.staffId)
    );

    setUpdatingId(id);
    setError("");
    try {
      await axios.patch(`http://localhost:5000/complaints/${id}`, {
        assignedDepartment: selectedDraft.department,
        assignedStaffId: selectedDraft.staffId,
        assignedStaffName: selectedStaff?.name || "",
        status: "assigned",
      });
      fetchComplaints();
    } catch {
      console.error("Assignment failed");
      setError("Assignment failed. Please try again.");
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
        colorClass: issuePalette[index % issuePalette.length].barClass,
        pieColor: issuePalette[index % issuePalette.length].pieColor,
      }));
  }, [complaints]);

  const normalizedSearchTerm = normalize(searchTerm);

  const filteredSortedComplaints = useMemo(() => {
    if (!normalizedSearchTerm) return sortedComplaints;

    return sortedComplaints.filter((complaint) => {
      const searchValues = [
        complaint.id,
        complaint.title,
        complaint.description,
        complaint.category,
        complaint.status,
        complaint.assignedDepartment,
        complaint.assignedStaffName,
        complaint.assignedStaffId,
        complaint.userId,
      ];
      return searchValues.some((value) => normalize(value).includes(normalizedSearchTerm));
    });
  }, [normalizedSearchTerm, sortedComplaints]);

  const recentComplaints = useMemo(
    () => filteredSortedComplaints.slice(0, 6),
    [filteredSortedComplaints]
  );

  const statusBarData = useMemo(() => {
    const rows = [
      { label: "Pending", value: metrics.pending, colorClass: "bg-amber-500" },
      { label: "Assigned", value: metrics.assigned, colorClass: "bg-indigo-500" },
      { label: "In Progress", value: metrics.inProgress, colorClass: "bg-sky-500" },
      { label: "Resolved", value: metrics.resolved, colorClass: "bg-emerald-500" },
    ];

    const maxValue = Math.max(...rows.map((row) => row.value), 1);
    return rows.map((row) => ({
      ...row,
      heightPercent: row.value === 0 ? 6 : Math.max(14, Math.round((row.value / maxValue) * 100)),
    }));
  }, [metrics.assigned, metrics.inProgress, metrics.pending, metrics.resolved]);

  const pieChartStyle = useMemo(() => {
    if (issueBreakdown.length === 0) {
      return { background: "conic-gradient(#e2e8f0 0 100%)" };
    }

    let runningPercent = 0;
    const segments = issueBreakdown.map((item) => {
      const start = runningPercent;
      const end = runningPercent + item.percent;
      runningPercent = end;
      return `${item.pieColor} ${start}% ${end}%`;
    });

    if (runningPercent < 100) {
      segments.push(`#cbd5e1 ${runningPercent}% 100%`);
    }

    return { background: `conic-gradient(${segments.join(", ")})` };
  }, [issueBreakdown]);

  const unreadCount = notifications.length;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const renderManagementList = () => {
    if (isLoading) {
      return <p className="text-slate-500">Loading complaints...</p>;
    }

    if (filteredSortedComplaints.length === 0) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-600">
            {normalizedSearchTerm ? "No matching complaints found." : "No complaints found."}
          </p>
        </div>
      );
    }

    return (
      <section className="space-y-4">
        {filteredSortedComplaints.map((complaint) => {
          const selectedDraft = assignmentDrafts[complaint.id] || {};
          const selectedDepartment = selectedDraft.department ?? complaint.assignedDepartment ?? "";
          const selectedStaffId = selectedDraft.staffId ?? complaint.assignedStaffId ?? "";
          const complaintStatus = normalize(complaint.status);
          const canAssign = complaintStatus === "pending" || complaintStatus === "new";

          const staffOptions = staffUsers.filter((staff) => {
            const staffDepartment = normalize(staff.department);
            if (!selectedDepartment) return true;
            return !staffDepartment || staffDepartment === normalize(selectedDepartment);
          });

          return (
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

              {canAssign && (
                <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <label className="min-w-[180px] flex-1">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Department
                    </span>
                    <select
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500"
                      disabled={updatingId === complaint.id}
                      onChange={(event) =>
                        setAssignmentDrafts((prevDrafts) => ({
                          ...prevDrafts,
                          [complaint.id]: {
                            ...(prevDrafts[complaint.id] || {}),
                            department: event.target.value,
                            staffId: "",
                          },
                        }))
                      }
                      value={selectedDepartment}
                    >
                      <option value="">Select department</option>
                      {departments.map((dep) => (
                        <option key={dep} value={dep}>
                          {dep}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="min-w-[190px] flex-1">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Assign Staff
                    </span>
                    <select
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500"
                      disabled={updatingId === complaint.id}
                      onChange={(event) =>
                        updateAssignmentDraft(complaint.id, "staffId", event.target.value)
                      }
                      value={selectedStaffId}
                    >
                      <option value="">Select staff</option>
                      {staffOptions.map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name}
                          {staff.department ? ` (${staff.department})` : ""}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                      updatingId === complaint.id || !selectedDepartment || !selectedStaffId
                        ? "cursor-not-allowed bg-slate-400"
                        : "bg-blue-600 hover:bg-blue-500"
                    }`}
                    disabled={updatingId === complaint.id || !selectedDepartment || !selectedStaffId}
                    onClick={() => assignDepartment(complaint.id)}
                    type="button"
                  >
                    {updatingId === complaint.id ? "Assigning..." : "Assign Ticket"}
                  </button>
                </div>
              )}

              {(complaint.assignedDepartment || complaint.assignedStaffName || complaint.assignedStaffId) && (
                <p className="mt-3 text-sm text-emerald-700">
                  Assigned to: {complaint.assignedDepartment || "Unspecified Department"}
                  {complaint.assignedStaffName
                    ? ` - ${complaint.assignedStaffName}`
                    : complaint.assignedStaffId
                      ? ` - Staff #${complaint.assignedStaffId}`
                      : ""}
                </p>
              )}
            </article>
          );
        })}
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
                onChange={(event) => setSearchTerm(event.target.value)}
                value={searchTerm}
                type="text"
              />
            </div>
            <div className="relative flex items-center gap-3">
              <button
                className="relative rounded-xl border border-slate-300 bg-white p-2.5 text-slate-700 shadow-sm transition hover:bg-slate-100"
                onClick={() => setIsNotificationOpen((prev) => !prev)}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M14.857 17.082A23.86 23.86 0 0 1 12 17.25c-.979 0-1.944-.059-2.857-.168M10 3.75a2 2 0 1 1 4 0v1.06c2.32.422 4.5 2.396 4.5 5.44v3.747l1.077 1.616a1 1 0 0 1-.832 1.555H5.255a1 1 0 0 1-.832-1.555L5.5 13.997V10.25c0-3.044 2.18-5.018 4.5-5.44V3.75Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 top-14 z-30 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">New Complaints</p>
                    {unreadCount > 0 && (
                      <button
                        className="text-xs font-semibold text-blue-600 hover:text-blue-500"
                        onClick={() => setNotifications([])}
                        type="button"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500">No new complaints yet.</p>
                  ) : (
                    <div className="max-h-64 space-y-2 overflow-y-auto">
                      {notifications.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                        >
                          <p className="text-sm font-semibold text-slate-700">{item.title}</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            #{item.complaintId} |{' '}
                            {item.createdAt ? new Date(item.createdAt).toLocaleString() : "Just now"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.12a7.5 7.5 0 0 1 15 0"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span>{user.name}</span>
                <span className="text-slate-400">-</span>
                <span>Admin</span>
              </div>
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
              <section className="grid gap-4 lg:grid-cols-3">
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

              <section className="grid gap-4 lg:grid-cols-2">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800">Complaint Volume by Status</h3>
                  <div className="mt-6 flex h-64 items-end justify-between gap-3">
                    {statusBarData.map((statusItem) => (
                      <div key={statusItem.label} className="flex flex-1 flex-col items-center gap-2">
                        <div className="relative flex h-48 w-full items-end rounded-xl bg-slate-100 px-2 py-2">
                          <div
                            className={`w-full rounded-lg ${statusItem.colorClass}`}
                            style={{ height: `${statusItem.heightPercent}%` }}
                            title={`${statusItem.label}: ${statusItem.value}`}
                          />
                        </div>
                        <p className="text-xs font-semibold text-slate-500">{statusItem.label}</p>
                        <p className="text-sm font-black text-slate-800">{statusItem.value}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800">Issue Breakdown (Pie Chart)</h3>
                  {issueBreakdown.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-500">No category data available yet.</p>
                  ) : (
                    <div className="mt-4 flex flex-wrap items-center gap-5">
                      <div
                        className="relative h-52 w-52 rounded-full border-8 border-white shadow-sm"
                        style={pieChartStyle}
                      >
                        <div className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-white/95" />
                      </div>

                      <div className="min-w-[180px] flex-1 space-y-2">
                        {issueBreakdown.map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-block h-3 w-3 rounded-full"
                                style={{ backgroundColor: item.pieColor }}
                              />
                              <span className="text-sm font-medium text-slate-700">{item.name}</span>
                            </div>
                            <span className="text-xs font-semibold text-slate-500">
                              {item.percent}% ({item.count})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                {normalizedSearchTerm && (
                  <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Showing results for: {searchTerm}
                  </p>
                )}
                {recentComplaints.length === 0 ? (
                  <p className="text-slate-600">
                    {normalizedSearchTerm
                      ? "No recent complaints match your search."
                      : "No complaints available."}
                  </p>
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
                  Assign department and staff for complaints and supervise ticket routing.
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
                  <h3 className="text-lg font-bold text-slate-800">Complaint Volume by Status</h3>
                  <div className="mt-6 flex h-64 items-end justify-between gap-3">
                    {statusBarData.map((statusItem) => (
                      <div key={statusItem.label} className="flex flex-1 flex-col items-center gap-2">
                        <div className="relative flex h-48 w-full items-end rounded-xl bg-slate-100 px-2 py-2">
                          <div
                            className={`w-full rounded-lg ${statusItem.colorClass}`}
                            style={{ height: `${statusItem.heightPercent}%` }}
                            title={`${statusItem.label}: ${statusItem.value}`}
                          />
                        </div>
                        <p className="text-xs font-semibold text-slate-500">{statusItem.label}</p>
                        <p className="text-sm font-black text-slate-800">{statusItem.value}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800">Issue Breakdown (Pie Chart)</h3>
                  {issueBreakdown.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-500">No category data available yet.</p>
                  ) : (
                    <div className="mt-4 flex flex-wrap items-center gap-5">
                      <div className="relative h-52 w-52 rounded-full border-8 border-white shadow-sm" style={pieChartStyle}>
                        <div className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-white/95" />
                      </div>

                      <div className="min-w-[180px] flex-1 space-y-2">
                        {issueBreakdown.map((item) => (
                          <div key={item.name} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-block h-3 w-3 rounded-full"
                                style={{ backgroundColor: item.pieColor }}
                              />
                              <span className="text-sm font-medium text-slate-700">{item.name}</span>
                            </div>
                            <span className="text-xs font-semibold text-slate-500">
                              {item.percent}% ({item.count})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

