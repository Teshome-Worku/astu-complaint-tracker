import React from 'react'

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-semibold mb-6">Create account</h1>
        <form>
          <label className="block mb-3">
            <span className="block text-sm font-medium text-gray-700">Name</span>
            <input
              type="text"
              name="name"
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
            />
          </label>

          <label className="block mb-3">
            <span className="block text-sm font-medium text-gray-700">Email</span>
            <input
              type="email"
              name="email"
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
            />
          </label>

          <label className="block mb-4">
            <span className="block text-sm font-medium text-gray-700">Password</span>
            <input
              type="password"
              name="password"
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
            />
          </label>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Create account
          </button>
        </form>
      </div>
    </div>
  )
}
