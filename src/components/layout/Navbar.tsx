import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import CurrencySelector from "@/components/layout/CurrencySelector";
import logo from "@/assets/logo.jpg";

const navLinks = [

  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Projects", path: "/projects" },
  
  { label: "Blog", path: "/blog" },
  { label: "Volunteer", path: "/volunteer" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuId = "mobile-navigation-menu";

  // Fold up the mobile menu whenever navigation happens, including taps on the

  // link for the page you are already on.
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.search, location.key]);

  // Close the mobile menu when the user starts scrolling the page.
  useEffect(() => {
    const handleScroll = () => setIsOpen(false);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the mobile menu when the Escape key is pressed and trap focus inside
  // it while it is open.
  useEffect(() => {
    if (!isOpen) return;

    const getFocusableElements = () => {
      if (!menuRef.current) return [];
      return Array.from(
        menuRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);
    };

    // Move focus to the first focusable element when the menu opens.
    const focusable = getFocusableElements();
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        toggleRef.current?.focus();
        return;
      }

      if (e.key !== "Tab") return;

      const elements = getFocusableElements();
      if (elements.length === 0) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">

      <nav className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Al-Imran Muslim Aid" className="w-10 h-10 rounded-full object-cover" />
          <span className="font-serif text-xl md:text-2xl font-bold text-foreground">
            Al-Imran<span className="text-accent"> Muslim Aid</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <CurrencySelector />
          <Link to="/donate">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6">
              <Heart className="w-4 h-4 mr-1" />
              Donate Now
            </Button>
          </Link>
        </div>

        <button
          ref={toggleRef}
          className="lg:hidden p-2 rounded-md hover:bg-muted"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls={menuId}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {isOpen && (
        <div
          id={menuId}
          ref={menuRef}
          role="dialog"
          aria-label="Mobile navigation"
          className="lg:hidden border-t border-border bg-background animate-fade-in"
        >

          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 mt-2">
              <CurrencySelector />
              <Link to="/donate" onClick={() => setIsOpen(false)} className="flex-1">
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                  <Heart className="w-4 h-4 mr-1" />
                  Donate Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
