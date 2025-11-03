import { Search, User, LogOut, Stethoscope, Pill, FlaskConical } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <Stethoscope className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-primary">MediConnect</span>
        </Link>

        {/* Search Bar - Hidden on mobile */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search doctors, specialties, or conditions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-2xl"
            />
          </div>
        </form>

        {/* Navigation */}
        <div className="flex items-center space-x-4">
          <Link to="/medicine" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="hover:bg-primary/10 transition-colors font-medium">
              <Pill className="h-4 w-4 mr-1" />
              Medicine
            </Button>
          </Link>
          <Link to="/lab-tests" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="hover:bg-primary/10 transition-colors font-medium">
              <FlaskConical className="h-4 w-4 mr-1" />
              Lab Tests
            </Button>
          </Link>
          <Link to="/pricing" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="hover:bg-primary/10 transition-colors font-medium">
              MediConnect Band
            </Button>
          </Link>
          {user && (
            <>
              <Link to="/health-dashboard" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="hover:bg-primary/10 transition-colors font-medium">
                  Health Dashboard
                </Button>
              </Link>
              <Link to="/doctor-dashboard" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="hover:bg-primary/10 transition-colors font-medium">
                  Doctor Dashboard
                </Button>
              </Link>
            </>
          )}
          {user ? (
            <>
              <Link to="/account">
                <Button variant="ghost" size="sm" className="hover:bg-primary/10 transition-colors">
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Account</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-destructive/10 transition-colors">
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="hover:bg-primary/10 transition-colors">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="rounded-2xl hover:bg-primary-hover hover:scale-105 transition-all duration-200">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-4">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search doctors, specialties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-2xl"
            />
          </div>
        </form>
      </div>
    </header>
  );
}