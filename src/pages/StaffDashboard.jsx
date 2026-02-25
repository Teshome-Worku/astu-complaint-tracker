import { useEffect, useState } from "react";
import axios from "axios";

const StaffDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [complaints, setComplaints] = useState([]);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/complaints?department=${user.department}`
      );
      setComplaints(res.data);
    } catch (error) {
      console.error("Error fetching complaints");
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/complaints/${id}`, {
        status: newStatus,
      });

      fetchComplaints();
    } catch (error) {
      console.error("Failed to update status");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">
        Department Staff Dashboard
      </h1>

      {complaints.length === 0 ? (
        <p>No assigned complaints.</p>
      ) : (
        <div className="space-y-5">
          {complaints.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-gray-900 border border-gray-800 p-6 rounded-xl"
            >
              <div className="flex justify-between mb-3">
                <h2 className="text-xl font-semibold">
                  {complaint.title}
                </h2>

                <span className="px-3 py-1 text-sm bg-gray-700 rounded-full">
                  {complaint.status}
                </span>
              </div>

              <p className="text-gray-400 mb-4">
                {complaint.description}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    updateStatus(complaint.id, "in-progress")
                  }
                  className="bg-blue-600 px-4 py-2 rounded-lg"
                >
                  Mark In Progress
                </button>

                <button
                  onClick={() =>
                    updateStatus(complaint.id, "resolved")
                  }
                  className="bg-green-600 px-4 py-2 rounded-lg"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;