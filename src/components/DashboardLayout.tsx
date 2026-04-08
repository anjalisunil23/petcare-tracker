import { Link, useLocation } from "react-router-dom";
import { PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
}

interface DashboardLayoutProps {
  title: string;
  navItems: NavItem[];
  roleColor: string;
  children: React.ReactNode;
}

const DashboardLayout = ({ title, navItems, roleColor, children }: DashboardLayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <PawPrint className="h-7 w-7 text-primary" />
              <span className="text-xl font-extrabold font-[Nunito]">PetCare</span>
            </Link>
            <div className={cn("text-xs font-semibold px-3 py-1 rounded-full", roleColor)}>
              {title}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={location.pathname === item.href ? "default" : "ghost"}
                  size="sm"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            <Link to="/">
              <Button variant="outline" size="sm">Home</Button>
            </Link>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
};

export default DashboardLayout;
