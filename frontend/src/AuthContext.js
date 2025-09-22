import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [nickname, setNickname] = useState("");
  // eslint-disable-next-line
  const [loaded, setLoaded] = useState(false);
  const [initLoaded, setInitLoaded] = useState(false);

  const login = async () => {
    setLoaded(false);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL}/api/dashboard/me`,
        {
          withCredentials: true,
        }
      );
      const { nickname } = response.data;

      setNickname(nickname);
      setIsAuthenticated(true);
      setInitLoaded(true);
      setLoaded(true);
    } catch (error) {
      console.error("Error while logging in:", error);
      setInitLoaded(true);
      setLoaded(true); // Set loaded to true even on error
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setNickname("");
    <Navigate to="/login" />;
  };

  useEffect(() => {
    login();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, nickname, login, logout }}>
      {initLoaded && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
