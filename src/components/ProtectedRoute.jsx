import { Navigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";

function ProtectedRoute({ children, allowedRole }) {
  const raw = localStorage.getItem("user");
  if (!raw) return <Navigate to={ROUTES.LOGIN} replace />;

  let user = null;
  try {
    user = JSON.parse(raw);
  } catch {
    // stored value malformed - force logout
    localStorage.removeItem("user");
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const userRole = user && user.role ? String(user.role).trim().toLowerCase() : null;
  const expectedRole = allowedRole ? String(allowedRole).trim().toLowerCase() : null;

  if (expectedRole && userRole !== expectedRole) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children;
}

export default ProtectedRoute;
