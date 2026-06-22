import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`glass-card p-6 shadow-lg backdrop-blur-glass border border-sivac-border-glass ${className}`}
    >
      {children}
    </div>
  );
}
