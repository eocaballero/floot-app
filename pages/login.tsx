import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../helpers/useAuth";
import { Button } from "../components/Button";
import { Helmet } from "react-helmet";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { toast } from "sonner";
import { Spinner } from "../components/Spinner";
import styles from "./login.module.css";

/**
 * Decodes a JWT token and extracts the payload.
 * @param token - The JWT token string
 * @returns The decoded payload object or null if decoding fails
 */
const decodeJWT = (token: string): Record<string, unknown> | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      console.error('Invalid JWT format');
      return null;
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    console.log("Google login successful, sending token to backend...");

    if (!credentialResponse.credential) {
      toast.error("No se recibió el token de Google. Por favor, intente de nuevo.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://patronales-minimalapi-b6hygpfegxb4a8ba.brazilsouth-01.azurewebsites.net/login-google",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ idToken: credentialResponse.credential }),
        },
      );

      if (response.ok) {
        // Decode the Google JWT token to extract user information
        const payload = decodeJWT(credentialResponse.credential);
        
        if (payload && typeof payload.email === 'string' && typeof payload.name === 'string') {
          // Store user information in auth context
          setUser({
            name: payload.name,
            email: payload.email,
            picture: typeof payload.picture === 'string' ? payload.picture : undefined,
          });
          console.log('User information stored successfully');
        } else {
          console.error('Failed to extract user information from JWT token');
        }
        
        toast.success("¡Inicio de sesión exitoso! Redirigiendo...");
        
        // Check for pending redirect after login
        const redirectPath = sessionStorage.getItem("redirectAfterLogin");
        if (redirectPath) {
          sessionStorage.removeItem("redirectAfterLogin");
          navigate(redirectPath);
        } else {
          navigate("/");
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido del servidor." }));
        console.error("Backend login failed:", errorData);
        toast.error(`Error al iniciar sesión: ${errorData.message || "Por favor, intente de nuevo."}`);
      }
    } catch (error) {
      console.error("An error occurred during the login process:", error);
      let errorMessage = "Ocurrió un error de red. Por favor, verifique su conexión e intente de nuevo.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error("Google login failed");
    toast.error("El inicio de sesión con Google falló. Por favor, intente de nuevo.");
    setIsLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Iniciar Sesión | Fiesta Nacional de la Familia Piemontesa</title>
        <meta name="description" content="Inicie sesión para acceder a la aplicación de ventas de comida." />
      </Helmet>
      <main className={styles.container}>
        <div className={styles.loginCard}>
          {isLoading && (
            <div className={styles.loadingOverlay}>
              <Spinner size="lg" />
            </div>
          )}
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              <img 
                src="https://assets.floot.app/b8a35fa9-4ace-4571-b758-450ba6aec3cb/622a55d5-0974-4c94-8075-10d3f15d9847.png" 
                alt="Logo de la Fiesta Piemontesa" 
                className={styles.logo}
              />
            </div>
            
          </div>
          <h2 className={styles.title}>Bienvenido</h2>
          <p className={styles.subtitle}>
            Inicie sesión para continuar a la aplicación de ventas.
          </p>
          <div className={styles.googleButtonWrapper}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              shape="pill"
              theme="filled_blue"
              size="large"
              width="300px"
            />
          </div>
          <div className={styles.alternativeAction}>
            <Button variant="outline" size="lg" asChild>
              <Link to="/">Volver al inicio</Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}