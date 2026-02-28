import { Navigate, Route, Routes } from "react-router-dom";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminDashboard from "../pages/AdminDashboard";
import StudentDashboard from "../pages/StudentDashboard";
import StaffDashboard from "../pages/StaffDashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import { ROLES } from "../constants/roles";
import { ROUTES } from "../constants/routes";

const routes = [
  { path: ROUTES.HOME, element: <Landing /> },
  { path: ROUTES.LOGIN, element: <Login /> },
  { path: ROUTES.REGISTER, element: <Register /> },

  {
    path: ROUTES.ADMIN_DASHBOARD,
    element: (
      <ProtectedRoute allowedRole={ROLES.ADMIN}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },

  {
    path: ROUTES.STAFF_DASHBOARD,
    element: (
      <ProtectedRoute allowedRole={ROLES.STAFF}>
        <StaffDashboard />
      </ProtectedRoute>
    ),
  },

  {
    path: ROUTES.STUDENT_DASHBOARD  ,
    element: (
      <ProtectedRoute allowedRole={ROLES.STUDENT}>
        <StudentDashboard />
      </ProtectedRoute>
    ),
  },
];

export default function AppRoutes() {
  return (
    <Routes>
      {routes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}