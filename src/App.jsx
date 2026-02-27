import { Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const routes = [
  { path: "/", element: <Landing /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { 
    path: "/admin-dashboard", 
    element: (
      <ProtectedRoute allowedRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    )
  },
  
  { 
    path: "/staff-dashboard", 
    element: (
      <ProtectedRoute allowedRole="staff">
        <StaffDashboard />
      </ProtectedRoute>
    )
  },
  
  { 
    path: "/student-dashboard", 
    element: (
      <ProtectedRoute allowedRole="student">
        <StudentDashboard />
      </ProtectedRoute>
    )
  },
];

function App() {
  return (
    <Routes>
      {routes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}

export default App;
