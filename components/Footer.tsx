import React from "react";
import styles from "./Footer.module.css";

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.developer}>
                    <h4 className={styles.linkTitle}>Desarrollado y mantenido por</h4>
          <a 
            href="http://www.pixelbytes.com.ar" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.logoLink}
          >
            <img 
              src="https://assets.floot.app/b8a35fa9-4ace-4571-b758-450ba6aec3cb/64c3d107-b83a-43ba-979c-e8dea8711c08.png" 
              alt="PixelBytes" 
              className={styles.logo}
            />
          </a>
          <p className={styles.contactInfo}>
            info@pixelbytes.com.ar | +54-351-3659054
          </p>
        </div>
      </div>
    </footer>
  );
};