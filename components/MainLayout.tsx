import React from "react";
import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BottomNav } from "./BottomNav";
import styles from "./MainLayout.module.css";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const showBottomNav = location.pathname !== "/login";
  const showFooter = location.pathname === "/";

  return (
    <div className={styles.layout}>
      <Header />
      <main className={`${styles.main} ${showBottomNav ? styles.mainWithBottomNav : ""}`}>
        {children}
      </main>
      {showBottomNav && <BottomNav />}
      {showFooter && <Footer />}
    </div>
  );
};