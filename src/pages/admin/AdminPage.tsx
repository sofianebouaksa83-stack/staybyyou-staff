import { Navigate } from "react-router-dom";
import { useApp } from "../../app/AppContext";
import { can } from "../../features/permissions/permissions";

export default function AdminPage() {
  const { user } = useApp();

  if (!can(user.role, "admin.read")) {
    return <Navigate to="/profile" replace />;
  }

  return <Navigate to="/admin/hotel" replace />;
}
