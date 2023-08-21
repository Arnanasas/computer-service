import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const ProtectedRoute = ({ children }) => {

    const isAuthenticated = useAuth();
    const navigate = useNavigate();

    if (!isAuthenticated) {
        navigate("/login");
      return <Navigate to="/login" replace />;
    }
  
    return children;
  };
  
  export default ProtectedRoute;