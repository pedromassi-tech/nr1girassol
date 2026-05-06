import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoLight from "@/assets/logo-girassol-light.png";
import logoDark from "@/assets/logo-girassol-dark.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isBlogPage = location.pathname.startsWith("/blog");
  const isDarkBg = !scrolled && !isBlogPage;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: "Soluções", path: "/servicos" },
    { label: "Mentoria", path: "/mentoria" },
    { label: "Especialista", path: "/sobre" },
    { label: "Blog", path: "/blog" },
  ];

  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled || isBlogPage ? "bg-background/95 backdrop-blur-lg shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 md:h-20 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={handleLogoClick}
        >
          <img
            src={(scrolled || isBlogPage) ? logoLight : logoDark}
            alt="Instituto Girassol"
            className="h-9 md:h-11 object-contain"
          />
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <button
              key={l.path}
              onClick={() => navigate(l.path)}
              className={`text-sm font-medium transition-colors ${
                isDarkBg 
                  ? "text-primary-foreground/70 hover:text-primary-foreground" 
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {l.label}
            </button>
          ))}
          <Button
            onClick={() => navigate("/quiz")}
            size="sm"
            className="gold-gradient border-0 text-primary font-semibold shadow-md hover:shadow-lg transition-shadow"
          >
            Fazer o teste
          </Button>
        </nav>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-2 rounded-lg ${isDarkBg ? "text-primary-foreground" : "text-primary"}`}
          aria-label="Menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b shadow-lg overflow-hidden"
          >
            <nav className="flex flex-col p-5 gap-4">
              {navLinks.map((l) => (
                <button
                  key={l.path}
                  onClick={() => navigate(l.path)}
                  className="text-left text-sm font-medium text-foreground/80 hover:text-primary py-2"
                >
                  {l.label}
                </button>
              ))}
              <Button 
                onClick={() => navigate("/quiz")} 
                className="gold-gradient border-0 text-primary font-semibold mt-2 w-full"
              >
                Fazer o teste
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
