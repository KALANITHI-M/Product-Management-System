
import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard,
  Package,
  Boxes,
  ClipboardList,
  FileBarChart,
  Settings,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
};

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
          : "text-sidebar-foreground/80"
      )}
    >
      <span className="text-sidebar-foreground">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
};

const Sidebar: React.FC = () => {
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-sidebar flex flex-col border-r border-sidebar-border">
      <div className="p-4">
        <h1 className="text-xl font-bold text-sidebar-foreground flex items-center">
          <Boxes className="mr-2" size={24} />
          CraftFlow
        </h1>
      </div>
      
      <nav className="flex-grow p-4 space-y-1">
        <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <NavItem to="/products" icon={<Package size={20} />} label="Products" />
        <NavItem to="/materials" icon={<Boxes size={20} />} label="Materials" />
        <NavItem to="/production-logs" icon={<ClipboardList size={20} />} label="Production Logs" />
        <NavItem to="/reports" icon={<FileBarChart size={20} />} label="Reports" />
        <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
      </nav>
      
      <div className="p-4 border-t border-sidebar-border mt-auto">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2 text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
