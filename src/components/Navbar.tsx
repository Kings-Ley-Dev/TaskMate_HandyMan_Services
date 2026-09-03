import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Wrench } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/");
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-primary border-b border-primary-dark shadow-md theme-admin:bg-[hsl(220,40%,12%)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-secondary p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">TaskMate</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`transition-colors ${isActive('/') ? 'text-secondary' : 'text-white hover:text-secondary'}`}
            >
              Home
            </Link>
            <Link 
              to="/services" 
              className={`transition-colors ${isActive('/services') ? 'text-secondary' : 'text-white hover:text-secondary'}`}
            >
              Find Services
            </Link>
            <Link 
              to="/blog" 
              className={`transition-colors ${isActive('/blog') ? 'text-secondary' : 'text-white hover:text-secondary'}`}
            >
              Blog
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <Button 
                onClick={handleLogout}
                className="bg-secondary hover:bg-secondary-dark text-white"
              >
                Log Out
              </Button>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button variant="ghost" className="text-white hover:text-secondary hover:bg-primary-light">
                    Login
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button className="bg-secondary hover:bg-secondary-dark text-white">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white p-2 hover:bg-primary-light rounded-lg transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-6 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className={`transition-colors py-2 ${isActive('/') ? 'text-secondary' : 'text-white hover:text-secondary'}`}
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link
                to="/services"
                className={`transition-colors py-2 ${isActive('/services') ? 'text-secondary' : 'text-white hover:text-secondary'}`}
                onClick={toggleMenu}
              >
                Find Services
              </Link>
              <Link
                to="/blog"
                className={`transition-colors py-2 ${isActive('/blog') ? 'text-secondary' : 'text-white hover:text-secondary'}`}
                onClick={toggleMenu}
              >
                Blog
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-primary-light">
                {user ? (
                  <Button 
                    onClick={() => {
                      toggleMenu();
                      handleLogout();
                    }}
                    className="w-full bg-secondary hover:bg-secondary-dark text-white"
                  >
                    Log Out
                  </Button>
                ) : (
                  <>
                    <Link to="/auth/login" onClick={toggleMenu}>
                      <Button variant="ghost" className="w-full text-white hover:text-secondary hover:bg-primary-light">
                        Login
                      </Button>
                    </Link>
                    <Link to="/auth/register" onClick={toggleMenu}>
                      <Button className="w-full bg-secondary hover:bg-secondary-dark text-white">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
