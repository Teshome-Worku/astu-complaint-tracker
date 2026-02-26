import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const departments = ["IT", "Maintenance", "Academic", "Finance", "Facility", "Discipline"];

const sidebarItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "complaints", label: "Complaints" },
  { id: "users", label: "Users" },
  { id: "categories", label: "Categories" },
  { id: "reports", label: "Reports" },
  { id: "settings", label: "Settings" },
];

const sidebarLogoCandidates = [
  "/astu-complaint-tracker.png",
  "/astu-complaint-logo.png",
  "/astu-logo.png",
  "/logo.png",
  "/favicon.svg",
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

function getSidebarIcon(id) {
  if (id === "dashboard") {
    return (
      <svg
        aria-hidden="true"
        className="h-4.5 w-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" />
      </svg>
    );
  }

  if (id === "complaints") {
    return (
      <svg
        aria-hidden="true"
        className="h-4.5 w-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          d="M8 7h12M8 12h12M8 17h12M3 7h.01M3 12h.01M3 17h.01"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (id === "users") {
    return (
      <svg
        aria-hidden="true"
        className="h-4.5 w-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm6 13a7 7 0 0 0-14 0M18 20a5 5 0 0 0-5-5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (id === "categories") {
    return (
      <svg
        aria-hidden="true"
        className="h-4.5 w-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          d="M8 7h12M8 12h12M8 17h12M3 7h.01M3 12h.01M3 17h.01"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (id === "reports") {
    return (
      <svg
        aria-hidden="true"
        className="h-4.5 w-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M4 19h16M7 15V9M12 15V5M17 15v-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="h-4.5 w-4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 15.75a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 1-2 0 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 1 0-2 1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 1 2 0 1.65 1.65 0 0 0 1 .6 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.24.3.4.65.46 1.03.06.37-.02.75-.2 1.08-.18.33-.47.6-.82.78-.36.18-.74.26-1.14.24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SidebarItem({ item, isActive, onSelect }) {
  return (
    <button
      className={`group flex w-full items-center gap-3 rounded-xl border-l-4 px-3 py-2.5 text-left text-sm transition ${
        isActive
          ? "border-cyan-300 bg-cyan-400/20 text-white font-medium"
          : "border-transparent text-blue-100/90 hover:bg-white/10 hover:text-white"
      }`}
      onClick={() => onSelect(item)}
      type="button"
    >
      <span
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${
          isActive
            ? "bg-cyan-300/25 text-cyan-100"
            : "bg-white/10 text-blue-200 group-hover:bg-white/15 group-hover:text-white"
        }`}
      >
        {getSidebarIcon(item.id)}
      </span>
      <span>{item.label}</span>
    </button>
  );
}

function AdminSidebar({ activeItemId, isMobileOpen, onClose, onLogout, onSelectItem }) {
  const [logoIndex, setLogoIndex] = useState(0);
  const logoSrc = sidebarLogoCandidates[Math.min(logoIndex, sidebarLogoCandidates.length - 1)];
  const handleSelectItem = (item) => {
    onSelectItem(item);
    onClose();
  };

  return (
    <>
      {isMobileOpen && (
        <button
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-slate-950/55 lg:hidden"
          onClick={onClose}
          type="button"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[256px] border-r border-blue-900/40 bg-gradient-to-b from-blue-950 via-blue-900 to-slate-900 text-slate-100 shadow-[6px_0_24px_rgba(2,6,23,0.32)] transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full min-h-screen flex-col px-5 py-6">
          <div className="mb-2 flex justify-end lg:hidden">
            <button
              aria-label="Close sidebar"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
              onClick={onClose}
              type="button"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="border-b border-white/15 pb-5 text-center">
            <img
              alt="ASTU Complaint Tracker Logo"
              className="mx-auto h-12 w-auto object-contain"
              onError={() => setLogoIndex((prev) => prev + 1)}
              src={logoSrc}
            />
            <div className="mt-3 space-y-0.5">
              <p className="text-base font-medium text-white">ASTU Complaint Tracker</p>
              <p className="text-xs text-blue-200/90">Admin Dashboard</p>
            </div>
          </div>

          <nav className="mt-6 space-y-1.5">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                isActive={activeItemId === item.id}
                onSelect={handleSelectItem}
              />
            ))}
          </nav>

          <div className="mt-auto border-t border-white/15 pt-4">
            <button
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-rose-200 transition hover:bg-rose-500/15 hover:text-rose-100"
              onClick={onLogout}
              type="button"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/20 text-rose-100 group-hover:bg-rose-500/30">
                <svg
                  aria-hidden="true"
                  className="h-4.5 w-4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="m16 17 5-5m0 0-5-5m5 5H9m4 5v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [activeSidebarItem, setActiveSidebarItem] = useState("dashboard");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const handleSidebarSelection = (item) => {
    setActiveSidebarItem(item.id);
  };

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

  const pieSliceLabels = useMemo(() => {
    let runningPercent = 0;
    return issueBreakdown
      .filter((item) => item.percent > 0)
      .map((item) => {
        const start = runningPercent;
        const end = runningPercent + item.percent;
        const midpoint = (start + end) / 2;
        runningPercent = end;

        const angleInRadians = ((midpoint / 100) * 360 - 90) * (Math.PI / 180);
        const radius = 33;
        const x = 50 + radius * Math.cos(angleInRadians);
        const y = 50 + radius * Math.sin(angleInRadians);

        return {
          name: item.name,
          percent: item.percent,
          x,
          y,
        };
      });
  }, [issueBreakdown]);

  const unreadCount = notifications.length;

  const userSummary = useMemo(() => {
    const totalUsers = staffUsers.length;
    const staffWithDepartment = staffUsers.filter((staff) => normalize(staff.department)).length;
    const uniqueDepartments = new Set(
      staffUsers.map((staff) => normalize(staff.department)).filter(Boolean)
    );

    return {
      totalUsers,
      staffWithDepartment,
      departmentCoverage: uniqueDepartments.size,
      unassignedStaff: totalUsers - staffWithDepartment,
    };
  }, [staffUsers]);

  const categoryInsights = useMemo(() => {
    const categoryMap = complaints.reduce((acc, complaint) => {
      const name = toTitleCase(normalize(complaint.category) || "Uncategorized");
      if (!acc[name]) {
        acc[name] = { name, total: 0, resolved: 0, pending: 0, inProgress: 0, assigned: 0 };
      }
      acc[name].total += 1;
      if (complaint.status === "resolved") acc[name].resolved += 1;
      if (complaint.status === "pending" || complaint.status === "new") acc[name].pending += 1;
      if (complaint.status === "in-progress") acc[name].inProgress += 1;
      if (complaint.status === "assigned") acc[name].assigned += 1;
      return acc;
    }, {});

    return Object.values(categoryMap)
      .map((entry) => ({
        ...entry,
        resolutionRate: entry.total ? Math.round((entry.resolved / entry.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [complaints]);

  const reportRows = useMemo(() => {
    const rows = complaints.reduce((acc, complaint) => {
      const date = new Date(complaint.createdAt || Date.now());
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!acc[key]) {
        acc[key] = {
          key,
          label: date.toLocaleString(undefined, { month: "short", year: "numeric" }),
          submitted: 0,
          resolved: 0,
        };
      }
      acc[key].submitted += 1;
      if (complaint.status === "resolved") {
        acc[key].resolved += 1;
      }
      return acc;
    }, {});

    return Object.values(rows)
      .sort((a, b) => (a.key < b.key ? 1 : -1))
      .slice(0, 8)
      .map((row) => ({
        ...row,
        resolutionRate: row.submitted ? Math.round((row.resolved / row.submitted) * 100) : 0,
      }));
  }, [complaints]);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const cancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
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
                  <label className="min-w-45 flex-1">
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

                  <label className="min-w-47.5 flex-1">
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
      <AdminSidebar
        activeItemId={activeSidebarItem}
        isMobileOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        onSelectItem={handleSidebarSelection}
      />

      <div className="flex-1 lg:h-screen lg:overflow-y-auto">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex w-full max-w-xl items-center gap-2">
              <button
                aria-label="Open sidebar menu"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="m21 21-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 pl-10 text-sm text-slate-700 outline-none transition focus:border-blue-500"
                  placeholder="Search complaints, categories, departments..."
                  onChange={(event) => setSearchTerm(event.target.value)}
                  value={searchTerm}
                  type="text"
                />
              </div>
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

          {activeSidebarItem === "dashboard" && (
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
                    <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:flex-nowrap sm:items-center">
                      <div
                        className="relative h-52 w-52 rounded-full border-8 border-white shadow-sm"
                        style={pieChartStyle}
                      >
                        {pieSliceLabels.map((sliceLabel) => (
                          <span
                            key={sliceLabel.name}
                            className="absolute text-lg font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
                            style={{
                              left: `${sliceLabel.x}%`,
                              top: `${sliceLabel.y}%`,
                              transform: "translate(-50%, -50%)",
                            }}
                          >
                            {sliceLabel.percent}%
                          </span>
                        ))}
                        <div className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-white/95" />
                      </div>

                      <div className="space-y-3 sm:min-w-[170px] sm:flex-1">
                        {issueBreakdown.map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center gap-2 text-slate-700"
                          >
                            <span
                              className="inline-block h-3 w-3 rounded-full"
                              style={{ backgroundColor: item.pieColor }}
                            />
                            <span className="text-sm font-medium">{item.name}</span>
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
                    onClick={() => setActiveSidebarItem("complaints")}
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

          {activeSidebarItem === "complaints" && (
            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-2xl font-black text-slate-800">Complaint Management</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Assign complaints to departments/staff and supervise ticket routing.
                </p>
              </div>
              {renderManagementList()}
            </section>
          )}

          {activeSidebarItem === "users" && (
            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-2xl font-black text-slate-800">User Management</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Monitor staff accounts and department mapping for complaint operations.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Staff</p>
                  <p className="mt-2 text-3xl font-black text-slate-800">{userSummary.totalUsers}</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">With Department</p>
                  <p className="mt-2 text-3xl font-black text-blue-700">
                    {userSummary.staffWithDepartment}
                  </p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Departments Covered</p>
                  <p className="mt-2 text-3xl font-black text-emerald-700">
                    {userSummary.departmentCoverage}
                  </p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Without Department</p>
                  <p className="mt-2 text-3xl font-black text-amber-600">
                    {userSummary.unassignedStaff}
                  </p>
                </article>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800">Staff Directory</h3>
                {staffUsers.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">No staff users found.</p>
                ) : (
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="text-slate-500">
                        <tr>
                          <th className="pb-2 pr-4 font-semibold">ID</th>
                          <th className="pb-2 pr-4 font-semibold">Name</th>
                          <th className="pb-2 pr-4 font-semibold">Email</th>
                          <th className="pb-2 font-semibold">Department</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700">
                        {staffUsers.map((staff) => (
                          <tr key={staff.id} className="border-t border-slate-200">
                            <td className="py-2 pr-4 font-medium">{staff.id}</td>
                            <td className="py-2 pr-4">{staff.name}</td>
                            <td className="py-2 pr-4">{staff.email}</td>
                            <td className="py-2">{staff.department || "Not set"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeSidebarItem === "categories" && (
            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-2xl font-black text-slate-800">Category Insights</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Track complaint volume and resolution performance by category.
                </p>
              </div>

              {categoryInsights.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-slate-600">No category data available.</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="text-slate-500">
                        <tr>
                          <th className="pb-2 pr-4 font-semibold">Category</th>
                          <th className="pb-2 pr-4 font-semibold">Total</th>
                          <th className="pb-2 pr-4 font-semibold">Pending</th>
                          <th className="pb-2 pr-4 font-semibold">Assigned</th>
                          <th className="pb-2 pr-4 font-semibold">In Progress</th>
                          <th className="pb-2 pr-4 font-semibold">Resolved</th>
                          <th className="pb-2 font-semibold">Resolution Rate</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700">
                        {categoryInsights.map((categoryRow) => (
                          <tr key={categoryRow.name} className="border-t border-slate-200">
                            <td className="py-2 pr-4 font-medium">{categoryRow.name}</td>
                            <td className="py-2 pr-4">{categoryRow.total}</td>
                            <td className="py-2 pr-4">{categoryRow.pending}</td>
                            <td className="py-2 pr-4">{categoryRow.assigned}</td>
                            <td className="py-2 pr-4">{categoryRow.inProgress}</td>
                            <td className="py-2 pr-4">{categoryRow.resolved}</td>
                            <td className="py-2">{categoryRow.resolutionRate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeSidebarItem === "reports" && (
            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-2xl font-black text-slate-800">Reports</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Monthly operational report based on submitted and resolved complaints.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Complaints</p>
                  <p className="mt-2 text-3xl font-black text-slate-800">{metrics.total}</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resolution Rate</p>
                  <p className="mt-2 text-3xl font-black text-blue-700">{metrics.resolutionRate}%</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Open Tickets</p>
                  <p className="mt-2 text-3xl font-black text-amber-600">
                    {metrics.pending + metrics.assigned + metrics.inProgress}
                  </p>
                </article>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800">Monthly Performance</h3>
                {reportRows.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">No reporting data available yet.</p>
                ) : (
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="text-slate-500">
                        <tr>
                          <th className="pb-2 pr-4 font-semibold">Month</th>
                          <th className="pb-2 pr-4 font-semibold">Submitted</th>
                          <th className="pb-2 pr-4 font-semibold">Resolved</th>
                          <th className="pb-2 font-semibold">Resolution Rate</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700">
                        {reportRows.map((row) => (
                          <tr key={row.key} className="border-t border-slate-200">
                            <td className="py-2 pr-4 font-medium">{row.label}</td>
                            <td className="py-2 pr-4">{row.submitted}</td>
                            <td className="py-2 pr-4">{row.resolved}</td>
                            <td className="py-2">{row.resolutionRate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeSidebarItem === "settings" && (
            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-2xl font-black text-slate-800">Settings</h2>
                <p className="mt-2 text-sm text-slate-600">
                  System configuration snapshot for admin operations.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800">Notification Settings</h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-700">
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <span>Live complaint polling</span>
                      <span className="font-semibold text-emerald-700">Enabled (5s)</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <span>Unread notifications</span>
                      <span className="font-semibold text-blue-700">{unreadCount}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <span>Window focus refresh</span>
                      <span className="font-semibold text-emerald-700">Enabled</span>
                    </div>
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800">Assignment Rules</h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-700">
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      Ticket assignment is allowed only for <span className="font-semibold">pending/new</span> complaints.
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      Assignment requires both <span className="font-semibold">department</span> and <span className="font-semibold">staff</span>.
                    </div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      Staff receives tickets by <span className="font-semibold">assignedStaffId</span>.
                    </div>
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
