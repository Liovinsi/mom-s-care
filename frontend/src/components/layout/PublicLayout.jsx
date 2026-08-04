import { BedDouble, CalendarCheck, ChevronDown, LogOut, Menu, Moon, Sun, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Button from "../ui/Button";

const PublicLayout = () => {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);
  const sectionLinks = [
    ["Home", "home"],
    ["Branches", "featured"],
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

  useEffect(() => {
    const closeProfileMenu = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) setProfileOpen(false);
    };

    document.addEventListener("mousedown", closeProfileMenu);
    return () => document.removeEventListener("mousedown", closeProfileMenu);
  }, []);

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
    setProfileOpen(false);
    navigate("/");
  };

  const profileInitial = (user?.name || user?.email || "U").slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-xl">
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
          <nav className={`${open ? "block" : "hidden"} absolute left-0 top-[73px] w-full border-b border-line bg-white p-4 shadow-soft md:static md:block md:w-auto md:border-0 md:p-0 md:shadow-none`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-7">
              {sectionLinks.map(([label, id]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToSection(id)}
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
                        ["Booking Status", "/booking-status", CalendarCheck],
                        ["Profile", "/profile", UserRound]
                      ].map(([label, to, Icon]) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => {
                            setOpen(false);
                            setProfileOpen(false);
                          }}
                          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-secondary transition hover:bg-paper hover:text-brandDark"
                        >
                          <Icon className="h-4 w-4" /> {label}
                        </Link>
                      ))}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-secondary transition hover:bg-paper hover:text-brandDark"
                      >
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login">
                  <Button variant="secondary" className="w-full md:w-auto">
                    <UserRound className="h-4 w-4" /> Login
                  </Button>
                </Link>
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
