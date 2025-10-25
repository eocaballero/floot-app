import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import QRCode from 'react-qr-code';
import { RefreshCw } from 'lucide-react';
import { useQrCodeQuery } from '../helpers/useQrCodeQuery';
import { useGenerateQrMutation } from '../helpers/useGenerateQrMutation';
import { Skeleton } from '../components/Skeleton';
import { Button } from '../components/Button';
import styles from './my-qr.module.css';

const QrCodeSkeleton = () => (
  <div className={styles.qrCard}>
    <Skeleton className={styles.qrCodeSkeleton} />
    <Skeleton className={styles.textSkeleton} style={{ width: '80%', height: '1.5rem' }} />
    <Skeleton className={styles.textSkeleton} style={{ width: '60%', height: '1rem' }} />
  </div>
);

const CountdownTimer = ({ expiresAt, onExpire }: { expiresAt: Date | string | number, onExpire: () => void }) => {
  // Defensive programming: ensure expiresAt is always a Date object
  const expiresAtDate = new Date(expiresAt);
  const [timeLeft, setTimeLeft] = useState(Math.round((expiresAtDate.getTime() - Date.now()) / 1000));

  useEffect(() => {
    const calculateTimeLeft = () => {
      return Math.max(0, Math.round((expiresAtDate.getTime() - Date.now()) / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (newTimeLeft <= 0) {
        clearInterval(timer);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAtDate, onExpire]);

  const isExpiringSoon = timeLeft <= 10;

  return (
    <p className={`${styles.timer} ${isExpiringSoon ? styles.expiringSoon : ''}`}>
      {timeLeft > 0 ? `Expira en: ${timeLeft} segundos` : 'Expirado'}
    </p>
  );
};

export default function MyQrPage() {
  const { data: qrData, isLoading, isError, error } = useQrCodeQuery();
  const { mutate: generateQr, isPending: isGenerating } = useGenerateQrMutation();

  const handleExpire = () => {
    console.log('QR Code expired, generating a new one.');
    generateQr();
  };

  return (
    <>
      <Helmet>
        <title>Mi QR - FNFP Comida</title>
        <meta name="description" content="Muestre su código QR para retirar sus productos en el festival." />
      </Helmet>
      <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>Mi Código QR</h1>
          <p className={styles.instructions}>
            Mostrá este código en el puesto para retirar tu pedido.
          </p>

          {isLoading && <QrCodeSkeleton />}

          {isError && (
            <div className={`${styles.qrCard} ${styles.errorState}`}>
              <p>Error al cargar el código QR.</p>
              <p className={styles.errorMessage}>{error.message}</p>
            </div>
          )}

          {qrData && (
            <div className={styles.qrCard}>
              <div className={styles.qrCodeWrapper}>
                <QRCode
                  value={qrData.code}
                  size={256}
                  bgColor="var(--surface)"
                  fgColor="var(--surface-foreground)"
                  level="H"
                  style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                />
              </div>
              <CountdownTimer expiresAt={qrData.expiresAt} onExpire={handleExpire} />
              <p className={styles.subtleText}>
                Este código se renueva automáticamente cada 60 segundos por seguridad.
              </p>
            </div>
          )}

          <Button
            onClick={() => generateQr()}
            disabled={isGenerating || isLoading}
            className={styles.generateButton}
            size="lg"
          >
            <RefreshCw size={20} className={isGenerating ? styles.spinningIcon : ''} />
            {isGenerating ? 'Generando...' : 'Generar Nuevo QR'}
          </Button>
        </div>
      </div>
    </>
  );
}