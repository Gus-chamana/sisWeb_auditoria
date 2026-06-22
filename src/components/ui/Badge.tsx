import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "blue" | "yellow" | "gray" | "red";
  className?: string;
}

export function Badge({ children, variant = "gray", className = "" }: BadgeProps) {
  const styles = {
    green: "bg-[#16653433] border border-[#16a34a80] text-[#4ade80]",
    blue: "bg-[#1e3a8a33] border border-[#3b82f680] text-[#60a5fa]",
    yellow: "bg-[#854d0e33] border border-[#ca8a0480] text-[#fbbf24]",
    gray: "bg-[#37415133] border border-[#4b556380] text-[#9ca3af]",
    red: "bg-[#991b1b33] border border-[#ef444480] text-[#f87171]",
  };

  return (
    <span className={`badge ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
