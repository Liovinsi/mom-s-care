import { BarChart3, BedDouble, Bell, Building2, CreditCard, FileText, Home, LogOut, Menu, MessageSquareWarning, Moon, Settings, Sun, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { loadBookings } from "../../data/adminBookings";
import { loadComplaints } from "../../data/complaints";
import { loadStatusUpdateRequests } from "../../data/statusUpdateRequests";

const adminLinks = [
  ["Dashboard", "/pgbooking/admin/dashboard", Home],
  ["Branches", "/pgbooking/admin/branches", Building2],
  ["Rooms", "/pgbooking/admin/rooms", BedDouble],
  ["Beds", "/pgbooking/admin/beds", BedDouble],
  ["Bookings", "/pgbooking/admin/bookings", FileText],
  ["Residents", "/pgbooking/admin/residents", Users],
  ["Wardens", "/pgbooking/admin/wardens", Users],
  ["Payments", "/pgbooking/admin/payments", CreditCard],
  ["Complaints", "/pgbooking/admin/complaints", MessageSquareWarning],
  ["Reports", "/pgbooking/admin/reports", BarChart3],
  ["Settings", "/pgbooking/admin/settings", Settings]
];

const wardenLinks = [
  ["Dashboard", "/pgbooking/warden/dashboard", Home],
  ["Residents", "/pgbooking/warden/residents", Users],
  ["Payments", "/pgbooking/warden/payments", CreditCard],
  ["Rooms & Beds", "/pgbooking/warden/occupancy", BedDouble],
  ["Complaints", "/pgbooking/warden/complaints", MessageSquareWarning]
];

const DashboardLayout = ({ role }) => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [pendingCount, setPendingCount] = useState(() => loadBookings().filter((booking) => booking.bookingStatus === "Pending Approval").length);
  const [complaintCount, setComplaintCount] = useState(() => loadComplaints().filter((complaint) => complaint.raisedBy === "Warden" && complaint.status === "Open").length);
  const [updateRequestCount, setUpdateRequestCount] = useState(() => loadStatusUpdateRequests().filter((request) => request.status === "Pending Approval").length);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const refreshCount = () => setPendingCount(loadBookings().filter((booking) => booking.bookingStatus === "Pending Approval").length);
    const refreshComplaints = () => setComplaintCount(loadComplaints().filter((complaint) => complaint.raisedBy === "Warden" && complaint.status === "Open").length);
    const refreshUpdateRequests = () => setUpdateRequestCount(loadStatusUpdateRequests().filter((request) => request.status === "Pending Approval").length);
    window.addEventListener("pg:bookings-updated", refreshCount);
    window.addEventListener("storage", refreshCount);
    window.addEventListener("pg:complaints-updated", refreshComplaints);
    window.addEventListener("storage", refreshComplaints);
    window.addEventListener("pg:status-update-requests-updated", refreshUpdateRequests);
    window.addEventListener("storage", refreshUpdateRequests);
    return () => {
      window.removeEventListener("pg:bookings-updated", refreshCount);
      window.removeEventListener("storage", refreshCount);
      window.removeEventListener("pg:complaints-updated", refreshComplaints);
      window.removeEventListener("storage", refreshComplaints);
      window.removeEventListener("pg:status-update-requests-updated", refreshUpdateRequests);
      window.removeEventListener("storage", refreshUpdateRequests);
    };
  }, []);
  const linksByRole = {
    ADMIN: adminLinks,
    WARDEN: wardenLinks
  };
  const roleLabels = {
    ADMIN: "Admin",
    WARDEN: "Warden"
  };
  const links = linksByRole[role] ?? adminLinks;

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const handleLogout = () => {
    setDrawerOpen(false);
    logout();
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-paper lg:grid lg:grid-cols-[260px_1fr]">
      <button type="button" aria-label="Close navigation" onClick={() => setDrawerOpen(false)} className={`fixed inset-0 z-40 bg-ink/45 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(86vw,320px)] flex-col border-r border-line bg-white p-5 shadow-luxury transition-transform duration-300 ease-out dark:border-slate-700 dark:bg-slate-900 lg:static lg:z-auto lg:w-auto lg:min-h-screen lg:translate-x-0 lg:p-4 lg:shadow-none ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-6 flex items-center gap-3 text-lg font-bold text-ink dark:text-slate-100">
          <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-brand/20 bg-white shadow-soft dark:bg-slate-800">
            <img src="/logo.jpeg" alt="PG Stay logo" className="h-full w-full object-cover" />
          </span>
          <span className="min-w-0 flex-1">PGStay<span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-muted dark:text-slate-400">Admin Portal</span></span>
          <button type="button" onClick={() => setDrawerOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink dark:border-slate-700 dark:text-slate-100 lg:hidden" aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <nav className="scrollbar-thin flex flex-1 flex-col gap-2 overflow-y-auto pb-4">
          {links.map(([label, to, Icon]) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setDrawerOpen(false)}
              end={to.endsWith("/dashboard")}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-mint text-white" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"}`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
              {role === "ADMIN" && label === "Bookings" && pendingCount > 0 && <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{pendingCount}</span>}
              {role === "ADMIN" && label === "Complaints" && complaintCount > 0 && <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">{complaintCount}</span>}
            </NavLink>
          ))}
        </nav>
        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl border border-line px-3 py-3 text-left text-sm font-semibold text-secondary transition hover:border-brand hover:bg-paper hover:text-brandDark dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"><LogOut className="h-4 w-4" /> Logout</button>
      </aside>
      <main className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setDrawerOpen(true)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line text-ink dark:border-slate-700 dark:text-slate-100 lg:hidden" aria-label="Open menu" aria-expanded={drawerOpen}><Menu className="h-5 w-5" /></button>
            <div className="min-w-0">
            <p className="text-sm text-slate-500 dark:text-slate-400">{roleLabels[role] ?? "Dashboard"}</p>
            <h1 className="truncate text-base font-semibold text-ink dark:text-slate-100 sm:text-lg">{user?.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {role === "ADMIN" && <span className="relative grid h-10 w-10 place-items-center rounded-md border bg-white text-mint dark:border-slate-700 dark:bg-slate-800" aria-label={`${pendingCount + complaintCount + updateRequestCount} pending notifications`}><Bell className="h-4 w-4" />{pendingCount + complaintCount + updateRequestCount > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">{pendingCount + complaintCount + updateRequestCount}</span>}</span>}
            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-10 w-10 place-items-center rounded-md border bg-white text-mint transition hover:bg-mint hover:text-white dark:border-slate-700 dark:bg-slate-800"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={handleLogout} className="hidden items-center gap-2 rounded-md border px-3 py-2 text-sm dark:border-slate-700 dark:text-slate-100 lg:inline-flex">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </header>
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
