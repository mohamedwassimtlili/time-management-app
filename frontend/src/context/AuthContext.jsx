import { createContext, useState, useEffect, useContext } from "react";
import { api } from "../services/api";

export const AuthContext = createContext();

// Custom hook to use AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 🟢 new loading state

 useEffect(() => {
  if (token && !user) {
    const fetchUser = async () => {
      try {
        // Using your api instance (axios)
        const res = await api.get("/users/me"); // assuming api is axios
        setUser(res.data); // axios puts JSON in res.data
      } catch (error) {
        setUser(null);
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("token");
          setToken(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser(); // call the async function
  } else {
    setLoading(false);
  }
}, [token]);

  const updateToken = (jwtToken) => {
    localStorage.setItem("token", jwtToken);
    setToken(jwtToken);
  };

  const login = (userData, jwtToken) => {
    setUser(userData);
    updateToken(jwtToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, updateToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
