import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ children }) {
  const isVerified = useSelector((state) => state.auth.isVerified); // خزن حالة التحقق بالريدكس
  const token = useSelector((state) => state.auth.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isVerified) {
    return <Navigate to="/verify-profile" replace />;
  }

  return children;
}

export default ProtectedRoute;
