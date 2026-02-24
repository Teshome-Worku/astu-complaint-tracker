import { Link } from "react-router-dom";

function Register() {
  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 bg-linear-to-br from-indigo-700 via-purple-700 to-gray-900 text-white flex-col justify-center items-center p-12">
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
      <div className="flex w-full md:w-1/2 bg-gray-950 items-center justify-center p-8">
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8">

          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Create Account
          </h2>

          <form className="space-y-5">

            <div>
              <label className="block text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold text-white transition duration-300"
            >
              Register
            </button>

          </form>

          <p className="text-gray-400 text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 hover:underline">
              Login
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}

export default Register;