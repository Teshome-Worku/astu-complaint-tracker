import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const statusBadgeClass = {
  pending: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  "in-progress": "bg-sky-500/20 text-sky-300 border border-sky-500/30",
  resolved: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
};

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function StaffDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const staffDepartment = normalize(user?.department);
  const staffId = String(user?.id ?? "");

  const [activeSection, setActiveSection] = useState("assigned");
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  const sortedComplaints = useMemo(
    () =>
      [...complaints].sort(
        (first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0)
      ),
    [complaints]
  );

  const fetchComplaints = useCallback(async ({ showLoader = true } = {}) => {
    if (showLoader) {
      setIsLoading(true);
    }
    setError("");

    try {
      const res = await axios.get("http://localhost:5000/complaints");
      const allComplaints = Array.isArray(res.data) ? res.data : [];

      const filteredComplaints = allComplaints.filter((complaint) => {
        const complaintAssignedStaffId = String(complaint.assignedStaffId ?? "");
        const isDirectlyAssigned = complaintAssignedStaffId && complaintAssignedStaffId === staffId;
        if (isDirectlyAssigned) return true;

        // Keep backward compatibility for older records that have no assignedStaffId.
        if (complaintAssignedStaffId) return false;
        if (!staffDepartment) return false;

        const assignedDepartment = normalize(complaint.assignedDepartment);
        const complaintDepartment = normalize(complaint.department);
        const complaintCategory = normalize(complaint.category);
        return (
          assignedDepartment === staffDepartment ||
          complaintDepartment === staffDepartment ||
          complaintCategory === staffDepartment
        );
      });

      setComplaints(filteredComplaints);
    } catch (fetchError) {
      console.error("Error fetching complaints", fetchError);
      setError("Failed to load complaints. Please refresh.");
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  }, [staffDepartment, staffId]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchComplaints({ showLoader: false });
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [fetchComplaints]);

  const updateStatus = async (id, newStatus) => {
    if (!id) return;

    setUpdatingId(id);
    setError("");

    try {
      await axios.patch(`http://localhost:5000/complaints/${id}`, { status: newStatus });
      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint.id === id ? { ...complaint, status: newStatus } : complaint
        )
      );
    } catch (updateError) {
      console.error("Failed to update status", updateError);
      setError("Status update failed. Please try again.");
    } finally {
      setUpdatingId("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const renderComplaintList = () => {
    if (error) {
      return (
        <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      );
    }

    if (isLoading) {
      return <p className="text-slate-400">Loading complaints...</p>;
    }

    if (sortedComplaints.length === 0) {
      return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-slate-300">No assigned complaints found.</p>
        </div>
      );
    }

    return (
      <section className="space-y-4">
        {sortedComplaints.map((complaint) => (
          <article
            key={complaint.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/20"
          >
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-xl font-semibold text-white">{complaint.title}</h2>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  statusBadgeClass[complaint.status] ||
                  "bg-slate-700/70 text-slate-200 border border-slate-600"
                }`}
              >
                {complaint.status || "unknown"}
              </span>
            </div>

            <p className="mb-3 text-sm text-slate-300">{complaint.description}</p>

            {(complaint.attachment?.dataUrl || complaint.attachment?.url) && (
              <div className="mb-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
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
                    className="h-36 w-full max-w-sm rounded-xl border border-slate-700 object-cover transition hover:opacity-90"
                    src={complaint.attachment?.dataUrl || complaint.attachment?.url}
                  />
                </a>
                <p className="mt-2 text-xs text-slate-400">
                  {complaint.attachment?.fileName || "image-attachment"}
                </p>
              </div>
            )}

            <div className="mb-4 text-xs text-slate-400">
              <span>Category: {complaint.category || "N/A"}</span>
              <span className="mx-2">|</span>
              <span>Submitted: {new Date(complaint.createdAt).toLocaleString()}</span>
            </div>

            {(complaint.assignedDepartment || complaint.assignedStaffName || complaint.assignedStaffId) && (
              <p className="mb-4 text-xs text-indigo-300">
                Assigned by Admin: {complaint.assignedDepartment || "Unspecified Department"}
                {complaint.assignedStaffName
                  ? ` - ${complaint.assignedStaffName}`
                  : complaint.assignedStaffId
                    ? ` - Staff #${complaint.assignedStaffId}`
                    : ""}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                  updatingId === complaint.id
                    ? "cursor-not-allowed bg-sky-700/70"
                    : "bg-sky-600 hover:bg-sky-500"
                }`}
                disabled={updatingId === complaint.id}
                onClick={() => updateStatus(complaint.id, "in-progress")}
                type="button"
              >
                Mark In Progress
              </button>

              <button
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                  updatingId === complaint.id
                    ? "cursor-not-allowed bg-emerald-700/70"
                    : "bg-emerald-600 hover:bg-emerald-500"
                }`}
                disabled={updatingId === complaint.id}
                onClick={() => updateStatus(complaint.id, "resolved")}
                type="button"
              >
                Mark Resolved
              </button>
            </div>
          </article>
        ))}
      </section>
    );
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
          <h1 className="text-2xl font-bold">Staff Dashboard</h1>
          <p className="mt-2 text-slate-400">Session not found. Please log in again.</p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 lg:h-screen">
      <aside className="w-full border-b border-slate-800 bg-slate-900/90 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col p-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-indigo-400">Staff Panel</h2>
            <p className="mt-1 text-sm text-slate-400">
              Manage complaint flow and progress updates.
            </p>
          </div>

          <nav className="mt-8 space-y-2">
            <button
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                activeSection === "assigned"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
                  : "bg-slate-800/20 text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
              onClick={() => setActiveSection("assigned")}
              type="button"
            >
              View Assigned Complaints
            </button>

            <button
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                activeSection === "status"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
                  : "bg-slate-800/20 text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
              onClick={() => setActiveSection("status")}
              type="button"
            >
              Update Ticket Status
            </button>

            <button
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                activeSection === "remarks"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
                  : "bg-slate-800/20 text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
              onClick={() => setActiveSection("remarks")}
              type="button"
            >
              Add Remarks
            </button>
          </nav>

          <button
            className="mt-auto rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500"
            onClick={handleLogout}
            type="button"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:h-screen lg:overflow-y-auto">
        <header className="border-b border-slate-800 bg-slate-900/85 px-4 py-4 backdrop-blur lg:sticky lg:top-0 lg:z-20 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tight">Department Staff Dashboard</h1>
              <p className="mt-1 text-sm text-slate-400">
                Welcome, {user.name}. Review complaints and update progress.
              </p>
            </div>
            <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
              {staffDepartment ? `Department: ${user.department}` : "Department: Not set"}
            </span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {activeSection === "assigned" && (
            <section className="mx-auto max-w-6xl">
              <h2 className="mb-4 text-xl font-bold text-white">Assigned Complaints</h2>
              {renderComplaintList()}
            </section>
          )}

          {activeSection === "status" && (
            <section className="mx-auto max-w-6xl">
              <h2 className="mb-4 text-xl font-bold text-white">Update Ticket Status</h2>
              {renderComplaintList()}
            </section>
          )}

          {activeSection === "remarks" && (
            <section className="mx-auto max-w-6xl rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <h2 className="text-xl font-bold text-white">Add Remarks</h2>
              <p className="mt-2 text-sm text-slate-400">
                Remarks panel placeholder. Complaint logic remains unchanged and can be connected here later.
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default StaffDashboard;
