import React from "react";
import styles from "./FoodCard.module.css";

interface FoodCardProps {
  name: string;
  description: string;
  imageUrl: string;
  className?: string;
}

export const FoodCard = ({
  name,
  description,
  imageUrl,
  className,
}: FoodCardProps) => {
  return (
    <div className={`${styles.card} ${className || ""}`}>
      <div className={styles.imageContainer}>
        <img src={imageUrl} alt={name} className={styles.image} />
      </div>
      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
};