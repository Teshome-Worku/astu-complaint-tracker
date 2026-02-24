import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const raw = localStorage.getItem("user");
  if (!raw) return <Navigate to="/login" replace />;

  let user = null;
  try {
    user = JSON.parse(raw);
  } catch (e) {
    // stored value malformed - force logout
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  const userRole = user && user.role ? user.role : null;

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;