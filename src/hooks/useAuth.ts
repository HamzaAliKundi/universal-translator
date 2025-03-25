import { useEffect, useState } from "react";
import { getUser } from "../utils/api";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const initAuth = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        const userData = await getUser(token);
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("authToken");
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
    } finally {
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    initAuth();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "authToken") {
        if (event.newValue) {
          initAuth();
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setIsAuthLoading(false);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("authToken");
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("lastEmail");
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return { isAuthenticated, isAuthLoading, user, handleSignOut, initAuth };
}