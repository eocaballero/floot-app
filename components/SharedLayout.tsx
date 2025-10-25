import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ShoppingCart, User, Wallet, QrCode, LogOut } from 'lucide-react';
import { useCartQuery } from '../helpers/useCartQuery';
import { useAuth } from '../helpers/useMockAuth';
import { Badge } from './Badge';
import { Avatar, AvatarFallback } from './Avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './DropdownMenu';
import styles from './SharedLayout.module.css';

interface SharedLayoutProps {
  children: React.ReactNode;
}

export const SharedLayout: React.FC<SharedLayoutProps> = ({ children }) => {
  const { data: cartData } = useCartQuery();
  const cartItemCount = cartData?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getUserInitials = () => {
    if (!user) return 'U';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    console.log('User logged out and redirected to home');
  };

  return (
    <div className={styles.layoutContainer}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          <img 
            src="https://assets.floot.app/b8a35fa9-4ace-4571-b758-450ba6aec3cb/1ac7a814-a3cf-4c06-88fe-57f1f9a6dc45.jpg" 
            alt="FNFP Logo" 
            className={styles.logoImage}
          />
          <span className={styles.logoText}>Patio de Comida</span>
        </Link>
        {user && (
          <div className={styles.userSection}>
            <DropdownMenu>
              <DropdownMenuTrigger className={styles.userTrigger}>
                <Avatar>
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <span className={styles.userName}>{user.name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut size={16} style={{ marginRight: 8 }} />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </header>
      <main className={styles.mainContent}>
        {children}
      </main>
      <nav className={styles.bottomNav}>
        <NavLink to="/store" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
          <UtensilsCrossed size={24} />
          <span>Tienda</span>
        </NavLink>
        <NavLink to="/cart" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
          <div className={styles.cartIconWrapper}>
            <ShoppingCart size={24} />
            {cartItemCount > 0 && <Badge className={styles.cartBadge}>{cartItemCount}</Badge>}
          </div>
          <span>Carrito</span>
        </NavLink>
        <NavLink to="/wallet" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
          <Wallet size={24} />
          <span>Monedero</span>
        </NavLink>
        <NavLink to="/my-qr" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
          <QrCode size={24} />
          <span>Mi QR</span>
        </NavLink>
        <NavLink to="/my-products" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
          <User size={24} />
          <span>Mis Productos</span>
        </NavLink>
      </nav>
    </div>
  );
};