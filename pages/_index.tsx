import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ShoppingCart, Wallet, QrCode, ArrowRight, LogIn } from 'lucide-react';
import { useAuth } from '../helpers/useMockAuth';
import styles from './_index.module.css';

const IndexPage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Patio de Comida | Bienvenidos</title>
        <meta name="description" content="Bienvenidos a la aplicación oficial del festival de comida de la Fiesta Nacional de la Familia Piemontesa. Explora, compra y disfruta." />
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
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              {isAuthenticated ? (
                <>
                  <h1 className={styles.heroTitle}>
                    ¡Bienvenido, {user?.name}!
                  </h1>
                  <p className={styles.heroSubtitle}>
                    Tu cuenta está lista. Explora nuestros deliciosos platos y comienza a armar tu pedido.
                  </p>
                  <Link to="/store" className={styles.heroCta}>
                    Ir a la Tienda <ArrowRight size={20} />
                  </Link>
                </>
              ) : (
                <>
                  <h1 className={styles.heroTitle}>
                    Fiesta Nacional de la Familia Piemontesa
                  </h1>
                  <p className={styles.heroSubtitle}>
                    La experiencia culinaria del festival, ahora en tu mano.
                    Explora nuestros deliciosos platos y descubre todo lo que tenemos para ofrecerte.
                  </p>
                  <div className={styles.heroActions}>
                    <Link to="/login" className={styles.heroCta}>
                      <LogIn size={20} /> Iniciar Sesión
                    </Link>
                    <Link to="/store" className={styles.heroCtaSecondary}>
                      Explorar Menú <ArrowRight size={20} />
                    </Link>
                  </div>
                </>
              )}
            </div>
            <div className={styles.heroImageContainer}>
              <img 
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836" 
                alt="Plato de comida gourmet del festival" 
                className={styles.heroImage}
              />
            </div>
          </section>

          <section className={styles.features}>
            <h2 className={styles.sectionTitle}>¿Cómo funciona?</h2>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIconWrapper} style={{'--feature-color': 'var(--primary)'} as React.CSSProperties}>
                  <ShoppingCart size={28} />
                </div>
                <h3 className={styles.featureTitle}>Explora los Puestos</h3>
                <p className={styles.featureDescription}>
                  Navega por todos los puestos de comida y descubre los deliciosos platos que ofrecen.
                </p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIconWrapper} style={{'--feature-color': 'var(--secondary)'} as React.CSSProperties}>
                  <ShoppingCart size={28} />
                </div>
                <h3 className={styles.featureTitle}>Arma tu Pedido</h3>
                <p className={styles.featureDescription}>
                  Agrega tus platos favoritos al carrito de compras de forma rápida y sencilla.
                </p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIconWrapper} style={{'--feature-color': 'var(--warning)'} as React.CSSProperties}>
                  <Wallet size={28} />
                </div>
                <h3 className={styles.featureTitle}>Paga</h3>
                <p className={styles.featureDescription}>
                  Utiliza tu monedero digital para pagar de forma rápida y segura.
                </p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIconWrapper} style={{'--feature-color': 'var(--error)'} as React.CSSProperties}>
                  <QrCode size={28} />
                </div>
                <h3 className={styles.featureTitle}>Retira con tu QR</h3>
                <p className={styles.featureDescription}>
                  Muestra tu código QR único en el puesto para retirar tu pedido sin demoras.
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <p>&copy; {new Date().getFullYear()} Municipalidad de Luque. Todos los derechos reservados.</p>
        </footer>
      </div>
    </>
  );
};

export default IndexPage;