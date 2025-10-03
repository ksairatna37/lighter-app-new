import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export const Container = ({ children, className }: ContainerProps) => {
  return (
    <div className={cn("px-4 max-w-md mx-auto relative min-h-screen bg-background", className)}>
      {children}
    </div>
  );
};