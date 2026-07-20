import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "blue" | "yellow" | "gray" | "red";
  className?: string;
}

export function Badge({ children, variant = "gray", className = "" }: BadgeProps) {
  const styles = {
    green: "badge-green",
    blue: "badge-blue",
    yellow: "badge-yellow",
    gray: "badge-gray",
    red: "badge-red",
  };

  return (
    <span className={`badge border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
