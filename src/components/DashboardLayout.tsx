import { Link, useLocation, useNavigate } from "react-router-dom";
import { PawPrint, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { clearAuthSession } from "@/lib/auth";
import { api } from "@/lib/api";

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
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Session might already be invalid; clear local auth regardless.
    }
    clearAuthSession();
    setOpen(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link to="/" className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              <span className="text-lg sm:text-xl font-extrabold font-[Nunito]">PetCare</span>
            </Link>
            <div className={cn("text-xs font-semibold px-2 sm:px-3 py-1 rounded-full", roleColor)}>
              {title}
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-2">
            {navItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button variant={location.pathname === item.href ? "default" : "ghost"} size="sm">
                  {item.label}
                </Button>
              </Link>
            ))}
            <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
          </div>

          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="sm:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 pt-10">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link key={item.href} to={item.href} onClick={() => setOpen(false)}>
                    <Button
                      variant={location.pathname === item.href ? "default" : "ghost"}
                      className="w-full justify-start"
                    >
                      {item.label}
                    </Button>
                  </Link>
                ))}
                <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>Logout</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
    </div>
  );
};

export default DashboardLayout;
