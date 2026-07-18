import { Building2, LogOut, Menu, Moon, Sun, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Button from "../ui/Button";

const PublicLayout = () => {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const sectionLinks = [
    ["Home", "home"],
    ["Featured", "featured"],
    ["Amenities", "amenities"],
    ["FAQ", "faq"]
  ];

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection("");
      return undefined;
    }

    const updateActiveSection = () => {
      const currentSection = sectionLinks.find(([, id]) => {
        const element = document.getElementById(id);
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return rect.top <= 120 && rect.bottom > 120;
      });
      setActiveSection(currentSection?.[1] || "");
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    return () => window.removeEventListener("scroll", updateActiveSection);
  }, [location.pathname]);

  const scrollToSection = (id) => {
    const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

    setOpen(false);
    setActiveSection(id);
    if (location.pathname !== "/") {
      navigate("/");
      window.setTimeout(scroll, 0);
      return;
    }
    scroll();
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 text-lg font-semibold text-ink" onClick={() => setOpen(false)}>
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-gold/30 bg-gold/10">
              <Building2 className="h-5 w-5 text-gold" />
            </span>
            <span>
              PGStay
              <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-muted">Luxe Living</span>
            </span>
          </Link>
          <button
            className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Open menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <nav className={`${open ? "block" : "hidden"} absolute left-0 top-[73px] w-full border-b border-line bg-white p-4 shadow-soft md:static md:block md:w-auto md:border-0 md:p-0 md:shadow-none`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-7">
              {!user && sectionLinks.map(([label, id]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToSection(id)}
                  className={`text-left text-sm font-semibold transition ${activeSection === id ? "text-gold" : "text-secondary hover:text-gold"}`}
                >
                  {label}
                </button>
              ))}
              {user ? (
                <Button variant="secondary" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-gold transition hover:border-gold hover:bg-gold hover:text-white"
                    aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                  >
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                  <Link to="/login">
                    <Button variant="secondary" className="w-full md:w-auto">
                      <UserRound className="h-4 w-4" /> Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
};

export default PublicLayout;
