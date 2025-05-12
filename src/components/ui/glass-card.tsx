
import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card/80 backdrop-blur-sm shadow-sm transition-all",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
