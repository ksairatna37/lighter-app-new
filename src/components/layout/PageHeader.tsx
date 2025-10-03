import { ArrowLeft, Settings, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title?: string;
  showBack?: boolean;
  showSettings?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({ 
  title, 
  showBack = false, 
  showSettings = false, 
  children,
  className 
}: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className={cn("flex items-center justify-between py-4 mb-6", className)}>
      <div className="flex items-center gap-3">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        {title && (
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
        )}
      </div>
      
      {children || (showSettings && (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </header>
  );
};

export const AppLogo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-gradient-to-r from-accent-primary to-accent-blue rounded-lg flex items-center justify-center">
        <span className="text-lg">🚜</span>
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-accent-primary to-accent-blue bg-clip-text text-transparent">
        Lighter Farm
      </span>
    </div>
  );
};