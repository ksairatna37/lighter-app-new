import { Home, Target, ShoppingCart, Users, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  active?: boolean;
}

const NavItem = ({ icon: Icon, label, path, active }: NavItemProps) => {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate(path)}
      className={cn(
        "flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1",
        "text-xs font-medium transition-colors duration-200",
        active 
          ? "text-foreground" 
          : "text-foreground/70 hover:text-foreground"
      )}
    >
      <Icon className={cn(
        "w-5 h-5 mb-1",
        active && "animate-bounce-gentle"
      )} />
      <span className="truncate">{label}</span>
    </button>
  );
};

export const BottomNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Target, label: "Farm", path: "/farm" },
    { icon: ShoppingCart, label: "Trade", path: "/trade" },
    { icon: Users, label: "Refer", path: "/referrals" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-golden-light to-golden-dark border-t border-golden-dark/30 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex">
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              active={location.pathname === item.path}
            />
          ))}
        </div>
      </div>
    </nav>
  );
};