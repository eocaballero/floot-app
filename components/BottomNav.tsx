import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Store, ShoppingCart, Wallet, ShoppingBag, LogIn } from "lucide-react";
import styles from "./BottomNav.module.css";
import { useAuth } from "../helpers/useAuth";
import { useCart } from "../helpers/useCart";
import { Badge } from "./Badge";

const authenticatedNavItems = [
  { href: "/tienda", label: "Tienda", icon: Store },
  { href: "/carrito", label: "Carrito", icon: ShoppingCart },
  { href: "/billetera", label: "Billetera", icon: Wallet },
  { href: "/compras", label: "Compras", icon: ShoppingBag },
];

const unauthenticatedNavItems = [
  { href: "/login", label: "Ingresar", icon: LogIn },
];

export const BottomNav = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { cartItems } = useCart();

  // Calculate total quantity of items in cart
  const totalCartQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = isAuthenticated ? authenticatedNavItems : unauthenticatedNavItems;

  return (
    <nav className={styles.nav}>
      <div className={styles.navContent}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          const isCartItem = item.href === "/carrito";
          const showBadge = isCartItem && isAuthenticated && totalCartQuantity > 0;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <div className={styles.iconWrapper}>
                <Icon size={24} className={styles.icon} />
                {showBadge && (
                  <Badge className={`${styles.badge} ${styles.cartBadge}`} variant="destructive">
                    {totalCartQuantity}
                  </Badge>
                )}
              </div>
              <span className={styles.label}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};