import { Home, Target, ShoppingCart, Users, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import home from "@/assets/Home.png";
import farm from "@/assets/Lightning Bolt.png";
import buysell from "@/assets/Money Circulation.png";
import refer from "@/assets/People.png";
import profile from "@/assets/Profile.png";

interface NavItemProps {
  icon: React.ComponentType<{ className?: string }> | string; // allow component OR string (image path)
  label: string;
  path: string;
  active?: boolean;
}

const NavItem = ({ icon, label, path, active }: NavItemProps) => {
  const navigate = useNavigate();
  const isImage = typeof icon === "string";

  return (
    <button
      onClick={() => navigate(path)}
      className={cn(
        "flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1",
        "text-xs font-medium transition-colors duration-200",
        active 
          ? "text-[#A07715]" 
          : "text-[#A07715]/70 hover:text-[#A07715]"
      )}
    >
      {isImage ? (
        <img
          src={icon}
          alt={label}
          className={cn("w-5 h-5 mb-1", active && "animate-bounce-gentle")}
        />
      ) : (
        // if it's a React component (Lucide icon)
        (() => {
          const IconComponent = icon as React.ComponentType<{ className?: string }>;
          return <IconComponent className={cn("w-5 h-5 mb-1", active && "animate-bounce-gentle")} />;
        })()
      )}
      <span className="truncate">{label}</span>
    </button>
  );
};

export const BottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    { icon: home, label: "Home", path: "/dashboard" },
    { icon: farm, label: "Farm", path: "/farm" },
    { icon: buysell, label: "Buy/Sell", path: "/trade" },
    { icon: refer, label: "Refer", path: "/referrals" },
    { icon: profile, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-transparent z-50">
      <div className="max-w-md mx-auto">
        <div className="flex bg-[#090b0c]">
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
