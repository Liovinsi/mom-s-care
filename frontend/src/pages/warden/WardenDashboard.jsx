import { BedDouble, CalendarCheck, CheckCircle2, CreditCard, DoorOpen, IndianRupee, LogOut, MessageSquareWarning, UserCheck, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import { useAuth } from "../../context/AuthContext";
import { loadBookings } from "../../data/adminBookings";
import { loadResidents } from "../../data/adminResidents";
import { loadWardens } from "../../data/adminWardens";
import { loadComplaints } from "../../data/complaints";
import { useLiveAvailability } from "../../lib/liveAvailability";
import { useLivePayments } from "../../lib/livePayments";

const today = "2026-07-18";

const wardenBranchByUser = {
  "dev-warden-wd001": "Anna Nagar"
};

const fieldBadge = {
  Pending: "bg-brand/10 text-brandDark",
  Approved: "bg-brand/10 text-brandDark",
  "Assigned to Warden": "bg-purple-50 text-purple-700",
  "Checked In": "bg-brand/10 text-brandDark",
  Rejected: "bg-paper text-brandDark",
  Cancelled: "bg-slate-100 text-slate-700"
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const StatusBadge = ({ status }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-bold ${fieldBadge[status] || "bg-slate-100 text-slate-700"}`}>{status}</span>
);

const ActivityList = ({ title, items, emptyText }) => (
  <Card>
    <h2 className="text-lg font-bold text-ink">{title}</h2>
    <div className="mt-4 space-y-3">
      {items.map((item) => (
        <div key={`${title}-${item.primary}-${item.meta}`} className="rounded-xl bg-paper p-3">
          <p className="font-bold text-ink">{item.primary}</p>
          <p className="mt-1 text-sm text-slate-600">{item.meta}</p>
        </div>
      ))}
      {!items.length && <p className="rounded-xl bg-paper p-4 text-sm font-semibold text-slate-500">{emptyText}</p>}
    </div>
  </Card>
);

const WardenDashboard = () => {
  const { user } = useAuth();
  const wardens = useMemo(loadWardens, []);
  const [residents, setResidents] = useState(loadResidents);
  const { beds } = useLiveAvailability();
  const [bookings, setBookings] = useState(loadBookings);
  const { payments } = useLivePayments();
  const [complaints, setComplaints] = useState(loadComplaints);

  useEffect(() => {
    const refreshResidents = () => setResidents(loadResidents());
    const refreshBookings = () => setBookings(loadBookings());
    const refreshComplaints = () => setComplaints(loadComplaints());
    window.addEventListener("pg:residents-updated", refreshResidents);
    window.addEventListener("pg:bookings-updated", refreshBookings);
    window.addEventListener("pg:complaints-updated", refreshComplaints);
    window.addEventListener("storage", refreshResidents);
    window.addEventListener("storage", refreshBookings);
    window.addEventListener("storage", refreshComplaints);
    return () => {
      window.removeEventListener("pg:residents-updated", refreshResidents);
      window.removeEventListener("pg:bookings-updated", refreshBookings);
      window.removeEventListener("pg:complaints-updated", refreshComplaints);
      window.removeEventListener("storage", refreshResidents);
      window.removeEventListener("storage", refreshBookings);
      window.removeEventListener("storage", refreshComplaints);
    };
  }, []);

  const assignedWarden = wardens.find((warden) => warden.email === user?.email || `${warden.firstName} ${warden.lastName}` === user?.name);
  const assignedBranch = wardenBranchByUser[user?.id] || assignedWarden?.branchName || "Anna Nagar";
  const wardenName = assignedWarden ? `${assignedWarden.firstName} ${assignedWarden.lastName}` : user?.name || "Warden";

  const branchResidents = residents.filter((resident) => resident.branchName === assignedBranch);
  const branchBeds = beds.filter((bed) => bed.branchName === assignedBranch);
  const branchBookings = bookings.filter((booking) => booking.branchName === assignedBranch);
  const branchPayments = payments.filter((payment) => payment.branchName === assignedBranch);
  const branchComplaints = complaints.filter((complaint) => complaint.branchName === assignedBranch);

  const activeResidents = branchResidents.filter((resident) => resident.status === "Active");
  const occupiedBeds = branchBeds.filter((bed) => bed.status === "Occupied");
  const availableBeds = branchBeds.filter((bed) => bed.status === "Available");
  const pendingCheckIns = branchBookings.filter((booking) => ["Approved", "Assigned to Warden"].includes(booking.bookingStatus));
  const todaysCheckOuts = branchResidents.filter((resident) => resident.expectedVacateDate === today || resident.status === "Vacating");
  const pendingComplaints = branchComplaints.filter((complaint) => !["Resolved", "Closed"].includes(complaint.status));
  const todaysRentCollection = branchPayments
    .filter((payment) => payment.paymentDate === today && payment.paymentStatus === "Paid")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const quickActions = [
    ["View Today's Bookings", "/pgbooking/warden/residents", CalendarCheck],
    ["Allocate Bed", "/pgbooking/warden/occupancy", BedDouble],
    ["Check-In Resident", "/pgbooking/warden/residents", UserCheck],
    ["Check-Out Resident", "/pgbooking/warden/residents", LogOut],
    ["Collect Rent", "/pgbooking/warden/payments", IndianRupee],
    ["View Complaints", "/pgbooking/warden/complaints", MessageSquareWarning]
  ];

  const recentCheckIns = branchResidents
    .filter((resident) => resident.moveInDate <= today && resident.status === "Active")
    .slice(0, 4)
    .map((resident) => ({ primary: resident.fullName, meta: `Room ${resident.roomNumber} · ${resident.bedName} · ${formatDate(resident.moveInDate)}` }));

  const recentCheckOuts = branchResidents
    .filter((resident) => resident.status === "Checked Out" || resident.status === "Vacating")
    .slice(0, 4)
    .map((resident) => ({ primary: resident.fullName, meta: `Room ${resident.roomNumber} · Expected ${formatDate(resident.expectedVacateDate)}` }));

  const recentRentCollections = branchPayments
    .filter((payment) => payment.paymentStatus === "Paid")
    .slice(0, 4)
    .map((payment) => ({ primary: `${payment.residentName} · ${formatCurrency(payment.amount)}`, meta: `${payment.paymentType} · ${formatDate(payment.paymentDate)}` }));

  const todaysMoveIns = branchBookings.filter((booking) => booking.moveInDate === today);
  const todaysMoveOuts = branchResidents.filter((resident) => resident.expectedVacateDate === today);
  const pendingRentPayments = branchPayments.filter((payment) => ["Pending", "Overdue"].includes(payment.paymentStatus));
  const recentBookings = branchBookings.slice(0, 10);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-brand">
              <UserCheck className="h-4 w-4" />
              Warden Dashboard
            </p>
            <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">Welcome, {wardenName}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary sm:text-base">Manage your assigned branch efficiently.</p>
          </div>
          <div className="rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm font-semibold text-brand">
            Assigned Branch: {assignedBranch}
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assigned Branch" value={assignedBranch} />
        <StatCard label="Total Residents" value={activeResidents.length} />
        <StatCard label="Occupied Beds" value={occupiedBeds.length} />
        <StatCard label="Available Beds" value={availableBeds.length} />
        <StatCard label="Pending Check-Ins" value={pendingCheckIns.length} />
        <StatCard label="Today's Check-Outs" value={todaysCheckOuts.length} />
        <StatCard label="Pending Complaints" value={pendingComplaints.length} />
        <StatCard label="Today's Rent Collection" value={formatCurrency(todaysRentCollection)} />
      </div>

      <Card>
        <h2 className="text-lg font-bold text-ink">Quick Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {quickActions.map(([label, to, Icon]) => (
            <Link key={label} to={to} className="flex min-h-24 flex-col justify-between rounded-xl border border-line bg-white p-4 text-sm font-bold text-ink transition hover:border-brandDark hover:text-brandDark">
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        <ActivityList title="Recent Check-Ins" items={recentCheckIns} emptyText="No recent check-ins for this branch." />
        <ActivityList title="Recent Check-Outs" items={recentCheckOuts} emptyText="No recent check-outs for this branch." />
        <ActivityList title="Recent Rent Collections" items={recentRentCollections} emptyText="No recent rent collections for this branch." />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <ActivityList
          title="Today's Move-Ins"
          items={todaysMoveIns.map((booking) => ({ primary: booking.customerName, meta: `Room ${booking.roomNumber} · ${booking.bedName}` }))}
          emptyText="No move-ins scheduled today."
        />
        <ActivityList
          title="Today's Move-Outs"
          items={todaysMoveOuts.map((resident) => ({ primary: resident.fullName, meta: `Room ${resident.roomNumber} · ${resident.bedName}` }))}
          emptyText="No move-outs scheduled today."
        />
        <ActivityList
          title="Pending Rent Payments"
          items={pendingRentPayments.map((payment) => ({ primary: payment.residentName, meta: `${formatCurrency(payment.amount)} · ${payment.paymentStatus}` }))}
          emptyText="No pending rent payments for this branch."
        />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-3 border-b border-line p-5">
          <CalendarCheck className="h-5 w-5 text-brand" />
          <h2 className="text-lg font-bold text-ink">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-line bg-slate-50 text-slate-500">
              <tr>
                {["Booking ID", "Resident", "Room", "Bed", "Move-In Date", "Status", "Actions"].map((column) => (
                  <th key={column} className="px-4 py-3 font-semibold">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-bold text-ink">{booking.id}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{booking.customerName}</td>
                  <td className="px-4 py-3 text-slate-600">{booking.roomNumber}</td>
                  <td className="px-4 py-3 text-slate-600">{booking.bedName}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(booking.moveInDate)}</td>
                  <td className="px-4 py-3"><StatusBadge status={booking.bookingStatus} /></td>
                  <td className="px-4 py-3">
                    <Link to="/pgbooking/warden/residents" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line px-4 text-sm font-bold text-ink transition hover:border-brandDark hover:text-brandDark">
                      <DoorOpen className="h-4 w-4" /> Manage
                    </Link>
                  </td>
                </tr>
              ))}
              {!recentBookings.length && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No recent bookings for this branch.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="border-brand/30 bg-brand/5">
        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-ink">
          <CheckCircle2 className="h-4 w-4 text-brand" />
          This dashboard is scoped to {assignedBranch}. Other branch data, reports, branch management, room management, bed management, and settings are not shown.
        </div>
      </Card>
    </div>
  );
};

export default WardenDashboard;
