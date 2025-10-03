import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MetricCardProps {
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
}

export const MetricCard = ({ children, className, animated = true }: MetricCardProps) => {
  const content = (
    <div className={cn(
      "bg-card rounded-lg p-6 border border-border/50",
      "hover:border-accent-primary/30 transition-all duration-300",
      "shadow-[var(--shadow-card)]",
      className
    )}>
      {children}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

interface MetricValueProps {
  children: React.ReactNode;
  className?: string;
}

export const MetricValue = ({ children, className }: MetricValueProps) => {
  return (
    <div className={cn(
      "text-3xl font-bold bg-gradient-to-r from-foreground to-accent-primary bg-clip-text text-transparent",
      className
    )}>
      {children}
    </div>
  );
};

interface MetricLabelProps {
  children: React.ReactNode;
  className?: string;
}

export const MetricLabel = ({ children, className }: MetricLabelProps) => {
  return (
    <div className={cn("text-sm text-muted-foreground mt-1", className)}>
      {children}
    </div>
  );
};

interface MetricChangeProps {
  children: React.ReactNode;
  positive?: boolean;
  className?: string;
}

export const MetricChange = ({ children, positive, className }: MetricChangeProps) => {
  return (
    <div className={cn(
      "text-sm font-medium mt-2",
      positive ? "text-success" : "text-error",
      className
    )}>
      {children}
    </div>
  );
};

interface StatProps {
  label: string;
  value: string;
  positive?: boolean;
  warning?: boolean;
  className?: string;
}

export const Stat = ({ label, value, positive, warning, className }: StatProps) => {
  return (
    <div className={cn("flex justify-between items-center py-2", className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn(
        "text-sm font-medium",
        positive && "text-success",
        warning && "text-warning",
        !positive && !warning && "text-foreground"
      )}>
        {value}
      </span>
    </div>
  );
};

interface StatsGridProps {
  children: React.ReactNode;
  className?: string;
}

export const StatsGrid = ({ children, className }: StatsGridProps) => {
  return (
    <div className={cn("grid grid-cols-2 gap-4 mt-4", className)}>
      {children}
    </div>
  );
};