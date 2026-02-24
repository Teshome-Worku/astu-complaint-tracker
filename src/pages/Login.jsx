import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.get(
        `http://localhost:5000/users?email=${formData.email}`
      );

    //   if (res.data.length === 0) {
    //     setError("Invalid email or password");
    //     return;
    //   }


      const user = res.data[0];
      if(!user || user.password !== formData.password) {
        setError("Invalid email or password");
        return;
      }

      // Save logged user temporarily
      localStorage.setItem("user", JSON.stringify(user));

      // Role-based redirect
      if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (user.role === "staff") {
        navigate("/staff-dashboard");
      } else {
        navigate("/student-dashboard");
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-6">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8">

        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Login to Your Account
        </h2>

        {error && (
          <p className="mb-4 text-red-500 text-sm text-center">{error}</p>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-400 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold text-white transition duration-300"
          >
            Login
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-400 hover:underline">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;