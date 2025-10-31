import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import { Utensils, AlertCircle, Plus, Minus, Search, Store } from "lucide-react";
import { useProducts } from "../helpers/useProducts";
import { useCart } from "../helpers/useCart";
import { useAuth } from "../helpers/useAuth";
import { Skeleton } from "../components/Skeleton";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/Dialog";
import styles from "./tienda.module.css";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const ProductCardSkeleton = () => (
  <div className={styles.productCard}>
    <div className={styles.cardIcon}>
      <Skeleton style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
    </div>
    <div className={styles.cardContent}>
      <Skeleton style={{ height: "1.5rem", width: "80%", marginBottom: "var(--spacing-2)" }} />
      <Skeleton style={{ height: "1.25rem", width: "40%", marginBottom: "var(--spacing-4)" }} />
      <Skeleton style={{ height: "1rem", width: "60%" }} />
    </div>
  </div>
);

export default function TiendaPage() {
  const { data: products, isLoading, isError, error } = useProducts();
  const { isAuthenticated } = useAuth();
  const {
    getProductQuantity,
    incrementQuantity,
    decrementQuantity,
    isUpdatingCart,
  } = useCart();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStand, setSelectedStand] = useState<string>("todos");
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  // Extract unique stand names from products
  const uniqueStands = useMemo(() => {
    if (!products) return [];
    const standsSet = new Set(products.map(p => p.standName));
    return Array.from(standsSet).sort();
  }, [products]);

  // Filter products based on search term and selected stands
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply stand filter
    if (selectedStand !== "todos") {
      filtered = filtered.filter(product =>
        product.standName === selectedStand
      );
    }

    return filtered;
    }, [products, searchTerm, selectedStand]);

  const handleStandSelect = (standName: string) => {
    setSelectedStand(standName);
    setIsFilterDialogOpen(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={styles.productsGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (isError) {
      console.error("Error fetching products:", error);
      return (
        <div className={styles.stateMessage}>
          <AlertCircle className={styles.errorIcon} size={48} />
          <h2>Ocurrió un error</h2>
          <p>No pudimos cargar los productos. Por favor, intenta de nuevo más tarde.</p>
        </div>
      );
    }

    if (!products || products.length === 0) {
      return (
        <div className={styles.stateMessage}>
          <h2>No hay productos disponibles</h2>
          <p>Vuelve a consultar más tarde para ver las delicias que tenemos para ofrecer.</p>
        </div>
      );
    }

    if (filteredProducts.length === 0) {
      return (
        <div className={styles.stateMessage}>
          <h2>No se encontraron productos</h2>
          <p>Intenta ajustar los filtros o el término de búsqueda.</p>
        </div>
      );
    }

    return (
      <div className={styles.productsGrid}>
        {filteredProducts.map((product) => {
          const quantity = isAuthenticated ? getProductQuantity(product.id) : 0;

          return (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.cardIcon}>
                <Utensils size={32} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productPrice}>{formatCurrency(product.price)}</p>
                <p className={styles.standName}>{product.standName}</p>

                {isAuthenticated && (
                  <div className={styles.cartControls}>
                    {quantity === 0 ? (
                      <Button
                        onClick={() => incrementQuantity(product.id)}
                        disabled={isUpdatingCart}
                        className={styles.addToCartButton}
                        size="sm"
                      >
                        <Plus size={16} />
                        Agregar al carrito
                      </Button>
                    ) : (
                      <div className={styles.quantityControls}>
                        <Button
                          onClick={() => decrementQuantity(product.id)}
                          disabled={isUpdatingCart || quantity === 0}
                          variant="outline"
                          size="icon-sm"
                        >
                          <Minus size={16} />
                        </Button>
                        <span className={styles.quantityDisplay}>{quantity}</span>
                        <Button
                          onClick={() => incrementQuantity(product.id)}
                          disabled={isUpdatingCart}
                          variant="outline"
                          size="icon-sm"
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <Helmet>
        <title>Tienda | Fiesta Nacional de la Familia Piemontesa</title>
        <meta
          name="description"
          content="Explora y compra los productos de la Fiesta. Platos típicos, bebidas y más."
        />
      </Helmet>

      <header className={styles.header}>
        <h1 className={styles.title}>Tienda de la Fiesta</h1>
        <p className={styles.subtitle}>
          Elige tus platos y bebidas favoritas para disfrutar al máximo.
        </p>
      </header>

      {!isLoading && !isError && products && products.length > 0 && (
        <div className={styles.filtersBar}>
          <div className={styles.searchInputWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <Input
              type="search"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className={styles.filterButton}>
                <Store size={16} />
                {selectedStand === "todos" ? "Todos los stands" : selectedStand}
              </Button>
            </DialogTrigger>
            <DialogContent className={styles.filterDialog}>
              <DialogHeader>
                <DialogTitle>Filtrar por Stand</DialogTitle>
              </DialogHeader>
              <div className={styles.filterDialogContent}>
                <Button
                  variant={selectedStand === "todos" ? "primary" : "outline"}
                  className={styles.filterDialogButton}
                  onClick={() => handleStandSelect("todos")}
                >
                  Todos los stands
                </Button>

                {uniqueStands.map((stand) => (
                  <Button
                    key={stand}
                    variant={selectedStand === stand ? "primary" : "outline"}
                    className={styles.filterDialogButton}
                    onClick={() => handleStandSelect(stand)}
                  >
                    {stand}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <main className={styles.mainContent}>
        {renderContent()}
      </main>
    </div>
  );
}