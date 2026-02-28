import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../constants/api";



// icons These are inline SVG components for better performance and styling control
const EmailIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22 6 12 13 2 6m20 0v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6m20 0L12 11 2 6"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

const LockIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16 10V7a4 4 0 1 0-8 0v3m-2 0h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

const EyeIcon = ({ show }) => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {show ? (
      <path
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm7 0c-2.27 4.39-5.91 7-10 7s-7.73-2.61-10-7c2.27-4.39 5.91-7 10-7s7.73 2.61 10 7Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    ) : (
      <path
        d="m3 3 18 18M9.88 9.88A3 3 0 0 0 9 12a3 3 0 0 0 3 3c.83 0 1.58-.335 2.12-.88M2 13c2.27 4.39 5.91 7 10 7 2.21 0 4.23-.76 5.94-2.06M22 12.15C19.73 7.76 16.09 5.15 12 5.15c-.84 0-1.67.22-2.46.55"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    )}
  </svg>
);

const UniversityIcon = () => (
  <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 21h18M5 18h14M12 3 3 8v10h18V8l-9-5Zm-4 8v4m4-4v4m4-4v4m4-4v4"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [activeField, setActiveField] = useState(null);

  const validateEmail = (email) => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 4) return "Password must be at least 4 characters";
    return "";
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: name === "email" ? validateEmail(value) : validatePassword(value),
      }));
    }
    if (loginError) setLoginError("");
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: name === "email" ? validateEmail(value) : validatePassword(value),
    }));
    setActiveField(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    setErrors({ email: emailError, password: passwordError });
    setTouched({ email: true, password: true });

    if (emailError || passwordError) return;

    setIsLoading(true);
    setLoginError("");

    try {
      const res = await axios.get(`${API_BASE_URL}/users?email=${formData.email}`);
      const user = res.data?.[0];

      if (!user || user.password !== formData.password) {
        setLoginError("Invalid credentials");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));

      const normalizedRole = String(user.role || "").trim().toLowerCase();
      const dashboard =
        normalizedRole === "admin"
          ? "/admin-dashboard"
          : normalizedRole === "staff"
            ? "/staff-dashboard"
            : "/student-dashboard";

      navigate(dashboard);
    } catch {
      setLoginError("Connection error");
      setIsLoading(false);
    }
  };

  return (
    <div className="safe-area-pt safe-area-pb relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-950 p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-44 -right-40 h-105 w-105 rounded-full bg-indigo-500/25 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-44 -left-40 h-105 w-105 rounded-full bg-purple-500/20 blur-3xl animate-pulse"></div>
      </div>

      <div className="animate-slide-in-up relative w-full max-w-sm transform transition-all duration-500">
        <div className="w-full rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl sm:p-7">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 inline-flex items-center justify-center text-indigo-400">
              <UniversityIcon />
            </div>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Welcome Back!</h1>
            <p className="mt-2 text-sm font-medium text-indigo-300 sm:text-base">
              Adama Science and Technology University
            </p>
            <p className="mt-1 text-sm text-gray-300">Smart Complaint & Issue Tracking System</p>
          </div>

          {loginError && (
            <div className="mb-5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3">
              <p className="text-center text-sm text-rose-300">{loginError}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">Email Address</label>
              <div
                className={`relative transition-all duration-200 ${
                  activeField === "email" ? "scale-[1.01]" : ""
                }`}
              >
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <EmailIcon />
                </span>
                <input
                  className={`w-full rounded-lg border bg-gray-800 py-2.5 pl-12 pr-4 text-sm text-white placeholder-gray-400 outline-none transition ${
                    errors.email && touched.email
                      ? "border-rose-500/60 focus:border-rose-500"
                      : "border-gray-700 focus:border-indigo-500"
                  }`}
                  name="email"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  onFocus={() => setActiveField("email")}
                  placeholder="Enter your email"
                  type="email"
                  value={formData.email}
                />
              </div>
              {errors.email && touched.email && (
                <p className="text-sm text-rose-400">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">Password</label>
              <div
                className={`relative transition-all duration-200 ${
                  activeField === "password" ? "scale-[1.01]" : ""
                }`}
              >
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <LockIcon />
                </span>
                <input
                  className={`w-full rounded-lg border bg-gray-800 py-2.5 pl-12 pr-12 text-sm text-white placeholder-gray-400 outline-none transition ${
                    errors.password && touched.password
                      ? "border-rose-500/60 focus:border-rose-500"
                      : "border-gray-700 focus:border-indigo-500"
                  }`}
                  name="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  onFocus={() => setActiveField("password")}
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-200"
                  onClick={() => setShowPassword((prev) => !prev)}
                  type="button"
                >
                  <EyeIcon show={showPassword} />
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="text-sm text-rose-400">{errors.password}</p>
              )}
            </div>

            <div className="text-right">
              <span className="text-sm font-medium text-indigo-400">Forgot Password?</span>
            </div>

            <button
              className="w-full rounded-lg bg-indigo-600 py-3 text-base font-semibold text-white transition hover:bg-indigo-700"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                  Signing in...
                </span>
              ) : (
                "Login"
              )}
            </button>

            <p className="text-center text-xs text-gray-400 sm:text-sm">
              Don&apos;t have an account?{" "}
              <Link className="font-semibold text-indigo-400 hover:underline" to="/register">
                Register here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
