import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../helpers/useMockAuth';
import { MockOAuthButton } from '../components/MockOAuthButton';
import styles from './login.module.css';

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/store', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Render nothing while redirecting
  if (isAuthenticated) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Iniciar Sesión | Patio de Comida</title>
        <meta
          name="description"
          content="Inicia sesión para acceder al Patio de Comida de la Fiesta Nacional de la Familia Piemontesa."
        />
      </Helmet>
      <div className={styles.pageContainer}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <img
              src="https://assets.floot.app/b8a35fa9-4ace-4571-b758-450ba6aec3cb/1ac7a814-a3cf-4c06-88fe-57f1f9a6dc45.jpg"
              alt="Patio de Comida Logo"
              className={styles.logoImage}
            />
            <span>Patio de Comida</span>
          </div>
        </header>

        <main className={styles.mainContent}>
          <div className={styles.loginCard}>
            <h1 className={styles.title}>Iniciar Sesión</h1>
            <p className={styles.subtitle}>
              Bienvenido al sistema de pedidos del festival.
            </p>
            <div className={styles.buttonContainer}>
              <MockOAuthButton provider="google" />
              <MockOAuthButton provider="facebook" />
            </div>
            <Link to="/" className={styles.backLink}>
              Volver al inicio
            </Link>
          </div>
        </main>
      </div>
    </>
  );
};

export default LoginPage;