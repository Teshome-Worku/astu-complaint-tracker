import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const user = JSON.parse(localStorage.getItem("user"));

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;