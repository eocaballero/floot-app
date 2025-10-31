import React from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../helpers/useAuth";
import { Button } from "../components/Button";
import { FoodCard } from "../components/FoodCard";
import { Separator } from "../components/Separator";
import { Clock, MapPin, ShoppingCart, Wallet, QrCode, Store } from "lucide-react";
import styles from "./_index.module.css";

const logoUrl =
  "https://assets.floot.app/b8a35fa9-4ace-4571-b758-450ba6aec3cb/622a55d5-0974-4c94-8075-10d3f15d9847.png";

const featuredFoods = [
  {
    name: "Pasta Casera",
    description: "Auténtica pasta Piemontesa, amasada a mano con recetas de la nonna.",
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
  },
  {
    name: "Empanadas Criollas",
    description: "El sabor tradicional argentino con un toque especial de la fiesta.",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
  },
  {
    name: "Dulces Típicos",
    description: "Postres y dulces que te transportarán a los sabores de nuestra infancia.",
    imageUrl: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327",
  },
  {
    name: "Vinos de la Región",
    description: "Una selección de los mejores vinos para acompañar tu comida.",
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleExploreClick = () => {
    if (isAuthenticated) {
      navigate("/tienda");
    } else {
      sessionStorage.setItem("redirectAfterLogin", "/tienda");
      navigate("/login");
    }
  };

  const handleCartClick = () => {
    if (isAuthenticated) {
      navigate("/carrito");
    } else {
      sessionStorage.setItem("redirectAfterLogin", "/carrito");
      navigate("/login");
    }
  };

  const handleWalletClick = () => {
    if (isAuthenticated) {
      navigate("/billetera");
    } else {
      sessionStorage.setItem("redirectAfterLogin", "/billetera");
      navigate("/login");
    }
  };

  const handleOrdersClick = () => {
    if (isAuthenticated) {
      navigate("/compras");
    } else {
      sessionStorage.setItem("redirectAfterLogin", "/compras");
      navigate("/login");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Helmet>
        <title>
          Sabores de la Fiesta | Fiesta Nacional de la Familia Piemontesa
        </title>
        <meta
          name="description"
          content="Descubre y ordena la mejor comida típica en la Fiesta Nacional de la Familia Piemontesa. Pastas, empanadas, y más."
        />
      </Helmet>

      {/* Hero Section */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            El Sabor de la Fiesta en tu Mesa
          </h1>
          <p className={styles.heroSubtitle}>
            Disfruta de la auténtica cocina Piemontesa y criolla sin hacer
            filas. Haz tu pedido online y retíralo en nuestro stand.
          </p>
          <div className={styles.heroActions}>
            <Button asChild size="lg">
              <Link to="#menu">Gastronomía</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="#como-funciona">Cómo Funciona</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        

        {/* Featured Foods Section */}
        <section id="menu" className={styles.featuredSection}>
          <h2 className={styles.sectionTitle}>Nuestros Platos Estrella</h2>
          <div className={styles.foodGrid}>
            {featuredFoods.map((food) => (
              <FoodCard
                key={food.name}
                name={food.name}
                description={food.description}
                imageUrl={food.imageUrl}
              />
            ))}
          </div>
        </section>

        <Separator />

        {/* How It Works Section */}
        <section id="como-funciona" className={styles.howItWorksSection}>
          <h2 className={styles.sectionTitle}>¿Cómo funciona?</h2>
          <div className={styles.stepsGrid}>
            <div 
              className={`${styles.stepCard} ${styles.stepCardClickable}`}
              onClick={handleExploreClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleExploreClick();
                }
              }}
            >
              <div className={`${styles.stepIconWrapper} ${styles.stepIconGreen}`}>
                <Store className={styles.stepIcon} />
              </div>
              <h3 className={styles.stepTitle}>Explora los Puestos →</h3>
              <p className={styles.stepDescription}>
                Navega por todos los puestos de comida y descubre los deliciosos platos que ofrecen.
              </p>
            </div>
            <div 
              className={`${styles.stepCard} ${styles.stepCardClickable}`}
              onClick={handleCartClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCartClick();
                }
              }}
            >
              <div className={`${styles.stepIconWrapper} ${styles.stepIconBlue}`}>
                <ShoppingCart className={styles.stepIcon} />
              </div>
              <h3 className={styles.stepTitle}>Arma tu Pedido →</h3>
              <p className={styles.stepDescription}>
                Agrega tus platos favoritos al carrito de compras de forma rápida y sencilla.
              </p>
            </div>
            <div 
              className={`${styles.stepCard} ${styles.stepCardClickable}`}
              onClick={handleWalletClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleWalletClick();
                }
              }}
            >
              <div className={`${styles.stepIconWrapper} ${styles.stepIconGold}`}>
                <Wallet className={styles.stepIcon} />
              </div>
              <h3 className={styles.stepTitle}>Paga →</h3>
              <p className={styles.stepDescription}>
                Utiliza tu monedero digital para pagar de forma rápida y segura.
              </p>
            </div>
            <div 
              className={`${styles.stepCard} ${styles.stepCardClickable}`}
              onClick={handleOrdersClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOrdersClick();
                }
              }}
            >
              <div className={`${styles.stepIconWrapper} ${styles.stepIconRed}`}>
                <QrCode className={styles.stepIcon} />
              </div>
              <h3 className={styles.stepTitle}>Retira con tu QR →</h3>
              <p className={styles.stepDescription}>
                Muestra tu código QR único en el puesto para retirar tu pedido sin demoras.
              </p>
            </div>
          </div>
        </section>

        <Separator />

        {/* Info Section */}
        <section id="info" className={styles.infoSection}>
          <h2 className={styles.sectionTitle}>Información del Evento</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <Clock className={styles.infoCardIcon} />
              <h3 className={styles.infoCardTitle}>Horarios de Atención</h3>
              <p>
                Viernes: 18:00 a 00:00
                <br />
                Sábado y Domingo: 12:00 a 01:00
              </p>
            </div>
            <div className={styles.infoCard}>
              <MapPin className={styles.infoCardIcon} />
              <h3 className={styles.infoCardTitle}>Nuestra Ubicación</h3>
              <p>
                Encuéntranos en el stand principal de comidas, junto al escenario
                mayor del predio del festival.
              </p>
            </div>
          </div>
        </section>

        
      </main>
    </div>
  );
}