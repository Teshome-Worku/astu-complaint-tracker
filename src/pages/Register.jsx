import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../constants/api";
import {ROLES} from "../constants/roles";
import {ROUTES} from "../constants/routes";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      // Check if email already exists
      const res = await axios.get(
        `${API_BASE_URL}/users?email=${formData.email}`
      );

      if (res.data.length > 0) {
        setError("Email already registered");
        setTimeout(() => setError(""), 5000);
        setIsSubmitting(false);
        return;
      }

      // check if email is an ASTU email
      if(!formData.email.endsWith("@astu.edu.et")) {
        setError("Only ASTU email addresses are allowed");
        setTimeout(() => setError(""), 5000);
        setIsSubmitting(false);
        return;
      }

      // Create new user with default role
      await axios.post(`${API_BASE_URL}/users`, {
        ...formData,
        role: ROLES.STUDENT,
      });

      setSuccessToast("Registered successfully. Redirecting to login...");
      setTimeout(() => {
        setSuccessToast("");
        navigate(ROUTES.LOGIN);
      }, 1200);
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="safe-area-pt safe-area-pb min-h-screen flex">
      {successToast && (
        <div className="fixed top-4 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg">
          {successToast}
        </div>
      )}

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 bg-linear-to-br from-indigo-700 via-purple-700 to-gray-900 text-white flex-col justify-center items-center p-12 animate-slide-in-up">
        <h1 className="text-4xl font-extrabold mb-6 text-center leading-snug">
          Join ASTU Smart Complaint Tracking
        </h1>

        <p className="text-gray-200 text-center max-w-md mb-8">
          Submit complaints efficiently, track progress transparently,
          and communicate seamlessly with university departments.
        </p>

        <div className="space-y-4 text-gray-300">
          <p>✔ Fast complaint submission</p>
          <p>✔ Real-time status updates</p>
          <p>✔ Secure role-based access</p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 bg-gray-950 items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 sm:p-7 animate-slide-in-up-delay">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-5 text-center">
            Create Account
          </h2>

          <p className="mt-1 mb-4 text-[11px] leading-4 text-slate-400 text-center">
            Register is for ASTU students only. If you are staff or an administrator, please contact your administrator or support.
          </p>

          {error && (
            <p className="mb-4 text-red-500 text-sm text-center">{error}</p>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                required
                className="w-full px-3.5 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                required
                className="w-full px-3.5 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                required
                className="w-full px-3.5 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed rounded-lg text-sm font-semibold text-white transition duration-300 inline-flex items-center justify-center gap-2"
            >
              {isSubmitting && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="text-gray-400 text-center text-sm mt-5">
            Already have an account?{" "}
            <Link to={ROUTES.LOGIN} className="text-indigo-400 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
