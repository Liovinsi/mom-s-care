import { AnimatePresence, motion } from "framer-motion";
import { BedDouble, ChevronDown, ChevronUp, LogOut, Menu, Moon, Sun, UserRound, X } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { NavbarVisibilityProvider } from "../../context/NavbarVisibilityContext";
import { useTheme } from "../../context/ThemeContext";
import useScrollDirection from "../../hooks/useScrollDirection";
import Button from "../ui/Button";

const DRAWER_TRANSITION = { duration: 0.28, ease: "easeOut" };

const NavLinks = ({ sectionLinks, activeSection, onSectionClick, theme, toggleTheme, user, onLogout, onNavigate }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const closeProfileMenu = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) setProfileOpen(false);
    };

    document.addEventListener("mousedown", closeProfileMenu);
    return () => document.removeEventListener("mousedown", closeProfileMenu);
  }, []);

  const profileInitial = (user?.name || user?.email || "U").slice(0, 1).toUpperCase();

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-7">
      {sectionLinks.map(([label, id]) => (
        <button
          key={id}
          type="button"
          onClick={() => {
            onSectionClick(id);
            onNavigate?.();
          }}
          className={`text-left text-sm font-semibold transition ${activeSection === id ? "text-brand" : "text-secondary hover:text-brandDark"}`}
        >
          {label}
        </button>
      ))}
      <button
        type="button"
        onClick={toggleTheme}
        className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-brand transition hover:border-brandDark hover:bg-brandDark hover:text-white"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      {user ? (
        <div ref={profileMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((value) => !value)}
            className="flex w-full items-center gap-3 rounded-xl border border-line bg-white px-3 py-2 text-left shadow-soft transition hover:border-brandDark md:w-auto"
            aria-expanded={profileOpen}
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-white">
              {profileInitial}
            </span>
            <span className="min-w-0 md:hidden lg:block">
              <span className="block max-w-32 truncate text-sm font-bold text-ink">{user.name || "User"}</span>
              <span className="block max-w-32 truncate text-xs text-muted">{user.email}</span>
            </span>
            <ChevronDown className={`h-4 w-4 text-brand transition ${profileOpen ? "rotate-180" : ""}`} />
          </button>
          {profileOpen && (
            <div className="mt-3 w-full rounded-2xl border border-line bg-white p-2 shadow-luxury md:absolute md:right-0 md:mt-2 md:w-56">
              {[
                ["My Bookings", "/my-bookings", BedDouble],
                ["Profile", "/profile", UserRound]
              ].map(([label, to, Icon]) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate?.();
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-secondary transition hover:bg-paper hover:text-brandDark"
                >
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onNavigate?.();
                  onLogout();
                }}
                className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-secondary transition hover:bg-paper hover:text-brandDark"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link to="/login" onClick={() => onNavigate?.()}>
          <Button variant="secondary" className="w-full md:w-auto">
            <UserRound className="h-4 w-4" /> Login
          </Button>
        </Link>
      )}
    </div>
  );
};

const PublicLayout = () => {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const navbarVisible = useScrollDirection() || open;
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const sectionLinks = [
    ["Home", "home"],
    ["Branches", "featured"],
    ["Amenities", "amenities"],
    ["FAQ", "faq"]
  ];

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return undefined;

    const updateHeight = () => setHeaderHeight(header.getBoundingClientRect().height);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  const navbarContextValue = useMemo(() => ({ visible: navbarVisible, headerHeight }), [navbarVisible, headerHeight]);

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

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const updateBackToTop = () => setShowBackToTop(window.scrollY > 300);
    updateBackToTop();
    window.addEventListener("scroll", updateBackToTop, { passive: true });
    return () => window.removeEventListener("scroll", updateBackToTop);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const scrollToSection = (id) => {
    const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

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
    navigate("/");
  };

  return (
    <NavbarVisibilityProvider value={navbarContextValue}>
    <div className="min-h-screen bg-white">
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-40 border-b border-line bg-white/95 backdrop-blur-xl transition-transform duration-300 ease-out will-change-transform ${
          navbarVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 text-lg font-semibold text-ink" onClick={() => setOpen(false)}>
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-brand/20 bg-white shadow-soft">
              <img src="/logo.jpeg" alt="PG Stay logo" className="h-full w-full object-cover" />
            </span>
            <span>
              Mom’s Care PG House
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
          <nav className="hidden md:block">
            <NavLinks
              sectionLinks={sectionLinks}
              activeSection={activeSection}
              onSectionClick={scrollToSection}
              theme={theme}
              toggleTheme={toggleTheme}
              user={user}
              onLogout={handleLogout}
            />
          </nav>
        </div>
      </header>
      <div style={{ height: headerHeight }} aria-hidden="true" />

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-nav-backdrop"
            className="fixed inset-0 z-50 bg-ink/50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={DRAWER_TRANSITION}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        )}
        {open && (
          <motion.nav
            key="mobile-nav-drawer"
            className="fixed right-0 top-0 z-[60] flex h-full w-[82%] max-w-xs flex-col overflow-y-auto border-l border-line bg-white p-6 shadow-luxury md:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={DRAWER_TRANSITION}
            aria-label="Mobile navigation"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm font-bold uppercase tracking-widest text-muted">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-line text-ink"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <NavLinks
              sectionLinks={sectionLinks}
              activeSection={activeSection}
              onSectionClick={scrollToSection}
              theme={theme}
              toggleTheme={toggleTheme}
              user={user}
              onLogout={handleLogout}
              onNavigate={() => setOpen(false)}
            />
          </motion.nav>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            key="back-to-top"
            type="button"
            onClick={scrollToTop}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-6 right-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-brand text-white shadow-[0_12px_24px_rgba(221,94,103,0.25)] transition duration-[250ms] ease-in-out hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-brandDark hover:shadow-[0_18px_34px_rgba(209,34,51,0.28)] active:scale-[0.97] sm:bottom-8 sm:right-8"
            aria-label="Back to top"
          >
            <ChevronUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <Outlet />
    </div>
    </NavbarVisibilityProvider>
  );
};

export default PublicLayout;
