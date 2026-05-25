import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

type Props = {
  roles?: string[]; // allowed roles
  children: ReactNode;
};

export default function ProtectedRoute({ roles = [], children }: Props) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length === 0) return children;

  const userRoles = user.roleNames || [];
  const allowed = roles.some((r) => userRoles.includes(r));
  if (!allowed) return <Navigate to="/" replace />;

  return children;
}
