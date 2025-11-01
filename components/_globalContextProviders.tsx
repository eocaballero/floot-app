import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { TooltipProvider } from "./Tooltip";
import { SonnerToaster } from "./SonnerToaster";
import { ScrollToHashElement } from "./ScrollToHashElement";
import { AuthProvider, useAuth } from "../helpers/useAuth";
import { GOOGLE_CLIENT_ID } from "../helpers/googleAuthConfig";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute “fresh” window
    },
  },
});

/**
 * Inner component that handles session expiration navigation.
 * This must be inside the Router context to access useNavigate.
 */
const SessionExpirationHandler = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { clearUser } = useAuth();

  useEffect(() => {
    const handleSessionExpired = () => {
      console.log("Session expired event received. Clearing auth state and navigating to login.");
      // Clear the user state in React context immediately
      // (localStorage was already cleared by fetchWithAuth)
      clearUser();
      navigate("/login");
    };

    // Listen for the custom session-expired event dispatched by fetchWithAuth
    window.addEventListener("session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("session-expired", handleSessionExpired);
    };
  }, [navigate, clearUser]);

  return <>{children}</>;
};

export const GlobalContextProviders = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SessionExpirationHandler>
            <ScrollToHashElement />
            <TooltipProvider>
              {children}
              <SonnerToaster />
            </TooltipProvider>
          </SessionExpirationHandler>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

