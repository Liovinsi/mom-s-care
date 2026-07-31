import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import { loadBranches } from "../../data/adminBranches";
import { loadBookings } from "../../data/adminBookings";
import { loadResidents } from "../../data/adminResidents";
import { useLiveAvailability } from "../../lib/liveAvailability";
import { calculatePaymentAnalytics, formatCurrency, useLivePayments } from "../../lib/livePayments";

const AdminDashboard = () => {
  const [summary, setSummary] = useState({});
  const [bookings, setBookings] = useState(() => loadBookings());
  const { rooms } = useLiveAvailability();
  const { payments, notifications } = useLivePayments();
  const residents = loadResidents();
  const paymentAnalytics = calculatePaymentAnalytics(payments, residents);
  const blockedBedNotifications = bookings.filter((booking) => booking.bookingStatus === "Pending").slice(0, 5);

  useEffect(() => {
    const branches = loadBranches();
    const totalBeds = rooms.reduce((sum, room) => sum + Number(room.totalBeds || room.beds || 0), 0);
    const bookedBeds = rooms.reduce((sum, room) => sum + Number(room.occupiedBeds || 0), 0);
    const fallbackSummary = {
      branches: branches.length,
      totalBeds,
      bookedBeds,
      occupancyRate: totalBeds ? Math.round((bookedBeds / totalBeds) * 100) : 0,
      revenue: paymentAnalytics.monthlyRevenue
    };

    setSummary(fallbackSummary);
  }, [paymentAnalytics.monthlyRevenue, rooms]);

  useEffect(() => {
    const refreshBookings = () => setBookings(loadBookings());

    window.addEventListener("focus", refreshBookings);
    window.addEventListener("storage", refreshBookings);

    return () => {
      window.removeEventListener("focus", refreshBookings);
      window.removeEventListener("storage", refreshBookings);
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Branches" value={summary.branches ?? 0} />
        <StatCard label="Total beds" value={summary.totalBeds ?? 0} />
        <StatCard label="Occupancy" value={`${summary.occupancyRate ?? 0}%`} helper={`${summary.bookedBeds ?? 0} booked beds`} />
        <StatCard label="Revenue" value={`₹${summary.revenue ?? 0}`} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Monthly Revenue" value={formatCurrency(paymentAnalytics.monthlyRevenue)} />
        <StatCard label="Today's Collection" value={formatCurrency(paymentAnalytics.todayCollection)} />
        <StatCard label="Pending Rent" value={formatCurrency(paymentAnalytics.pendingRent)} />
        <StatCard label="Overdue Payments" value={formatCurrency(paymentAnalytics.overduePayments)} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        {[
          ["Monthly Revenue Chart", paymentAnalytics.monthlyRevenue, paymentAnalytics.expectedCollection],
          ["Occupancy Chart", rooms.filter((room) => room.overallAvailability === "Not Available").length, rooms.length || 1],
          ["Payment Status Chart", payments.filter((payment) => payment.paymentStatus === "Paid").length, payments.length || 1]
        ].map(([title, value, max]) => {
          const percent = Math.min(100, Math.round((Number(value || 0) / Number(max || 1)) * 100));
          return (
            <Card key={title}>
              <h2 className="text-lg font-bold text-ink">{title}</h2>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-paper">
                <div className="h-full rounded-full bg-brand" style={{ width: `${percent}%` }} />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-600">{percent}%</p>
            </Card>
          );
        })}
      </div>

      <Card className="mt-5 overflow-x-auto p-0">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-slate-500">
            <tr>
              {["Room Number", "Total Beds", "Available Beds", "Occupied Beds", "Reserved Beds", "Maintenance Beds", "Overall Availability"].map((heading) => (
                <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-bold text-ink">Room {room.roomNumber}</td>
                <td className="px-4 py-3 font-semibold">{room.totalBeds}</td>
                <td className="px-4 py-3 font-semibold text-success">{room.availableBeds}</td>
                <td className="px-4 py-3 font-semibold">{room.occupiedBeds}</td>
                <td className="px-4 py-3 font-semibold">{room.reservedBeds}</td>
                <td className="px-4 py-3 font-semibold">{room.maintenanceBeds}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${room.overallAvailability === "Available" ? "bg-brand/10 text-brandDark" : "bg-slate-100 text-slate-600"}`}>{room.overallAvailability}</span>
                </td>
              </tr>
            ))}
            {!rooms.length && (
              <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-500">No room availability data yet.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card className="mt-5">
        <h2 className="text-lg font-bold text-ink">Blocked Bed Notifications</h2>
        <div className="mt-4 grid gap-3">
          {blockedBedNotifications.map((booking) => (
            <div key={booking.id} className="rounded-xl border border-brand/20 bg-brand/10 p-3 text-sm">
              <p className="font-semibold text-ink">{booking.customerName} blocked {booking.bedName}</p>
              <p className="mt-1 text-slate-600">{booking.phone} · {booking.branchName} · Room {booking.roomNumber}</p>
            </div>
          ))}
          {!blockedBedNotifications.length && <p className="rounded-xl bg-paper p-4 text-sm font-semibold text-slate-500">No blocked bed notifications yet.</p>}
        </div>
      </Card>

      <Card className="mt-5">
        <h2 className="text-lg font-bold text-ink">Payment Notifications</h2>
        <div className="mt-4 grid gap-3">
          {notifications.slice(0, 5).map((notification) => (
            <div key={notification.id} className="rounded-xl bg-paper p-3 text-sm">
              <p className="font-semibold text-ink">{notification.message}</p>
              <p className="mt-1 text-slate-500">{notification.branchName} · {notification.createdAt}</p>
            </div>
          ))}
          {!notifications.length && <p className="rounded-xl bg-paper p-4 text-sm font-semibold text-slate-500">No payment notifications yet.</p>}
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
