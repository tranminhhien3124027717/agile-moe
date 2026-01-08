import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Header() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isEService = location.pathname.startsWith('/eservice');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 transition-smooth hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-hero">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-foreground">EduCredit</span>
            <span className="text-xs text-muted-foreground">Education Account System</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/admin">
            <Button
              variant={isAdmin ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "gap-2",
                isAdmin && "bg-primary/10 text-primary hover:bg-primary/15"
              )}
            >
              <Shield className="h-4 w-4" />
              Admin Portal
            </Button>
          </Link>
          <Link to="/eservice">
            <Button
              variant={isEService ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "gap-2",
                isEService && "bg-accent/10 text-accent hover:bg-accent/15"
              )}
            >
              <User className="h-4 w-4" />
              e-Service Portal
            </Button>
          </Link>
        </nav>

        <div className="flex md:hidden items-center gap-2">
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <Shield className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/eservice">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
