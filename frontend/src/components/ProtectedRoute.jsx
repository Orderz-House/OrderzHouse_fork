import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ children }) {
  const token = useSelector((state) => state.auth.token);
  const { userData } = useSelector((state) => state.auth);


  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!userData.is_verified) {
    return <Navigate to="/verify-profile" replace />;
    
  }

  return children;
}

export default ProtectedRoute;
