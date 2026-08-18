import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import { loadBranches } from "../../data/adminBranches";
import { loadBookings } from "../../data/adminBookings";
import { loadResidents } from "../../data/adminResidents";
import { loadComplaints } from "../../data/complaints";
import { loadWardenActivities } from "../../data/wardenActivities";
import { loadStatusUpdateRequests } from "../../data/statusUpdateRequests";
import { useLiveAvailability } from "../../lib/liveAvailability";
import { calculatePaymentAnalytics, formatCurrency, useLivePayments } from "../../lib/livePayments";

const AdminDashboard = () => {
  const [summary, setSummary] = useState({});
  const [bookings, setBookings] = useState(() => loadBookings());
  const [complaints, setComplaints] = useState(() => loadComplaints());
  const [wardenActivities, setWardenActivities] = useState(() => loadWardenActivities());
  const [updateRequests, setUpdateRequests] = useState(() => loadStatusUpdateRequests());
  const { rooms } = useLiveAvailability();
  const { payments, notifications } = useLivePayments();
  const residents = loadResidents();
  const paymentAnalytics = calculatePaymentAnalytics(payments, residents);
  const pendingBookings = bookings.filter((booking) => booking.bookingStatus === "Pending Approval");
  const blockedBedNotifications = pendingBookings.slice(0, 5);
  const wardenComplaintNotifications = complaints.filter((complaint) => complaint.raisedBy === "Warden" && complaint.status === "Open").slice(0, 5);
  const pendingUpdateRequests = updateRequests.filter((request) => request.status === "Pending Approval");
  const requestedAgo = (value) => {
    const minutes = Math.max(0, Math.floor((Date.now() - new Date(value || Date.now()).getTime()) / 60000));
    if (minutes < 1) return "just now";
    if (minutes === 1) return "1 minute ago";
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  };

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
    window.addEventListener("pg:bookings-updated", refreshBookings);

    return () => {
      window.removeEventListener("focus", refreshBookings);
      window.removeEventListener("storage", refreshBookings);
      window.removeEventListener("pg:bookings-updated", refreshBookings);
    };
  }, []);

  useEffect(() => {
    const refreshComplaints = () => setComplaints(loadComplaints());
    const refreshActivities = () => setWardenActivities(loadWardenActivities());
    const refreshUpdateRequests = () => setUpdateRequests(loadStatusUpdateRequests());
    window.addEventListener("pg:complaints-updated", refreshComplaints);
    window.addEventListener("pg:warden-activities-updated", refreshActivities);
    window.addEventListener("storage", refreshComplaints);
    window.addEventListener("storage", refreshActivities);
    window.addEventListener("pg:status-update-requests-updated", refreshUpdateRequests);
    window.addEventListener("storage", refreshUpdateRequests);
    return () => {
      window.removeEventListener("pg:complaints-updated", refreshComplaints);
      window.removeEventListener("pg:warden-activities-updated", refreshActivities);
      window.removeEventListener("storage", refreshComplaints);
      window.removeEventListener("storage", refreshActivities);
      window.removeEventListener("pg:status-update-requests-updated", refreshUpdateRequests);
      window.removeEventListener("storage", refreshUpdateRequests);
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Branches" value={summary.branches ?? 0} />
        <StatCard label="Total beds" value={summary.totalBeds ?? 0} />
        <StatCard label="Occupancy" value={`${summary.occupancyRate ?? 0}%`} helper={`${summary.bookedBeds ?? 0} booked beds`} />
        <StatCard label="Revenue" value={`₹${summary.revenue ?? 0}`} />
        <StatCard label="Pending Approval" value={pendingBookings.length} />
        <StatCard label="Pending Update Requests" value={pendingUpdateRequests.length} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Monthly Revenue" value={formatCurrency(paymentAnalytics.monthlyRevenue)} />
        <StatCard label="Today's Collection" value={formatCurrency(paymentAnalytics.todayCollection)} />
        <StatCard label="Pending Rent" value={formatCurrency(paymentAnalytics.pendingRent)} />
        <StatCard label="Overdue Payments" value={formatCurrency(paymentAnalytics.overduePayments)} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open Complaints" value={complaints.filter((item) => item.status === "Open").length} />
        <StatCard label="In Progress" value={complaints.filter((item) => item.status === "In Progress").length} />
        <StatCard label="Resolved" value={complaints.filter((item) => item.status === "Resolved").length} />
        <StatCard label="Closed" value={complaints.filter((item) => item.status === "Closed").length} />
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
        <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400">🔔 New Bed Block Request</p><h2 className="mt-1 text-lg font-bold text-ink">Pending Approval Notifications</h2></div><span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">{pendingBookings.length}</span></div>
        <div className="mt-4 grid gap-3">
          {blockedBedNotifications.map((booking) => (
            <div key={booking.id} className="grid gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm sm:grid-cols-2 lg:grid-cols-3 dark:border-orange-500/30 dark:bg-orange-500/15">
              <p><span className="block text-xs font-bold uppercase text-slate-500">Resident</span><strong className="text-ink">{booking.customerName}</strong></p>
              <p><span className="block text-xs font-bold uppercase text-slate-500">Mobile</span><strong className="text-ink">{booking.phone}</strong></p>
              <p><span className="block text-xs font-bold uppercase text-slate-500">Branch</span><strong className="text-ink">{booking.branchName}</strong></p>
              <p><span className="block text-xs font-bold uppercase text-slate-500">Room</span><strong className="text-ink">{booking.roomNumber}</strong></p>
              <p><span className="block text-xs font-bold uppercase text-slate-500">Bed</span><strong className="text-ink">{booking.bedName}</strong></p>
              <p><span className="block text-xs font-bold uppercase text-slate-500">Requested</span><strong className="text-ink">{requestedAgo(booking.blockedAt)}</strong></p>
              <p className="sm:col-span-2 lg:col-span-3"><span className="block text-xs font-bold uppercase text-slate-500">Status</span><strong className="text-orange-700 dark:text-orange-400">Pending Approval</strong></p>
            </div>
          ))}
          {!blockedBedNotifications.length && <p className="rounded-xl bg-paper p-4 text-sm font-semibold text-slate-500">No blocked bed notifications yet.</p>}
        </div>
      </Card>

      <Card className="mt-5">
        <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400">🔔 New Room/Bed Update Request</p><h2 className="mt-1 text-lg font-bold text-ink">Pending Warden Requests</h2></div><span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">{pendingUpdateRequests.length}</span></div>
        <div className="mt-4 grid gap-3">
          {pendingUpdateRequests.slice(0, 5).map((request) => <div key={request.id} className="grid gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4 dark:border-orange-500/30 dark:bg-orange-500/15"><p><span className="block text-xs font-bold uppercase text-slate-500">Branch</span><strong>{request.branchName}</strong></p><p><span className="block text-xs font-bold uppercase text-slate-500">Room / Bed</span><strong>{request.roomNumber} · {request.bedName}</strong></p><p><span className="block text-xs font-bold uppercase text-slate-500">Current Status</span><strong>{request.currentStatus}</strong></p><p><span className="block text-xs font-bold uppercase text-slate-500">Requested Status</span><strong className="text-orange-700 dark:text-orange-400">{request.requestedStatus}</strong></p><p><span className="block text-xs font-bold uppercase text-slate-500">Updated By</span><strong>{request.wardenName}</strong></p><p><span className="block text-xs font-bold uppercase text-slate-500">Time</span><strong>{new Date(request.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</strong></p><p className="sm:col-span-2"><span className="block text-xs font-bold uppercase text-slate-500">Status</span><strong className="text-orange-700 dark:text-orange-400">Pending Approval</strong></p></div>)}
          {!pendingUpdateRequests.length && <p className="rounded-xl bg-paper p-4 text-sm font-semibold text-slate-500">No pending room or bed update requests.</p>}
        </div>
      </Card>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-widest text-brand">🔔 New Complaint</p><h2 className="mt-1 text-lg font-bold text-ink">Warden Notifications</h2></div>
            <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">{wardenComplaintNotifications.length}</span>
          </div>
          <div className="mt-4 space-y-3">
            {wardenComplaintNotifications.map((complaint) => (
              <div key={complaint.id} className="rounded-xl border border-brand/20 bg-brand/5 p-4 text-sm">
                <p className="font-bold text-ink">{complaint.title}</p>
                <p className="mt-2 text-slate-600">{complaint.branchName} · Raised by Warden</p>
                <p className="mt-1 text-slate-600">{complaint.category} · <strong className="text-brand">{complaint.priority}</strong> · {complaint.status}</p>
              </div>
            ))}
            {!wardenComplaintNotifications.length && <p className="rounded-xl bg-paper p-4 text-sm font-semibold text-slate-500">No new Warden complaints.</p>}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-ink">Warden Activity Log</h2>
          <div className="mt-4 space-y-3">
            {wardenActivities.slice(0, 8).map((activity) => (
              <div key={activity.id} className="rounded-xl bg-paper p-4 text-sm">
                <div className="flex flex-wrap justify-between gap-2"><strong className="text-ink">{activity.wardenName} ({activity.branchName})</strong><span className="text-slate-500">{new Date(activity.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span></div>
                <p className="mt-2 font-semibold text-brand">{activity.action}</p>
                <p className="mt-1 text-slate-600">{activity.residentName ? `${activity.residentName} · ` : ""}{activity.roomNumber ? `Room ${activity.roomNumber}` : ""}{activity.bedName ? ` · ${activity.bedName}` : ""}</p>
              </div>
            ))}
            {!wardenActivities.length && <p className="rounded-xl bg-paper p-4 text-sm font-semibold text-slate-500">Warden check-in, check-out, room, and bed updates will appear here.</p>}
          </div>
        </Card>
      </div>

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
