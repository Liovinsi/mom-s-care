import { BarChart3, BedDouble, Bell, Building2, CreditCard, FileText, Home, LogOut, MessageSquareWarning, Moon, Settings, Sun, Users } from "lucide-react";
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
  ["Complaint Management", "/pgbooking/admin/complaints", MessageSquareWarning],
  ["Update Requests", "/pgbooking/admin/update-requests", Bell],
  ["Reports & Analytics", "/pgbooking/admin/reports", BarChart3],
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

  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-slate-200 bg-white p-4 lg:min-h-screen">
        <div className="mb-5 flex items-center gap-2 text-lg font-bold">
          <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-brand/20 bg-white shadow-soft">
            <img src="/logo.jpeg" alt="PG Stay logo" className="h-full w-full object-cover" />
          </span>
          <span>PGStay</span>
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
          {links.map(([label, to, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to.endsWith("/dashboard")}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-mint text-white" : "text-slate-600 hover:bg-slate-50"}`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
              {role === "ADMIN" && label === "Bookings" && pendingCount > 0 && <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{pendingCount}</span>}
              {role === "ADMIN" && label === "Complaint Management" && complaintCount > 0 && <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">{complaintCount}</span>}
              {role === "ADMIN" && label === "Update Requests" && updateRequestCount > 0 && <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{updateRequestCount}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="min-w-0">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div>
            <p className="text-sm text-slate-500">{roleLabels[role] ?? "Dashboard"}</p>
            <h1 className="text-lg font-semibold">{user?.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            {role === "ADMIN" && <span className="relative grid h-10 w-10 place-items-center rounded-md border bg-white text-mint" aria-label={`${pendingCount + complaintCount + updateRequestCount} pending notifications`}><Bell className="h-4 w-4" />{pendingCount + complaintCount + updateRequestCount > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">{pendingCount + complaintCount + updateRequestCount}</span>}</span>}
            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-10 w-10 place-items-center rounded-md border bg-white text-mint transition hover:bg-mint hover:text-white"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
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
