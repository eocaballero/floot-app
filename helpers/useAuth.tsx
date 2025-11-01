import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "./fetchWithAuth";

/**
 * The structure of the user object, typically from an OAuth provider.
 */
export interface AuthUser {
  name: string;
  email: string;
  picture?: string;
}

const USER_STORAGE_KEY = "auth_user";

/**
 * The shape of the authentication context value.
 */
interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  setUser: (userData: AuthUser) => void;
  logout: () => Promise<void>;
  clearUser: () => void;
  getInitials: () => string;
}

/**
 * The authentication context.
 */
const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * AuthProvider component that manages authentication state and provides it to the entire app.
 * This should be placed high in the component tree to share authentication state across all components.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const navigate = useNavigate();

  // On initial mount, check localStorage for a persisted user session.
  useEffect(() => {
    try {
      const storedUserJson = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUserJson) {
        const storedUser: AuthUser = JSON.parse(storedUserJson);
        setUserState(storedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      // Clear potentially corrupted data
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  /**
   * Sets the user data in both state and localStorage.
   * This should be called after a successful login.
   * @param userData The user object to be stored.
   */
  const setUser = useCallback((userData: AuthUser) => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setUserState(userData);
    } catch (error) {
      console.error("Failed to save user to localStorage:", error);
    }
  }, []);

  /**
   * Clears the user data from both state and localStorage.
   * This is used when we know the session is already invalid (e.g., after a 401 response)
   * and don't need to make a backend call or navigate.
   */
  const clearUser = useCallback(() => {
    setUserState(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    console.log("User data cleared from state and localStorage.");
  }, []);

  /**
   * Handles the user logout process.
   * It calls the backend logout endpoint, clears local session data,
   * and redirects the user to the login page.
   */
  const logout = useCallback(async () => {
    console.log("Initiating logout...");
    try {
      await fetchWithAuth(
        "https://patronales-minimalapi-b6hygpfegxb4a8ba.brazilsouth-01.azurewebsites.net/logout",
        {
          method: "POST",
        },
      );
      console.log("Logout request sent successfully.");
    } catch (error) {
      // Log the error but proceed with client-side cleanup
      console.error("Logout API call failed:", error);
    } finally {
      // Ensure client-side state is always cleared
      setUserState(null);
      localStorage.removeItem(USER_STORAGE_KEY);
      console.log("Local user data cleared.");
      navigate("/");
    }
  }, [navigate]);

  /**
   * A helper function to derive user initials from their full name.
   * @returns A string with the user's initials (e.g., "JD" for "John Doe"),
   * or an empty string if the user or name is not available.
   */
  const getInitials = useCallback((): string => {
    if (!user?.name) {
      return "";
    }

    const names = user.name.trim().split(/\s+/);
    if (names.length === 0 || names[0] === "") {
      return "";
    }

    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    const firstInitial = names[0].charAt(0);
    const lastInitial = names[names.length - 1].charAt(0);

    return `${firstInitial}${lastInitial}`.toUpperCase();
  }, [user]);

  // Derived boolean indicating if the user is authenticated.
  const isAuthenticated = !!user;

  const value: AuthContextValue = {
    isAuthenticated,
    user,
    setUser,
    logout,
    clearUser,
    getInitials,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * A custom hook for accessing authentication state and methods.
 * This hook must be used within a component that is wrapped by AuthProvider.
 * 
 * @throws {Error} If used outside of AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};