import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { RefreshCw } from "lucide-react";
import { useAuth } from "../helpers/useAuth";
import { fetchWithAuth } from "../helpers/fetchWithAuth";
import styles from "./qr.module.css";

const CODE_EXPIRATION_SECONDS = 60;

/**
 * Fetches a new QR code from the backend.
 * @returns {Promise<string>} A 6-digit code from the backend.
 * @throws {Error} If the backend request fails or returns invalid data.
 */
const generateCode = async (): Promise<string> => {
  try {
    const response = await fetchWithAuth(
      "https://patronales-minimalapi-b6hygpfegxb4a8ba.brazilsouth-01.azurewebsites.net/myitems/qr",
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`Backend returned status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.QR || typeof data.QR !== "string") {
      throw new Error("Invalid QR code format from backend");
    }

    console.log("QR code received from backend:", data.QR);
    return data.QR;
  } catch (error) {
    console.error("Failed to fetch QR code from backend:", error);
    throw error;
  }
};

export default function QrPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [code, setCode] = useState<string>("");
  const [secondsLeft, setSecondsLeft] = useState(CODE_EXPIRATION_SECONDS);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Generate the initial code when the component mounts
    const initializeCode = async () => {
      setIsLoading(true);
      setError("");
      try {
        const initialCode = await generateCode();
        setCode(initialCode);
        setError("");
      } catch (err) {
        console.error("Failed to initialize QR code:", err);
        setError("No se pudo cargar el código. Intenta recargar la página.");
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeCode();

    const timer = setInterval(async () => {
      setSecondsLeft((prevSeconds) => {
        if (prevSeconds <= 1) {
          // When timer reaches zero, generate a new code and reset the timer
          generateCode()
            .then((newCode) => {
              setCode(newCode);
              setError("");
            })
            .catch((err) => {
              console.error("Failed to refresh QR code:", err);
              setError("No se pudo renovar el código.");
            });
          return CODE_EXPIRATION_SECONDS;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(timer);
  }, []);

  if (!isAuthenticated) {
    return null; // Render nothing while redirecting
  }

  return (
    <div className={styles.pageContainer}>
      <Helmet>
        <title>Código QR para Retiro | Fiesta Nacional de la Familia Piemontesa</title>
        <meta
          name="description"
          content="Muestra este código QR en el puesto para retirar tus productos."
        />
      </Helmet>

      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>Código para Retiro</h1>
          <p className={styles.subtitle}>
            Muestra este código en el puesto para retirar tus productos.
          </p>
        </header>

        <div className={styles.qrContainer}>
          {isLoading ? (
            <div className={styles.qrPlaceholder} />
          ) : error ? (
            <div className={styles.errorState}>
              <p className={styles.errorMessage}>{error}</p>
            </div>
          ) : code ? (
            <QRCodeSVG
              value={code}
              size={256}
              bgColor={"var(--surface)"}
              fgColor={"var(--foreground)"}
              level={"Q"}
              includeMargin={false}
            />
          ) : (
            <div className={styles.qrPlaceholder} />
          )}
        </div>

        <div className={styles.codeDisplay}>
          {isLoading ? "------" : error ? "------" : code}
        </div>

        <footer className={styles.footer}>
          <RefreshCw size={16} className={styles.timerIcon} />
          <span>
            Se renovará en <strong>{secondsLeft}</strong> segundos
          </span>
        </footer>
      </div>
    </div>
  );
}