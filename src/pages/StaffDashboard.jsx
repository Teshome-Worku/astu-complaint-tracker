import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL  } from "../constants/api";
import { COMPLAINT_STATUS } from "../constants/complaintStatus";

// Reusable Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, icon, color = "blue", trend }) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    amber: "text-amber-600 bg-amber-50",
    indigo: "text-indigo-600 bg-indigo-50",
    sky: "text-sky-600 bg-sky-50",
    emerald: "text-emerald-600 bg-emerald-50",
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className="text-xs text-green-600 mt-2">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

const StatusBadge = ({ status }) => {
  const normalizedStatus = String(status ?? "").trim().toLowerCase();
  
  const variants = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    assigned: "bg-indigo-50 text-indigo-700 border-indigo-200",
    "in-progress": "bg-sky-50 text-sky-700 border-sky-200",
    resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const defaultVariant = "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${variants[normalizedStatus] || defaultVariant}`}>
      {normalizedStatus ? toTitleCase(normalizedStatus) : "Unknown"}
    </span>
  );
};

const Table = ({ headers, children }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {headers.map((header, index) => (
            <th
              key={index}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {children}
      </tbody>
    </table>
  </div>
);

const Button = ({ children, variant = "primary", size = "md", onClick, disabled, className = "", ...props }) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ label, error, className = "", ...props }) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
    )}
    <input
      className={`
        w-full rounded-lg border border-gray-300 px-4 py-2.5
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        transition-shadow duration-200
        ${error ? "border-red-300 focus:ring-red-500" : ""}
        ${className}
      `}
      {...props}
    />
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
        
        <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} animate-fadeIn`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ activeItemId, onSelect, onLogout }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: DashboardIcon },
    { id: "my-complaints", label: "My Complaints", icon: ComplaintsIcon },
    { id: "profile", label: "Profile", icon: ProfileIcon },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">A</span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">ASTU Complaint Tracker</h1>
            <p className="text-xs text-gray-500">Staff Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`
              w-full flex items-center space-x-3 px-4 py-3 rounded-lg
              transition-all duration-200 group
              ${activeItemId === item.id
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
              }
            `}
          >
            <item.icon className={`w-5 h-5 ${
              activeItemId === item.id ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
            }`} />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <LogoutIcon className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

// Icon Components
const DashboardIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const ComplaintsIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const ProfileIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LogoutIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const SearchIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const NotificationIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

// Helper Functions
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

function formatDate(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString();
}

// Main Component
function StaffDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser);
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const staffId = String(currentUser?.id ?? "");
  const [activeSidebarItem, setActiveSidebarItem] = useState("dashboard");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState("");
  const [savingRemarkId, setSavingRemarkId] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [remarksDraft, setRemarksDraft] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordFeedback, setPasswordFeedback] = useState({
    type: "idle",
    message: "",
  });

  const isStaff = normalize(currentUser?.role) === "staff";

  useEffect(() => {
    if (!currentUser || !isStaff) {
      navigate("/login", { replace: true });
    }
  }, [currentUser, isStaff, navigate]);

  const fetchDashboardData = useCallback(async ({ showLoader = true } = {}) => {
    if (!staffId) return;
    if (showLoader) setIsLoading(true);
    setError("");

    try {
      const [complaintsRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/complaints`),
        axios.get(`${API_BASE_URL}/users`),
      ]);

      const allComplaints = Array.isArray(complaintsRes.data) ? complaintsRes.data : [];
      const allUsers = Array.isArray(usersRes.data) ? usersRes.data : [];

      const assignedComplaints = allComplaints.filter(
        (complaint) => String(complaint.assignedTo ?? "") === staffId
      );

      setComplaints(assignedComplaints);
      setUsers(allUsers);
    } catch (fetchError) {
      console.error("Failed to fetch staff dashboard data", fetchError);
      setError("Failed to load dashboard data. Please refresh.");
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchDashboardData({ showLoader: false });
    }, 7000);
    return () => window.clearInterval(intervalId);
  }, [fetchDashboardData]);

  const usersById = useMemo(
    () => new Map(users.map((entry) => [String(entry.id), entry])),
    [users]
  );

  const sortedComplaints = useMemo(
    () =>
      [...complaints].sort(
        (first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0)
      ),
    [complaints]
  );

  const normalizedSearchTerm = normalize(searchTerm);

  const filteredComplaints = useMemo(() => {
    if (!normalizedSearchTerm) return sortedComplaints;

    return sortedComplaints.filter((complaint) => {
      const studentName =
        usersById.get(String(complaint.userId))?.name ||
        complaint.studentName ||
        complaint.userName ||
        "Unknown Student";

      const searchableFields = [
        complaint.id,
        complaint.title,
        complaint.description,
        complaint.category,
        complaint.status,
        complaint.remarks,
        studentName,
      ];

      return searchableFields.some((field) => normalize(field).includes(normalizedSearchTerm));
    });
  }, [normalizedSearchTerm, sortedComplaints, usersById]);

  const recentComplaints = useMemo(() => sortedComplaints.slice(0, 5), [sortedComplaints]);

  const metrics = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((complaint) => normalize(complaint.status) === normalize(COMPLAINT_STATUS.PENDING)).length;
    const assigned = complaints.filter((complaint) => normalize(complaint.status) === normalize(COMPLAINT_STATUS.ASSIGNED)).length;
    const inProgress = complaints.filter(
      (complaint) => normalize(complaint.status) === normalize(COMPLAINT_STATUS.IN_PROGRESS)
    ).length;
    const resolved = complaints.filter((complaint) => normalize(complaint.status) === normalize(COMPLAINT_STATUS.RESOLVED)).length;

    return { total, pending, assigned, inProgress, resolved };
  }, [complaints]);

  const updateComplaintInState = (complaintId, patch) => {
    const targetId = String(complaintId);
    setComplaints((prevComplaints) =>
      prevComplaints.map((complaint) =>
        String(complaint.id) === targetId ? { ...complaint, ...patch } : complaint
      )
    );
    setSelectedComplaint((prevComplaint) =>
      prevComplaint && String(prevComplaint.id) === targetId
        ? { ...prevComplaint, ...patch }
        : prevComplaint
    );
  };

  const updateComplaintStatus = async (complaintId, status) => {
    if (!complaintId) return;

    setUpdatingStatusId(String(complaintId));
    setError("");

    try {
      await axios.patch(`${API_BASE_URL}/complaints/${complaintId}`, { status });
      updateComplaintInState(complaintId, { status });
    } catch (statusError) {
      console.error("Failed to update complaint status", statusError);
      setError("Failed to update complaint status. Please retry.");
    } finally {
      setUpdatingStatusId("");
    }
  };

  const openDetailsModal = (complaint) => {
    setSelectedComplaint(complaint);
    setIsDetailsModalOpen(true);
  };

  const openRemarksModal = (complaint) => {
    setSelectedComplaint(complaint);
    setRemarksDraft(complaint?.remarks || "");
    setIsRemarksModalOpen(true);
  };

  const saveRemarks = async () => {
    const complaintId = selectedComplaint?.id;
    if (!complaintId) return;

    setSavingRemarkId(String(complaintId));
    setError("");

    try {
      await axios.patch(`${API_BASE_URL}/complaints/${complaintId}`, {
        remarks: remarksDraft.trim(),
      });
      updateComplaintInState(complaintId, { remarks: remarksDraft.trim() });
      setIsRemarksModalOpen(false);
      setRemarksDraft("");
    } catch (remarkError) {
      console.error("Failed to save remarks", remarkError);
      setError("Failed to save remarks. Please retry.");
    } finally {
      setSavingRemarkId("");
    }
  };

  const handlePasswordInputChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
    if (passwordFeedback.type !== "idle") {
      setPasswordFeedback({ type: "idle", message: "" });
    }
  };

  const updatePassword = async (event) => {
    event.preventDefault();
    if (!currentUser?.id || isUpdatingPassword) return;

    const currentPassword = passwordForm.currentPassword.trim();
    const newPassword = passwordForm.newPassword.trim();
    const confirmPassword = passwordForm.confirmPassword.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordFeedback({ type: "error", message: "All password fields are required." });
      return;
    }

    if (currentPassword !== String(currentUser.password ?? "")) {
      setPasswordFeedback({ type: "error", message: "Current password is incorrect." });
      return;
    }

    if (newPassword.length < 4) {
      setPasswordFeedback({
        type: "error",
        message: "New password must be at least 4 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: "error", message: "New password and confirmation do not match." });
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordFeedback({
        type: "error",
        message: "New password must be different from current password.",
      });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordFeedback({ type: "idle", message: "" });

    try {
      await axios.patch(`${API_BASE_URL}/users/${currentUser.id}`, {
        password: newPassword,
      });

      const updatedUser = { ...currentUser, password: newPassword };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setUsers((prevUsers) =>
        prevUsers.map((entry) =>
          String(entry.id) === String(updatedUser.id)
            ? { ...entry, password: newPassword }
            : entry
        )
      );
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordFeedback({ type: "success", message: "Password updated successfully." });
    } catch (passwordError) {
      console.error("Failed to update password", passwordError);
      setPasswordFeedback({ type: "error", message: "Failed to update password. Try again." });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSidebarSelection = (item) => {
    setActiveSidebarItem(item.id);
  };

  const requestLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
    localStorage.removeItem("user");
    navigate("/login");
  };

  const renderOverviewSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Assigned"
          value={metrics.total}
          icon={<DashboardIcon className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Pending"
          value={metrics.pending}
          icon={<ComplaintsIcon className="w-6 h-6" />}
          color="amber"
        />
        <StatCard
          title="Assigned"
          value={metrics.assigned}
          icon={<ComplaintsIcon className="w-6 h-6" />}
          color="indigo"
        />
        <StatCard
          title="In Progress"
          value={metrics.inProgress}
          icon={<ComplaintsIcon className="w-6 h-6" />}
          color="sky"
        />
        <StatCard
          title="Resolved"
          value={metrics.resolved}
          icon={<ComplaintsIcon className="w-6 h-6" />}
          color="emerald"
        />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Complaints</h2>
          <span className="text-sm text-gray-500">Last 5 assigned</span>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No assigned complaints yet.</p>
          </div>
        ) : (
          <Table headers={["Title", "Category", "Student", "Status", "Created Date"]}>
            {recentComplaints.map((complaint) => {
              const studentName =
                usersById.get(String(complaint.userId))?.name ||
                complaint.studentName ||
                complaint.userName ||
                "Unknown Student";

              return (
                <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{complaint.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{complaint.category || "N/A"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{studentName}</td>
                  <td className="px-6 py-4 text-sm">
                    <StatusBadge status={complaint.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(complaint.createdAt)}</td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>
    </div>
  );

  const renderMyComplaintsSection = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      );
    }

    if (filteredComplaints.length === 0) {
      return (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">
              {normalizedSearchTerm ? "No matching complaints found." : "No assigned complaints found."}
            </p>
          </div>
        </Card>
      );
    }

    return (
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredComplaints.map((complaint) => {
                const studentName =
                  usersById.get(String(complaint.userId))?.name ||
                  complaint.studentName ||
                  complaint.userName ||
                  "Unknown Student";

                return (
                  <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{complaint.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{complaint.category || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{studentName}</td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(complaint.createdAt)}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openDetailsModal(complaint)}
                        >
                          View
                        </Button>
                        
                        <select
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={normalize(complaint.status)}
                          onChange={(e) => updateComplaintStatus(complaint.id, e.target.value)}
                          disabled={updatingStatusId === String(complaint.id)}
                        >
                          <option value="assigned">Assigned</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openRemarksModal(complaint)}
                          disabled={savingRemarkId === String(complaint.id)}
                        >
                          {complaint.remarks ? "Edit" : "Add"} Remarks
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  const renderProfileSection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="text-base font-medium text-gray-900 mt-1">{currentUser?.name || "N/A"}</p>
          </div>
          <div className="border-b border-gray-200 pb-4">
            <p className="text-sm text-gray-500">Email Address</p>
            <p className="text-base font-medium text-gray-900 mt-1">{currentUser?.email || "N/A"}</p>
          </div>
          <div className="border-b border-gray-200 pb-4">
            <p className="text-sm text-gray-500">Department</p>
            <p className="text-base font-medium text-gray-900 mt-1">{currentUser?.department || "Not Assigned"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="text-base font-medium text-gray-900 mt-1">{toTitleCase(currentUser?.role || "N/A")}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
        <form onSubmit={updatePassword} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            name="currentPassword"
            value={passwordForm.currentPassword}
            onChange={handlePasswordInputChange}
          />
          <Input
            label="New Password"
            type="password"
            name="newPassword"
            value={passwordForm.newPassword}
            onChange={handlePasswordInputChange}
          />
          <Input
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordInputChange}
          />

          {passwordFeedback.type !== "idle" && (
            <div className={`p-3 rounded-lg ${
              passwordFeedback.type === "success" 
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {passwordFeedback.message}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isUpdatingPassword}
            className="w-full"
          >
            {isUpdatingPassword ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </Card>
    </div>
  );

  if (!currentUser || !isStaff) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeItemId={activeSidebarItem}
        onSelect={handleSidebarSelection}
        onLogout={requestLogout}
      />

      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">
                {activeSidebarItem === "dashboard" && "Dashboard"}
                {activeSidebarItem === "my-complaints" && "My Complaints"}
                {activeSidebarItem === "profile" && "Profile"}
              </h1>

              <div className="flex items-center space-x-6">
                {/* Search Bar - Show on all pages */}
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search complaints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Notification Icon */}
                <button className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  <NotificationIcon className="w-6 h-6" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Staff Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {currentUser?.name?.charAt(0) || "S"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{currentUser?.name || "Staff User"}</p>
                    <p className="text-xs text-gray-500">Staff</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {activeSidebarItem === "dashboard" && renderOverviewSection()}
          {activeSidebarItem === "my-complaints" && renderMyComplaintsSection()}
          {activeSidebarItem === "profile" && renderProfileSection()}
        </main>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Complaint Details"
        size="lg"
      >
        {selectedComplaint && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{selectedComplaint.title}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Complaint #{selectedComplaint.id} | {selectedComplaint.category || "N/A"}
                </p>
              </div>
              <StatusBadge status={selectedComplaint.status} />
            </div>

            <p className="text-gray-700">{selectedComplaint.description || "N/A"}</p>

            {selectedComplaint.attachment?.dataUrl && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-2">Attachment</p>
                <img
                  src={selectedComplaint.attachment.dataUrl}
                  alt="Attachment"
                  className="max-h-64 rounded-lg border border-gray-200"
                />
                <p className="text-xs text-gray-500 mt-2">{selectedComplaint.attachment.fileName}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Student Name</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {usersById.get(String(selectedComplaint.userId))?.name ||
                    selectedComplaint.studentName ||
                    selectedComplaint.userName ||
                    "Unknown Student"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created Date</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {formatDate(selectedComplaint.createdAt)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Remarks</p>
              <p className="text-sm text-gray-900 mt-1">
                {selectedComplaint.remarks || "No remarks added yet."}
              </p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isRemarksModalOpen}
        onClose={() => {
          setIsRemarksModalOpen(false);
          setRemarksDraft("");
        }}
        title={selectedComplaint?.remarks ? "Edit Remarks" : "Add Remarks"}
      >
        {selectedComplaint && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Complaint #{selectedComplaint.id} - {selectedComplaint.title}
            </p>
            
            <textarea
              value={remarksDraft}
              onChange={(e) => setRemarksDraft(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add your remarks here..."
            />

            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsRemarksModalOpen(false);
                  setRemarksDraft("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={saveRemarks}
                disabled={savingRemarkId === String(selectedComplaint.id)}
              >
                {savingRemarkId === String(selectedComplaint.id) ? "Saving..." : "Save Remarks"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Logout"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Are you sure you want to log out?</p>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsLogoutModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmLogout}>
              Logout
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default StaffDashboard;