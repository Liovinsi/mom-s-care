import { Download, Eye, FileText, Printer, Search, ShieldCheck, UserCheck, X, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import { AREAS } from "../../data/adminBranches";
import { BOOKING_ACTION_STATUSES, PAYMENT_STATUSES, REJECTION_REASONS, defaultWardens, loadBookings, saveBookings } from "../../data/adminBookings";
import { loadBeds } from "../../data/adminBeds";
import { loadRooms } from "../../data/adminRooms";
import { saveAvailabilitySnapshot } from "../../lib/liveAvailability";

const rowsPerPage = 10;
const fieldClass = "min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15";
const activeBookingStatuses = ["Approved", "Assigned to Warden", "Checked In"];

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700",
  Approved: "bg-emerald-50 text-emerald-700",
  "Assigned to Warden": "bg-gold/10 text-gold",
  Rejected: "bg-red-50 text-red-700",
  Cancelled: "bg-slate-100 text-slate-600",
  "Checked In": "bg-blue-50 text-blue-700"
};

const paymentStyles = {
  Paid: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Refunded: "bg-slate-100 text-slate-600"
};

const Badge = ({ value, styles }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles[value] || "bg-slate-100 text-slate-600"}`}>{value}</span>
);

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const isWithinDateRange = (dateValue, range) => {
  if (range === "Custom") return true;
  const date = new Date(`${dateValue}T00:00:00`);
  const today = new Date("2026-07-18T00:00:00");
  if (range === "Today") return date.toDateString() === today.toDateString();
  if (range === "This Week") {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    return date >= weekStart && date <= today;
  }
  if (range === "This Month") return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
  return true;
};

const DetailGrid = ({ items }) => (
  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
    {items.map(([label, value]) => (
      <p key={label}><span className="font-semibold text-ink">{label}:</span> {value || "-"}</p>
    ))}
  </div>
);

const DocumentPreview = ({ label, src }) => (
  <div>
    <img src={src} alt={label} className="h-40 w-full rounded-2xl border border-line object-cover" />
    <div className="mt-2 flex items-center justify-between gap-2">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <a href={src} download className="text-xs font-bold text-gold hover:underline">Download</a>
    </div>
  </div>
);

const updateBedForBooking = (beds, booking, nextBookingStatus) =>
  beds.map((bed) => {
    if (bed.id !== booking.bedId) return bed;
    if (nextBookingStatus === "Checked In") {
      return {
        ...bed,
        status: "Occupied",
        currentResident: booking.customerName,
        bookingId: booking.id,
        checkInDate: booking.moveInDate,
        checkOutDate: ""
      };
    }
    if (["Approved", "Assigned to Warden"].includes(nextBookingStatus)) {
      return {
        ...bed,
        status: "Reserved",
        currentResident: "",
        bookingId: booking.id,
        checkInDate: booking.moveInDate,
        checkOutDate: ""
      };
    }
    if (["Rejected", "Cancelled"].includes(nextBookingStatus)) {
      return {
        ...bed,
        status: "Available",
        currentResident: "",
        bookingId: "",
        checkInDate: "",
        checkOutDate: ""
      };
    }
    return bed;
  });

const syncBedsWithBookings = (beds, bookings) =>
  beds.map((bed) => {
    const activeBooking = bookings.find((booking) => booking.bedId === bed.id && activeBookingStatuses.includes(booking.bookingStatus));
    if (activeBooking) return updateBedForBooking([bed], activeBooking, activeBooking.bookingStatus)[0];

    const releasedBooking = bookings.find((booking) => booking.bedId === bed.id && ["Rejected", "Cancelled"].includes(booking.bookingStatus));
    if (releasedBooking) return updateBedForBooking([bed], releasedBooking, releasedBooking.bookingStatus)[0];

    return bed;
  });

const canApproveBooking = (bookings, booking) =>
  !bookings.some((item) => item.id !== booking.id && item.bedId === booking.bedId && activeBookingStatuses.includes(item.bookingStatus));

const ApprovalDialog = ({ booking, onClose, onApprove }) => (
  <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/40 px-4">
    <Card className="w-full max-w-md">
      <h2 className="text-xl font-bold text-ink">Approve this booking?</h2>
      <p className="mt-2 text-sm text-slate-600">The selected bed will be marked as reserved for this booking.</p>
      <p className="mt-4 rounded-xl bg-paper p-3 text-sm font-semibold text-ink">{booking.id} · {booking.customerName} · {booking.bedName}</p>
      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="button" onClick={() => onApprove(booking)}>Approve</Button>
      </div>
    </Card>
  </div>
);

const RejectDialog = ({ booking, onClose, onReject }) => {
  const [reason, setReason] = useState(REJECTION_REASONS[0]);
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/40 px-4">
      <Card className="w-full max-w-md">
        <h2 className="text-xl font-bold text-ink">Reject Booking</h2>
        <p className="mt-2 text-sm text-slate-600">Choose a reason before rejecting this booking.</p>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-semibold text-ink">Reason</span>
          <select className={fieldClass} value={reason} onChange={(event) => setReason(event.target.value)}>
            {REJECTION_REASONS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <div className="mt-5 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="button" variant="danger" onClick={() => onReject(booking, reason)}>Reject Booking</Button>
        </div>
      </Card>
    </div>
  );
};

const AssignWardenDialog = ({ booking, onClose, onAssign }) => {
  const branchWardens = defaultWardens.filter((warden) => warden.branchId === booking.branchId);
  const [wardenId, setWardenId] = useState(branchWardens[0]?.id || "");
  const selectedWarden = branchWardens.find((warden) => warden.id === wardenId);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/40 px-4">
      <Card className="w-full max-w-md">
        <h2 className="text-xl font-bold text-ink">Assign Warden</h2>
        <p className="mt-2 text-sm text-slate-600">Only wardens from {booking.branchName} are available.</p>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-semibold text-ink">Select Warden</span>
          <select className={fieldClass} value={wardenId} onChange={(event) => setWardenId(event.target.value)}>
            {branchWardens.map((warden) => <option key={warden.id} value={warden.id}>{warden.name}</option>)}
          </select>
        </label>
        <div className="mt-5 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="button" disabled={!selectedWarden} onClick={() => onAssign(booking, selectedWarden)}>Assign Warden</Button>
        </div>
      </Card>
    </div>
  );
};

const BookingViewModal = ({ booking, onClose }) => (
  <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/40 px-4 py-8">
    <Card className="w-full max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-ink">{booking.id}</h2>
          <p className="text-sm text-slate-500">{booking.customerName} · {booking.branchName} · Room {booking.roomNumber}</p>
        </div>
        <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:border-gold hover:text-gold" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-bold text-ink">Customer Details</h3>
          <DetailGrid items={[
            ["Full Name", booking.customerName],
            ["Gender", booking.gender],
            ["DOB", formatDate(booking.dob)],
            ["Phone", booking.phone],
            ["Email", booking.email],
            ["Emergency Contact", booking.emergencyContact],
            ["Occupation", booking.occupation],
            ["Company / College", booking.organization]
          ]} />
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-ink">Booking Details</h3>
          <DetailGrid items={[
            ["Booking ID", booking.id],
            ["Branch", booking.branchName],
            ["Room", `Room ${booking.roomNumber}`],
            ["Bed", booking.bedName],
            ["Sharing Type", booking.sharingType],
            ["Room Type", booking.roomType],
            ["Move-in Date", formatDate(booking.moveInDate)],
            ["Expected Stay", booking.expectedStay],
            ["Assigned Warden", booking.assignedWardenName]
          ]} />
        </Card>
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-ink">Identity Details</h3>
            <a href={booking.aadhaarFront} download className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-gold hover:text-gold">
              <Download className="h-4 w-4" /> Download Documents
            </a>
          </div>
          <p className="mt-4 text-sm text-slate-600"><span className="font-semibold text-ink">Aadhaar Number:</span> {booking.aadhaarNumber}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <DocumentPreview label="Aadhaar Front" src={booking.aadhaarFront} />
            <DocumentPreview label="Aadhaar Back" src={booking.aadhaarBack} />
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-ink">Payment Details</h3>
          <DetailGrid items={[
            ["Token Amount", formatCurrency(booking.tokenAmount)],
            ["Transaction ID", booking.transactionId],
            ["Payment Method", booking.paymentMethod],
            ["Payment Date", formatDate(booking.paymentDate)],
            ["Payment Status", booking.paymentStatus]
          ]} />
          <div className="mt-4">
            <DocumentPreview label="Payment Screenshot" src={booking.paymentScreenshot} />
          </div>
        </Card>
      </div>
    </Card>
  </div>
);

const printReceipt = (booking) => {
  const receipt = window.open("", "_blank", "width=840,height=900");
  if (!receipt) return;
  receipt.document.write(`
    <html>
      <head>
        <title>Booking Receipt ${booking.id}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #1E1E24; padding: 32px; }
          h1 { color: #D4AF37; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          td { border: 1px solid #E5E5E5; padding: 12px; }
          .label { font-weight: 700; background: #F8F8F8; width: 34%; }
        </style>
      </head>
      <body>
        <h1>PGStay Booking Receipt</h1>
        <p>Booking ID: ${booking.id}</p>
        <table>
          <tr><td class="label">Customer</td><td>${booking.customerName}</td></tr>
          <tr><td class="label">Phone</td><td>${booking.phone}</td></tr>
          <tr><td class="label">Branch</td><td>${booking.branchName}</td></tr>
          <tr><td class="label">Room</td><td>Room ${booking.roomNumber}</td></tr>
          <tr><td class="label">Bed</td><td>${booking.bedName}</td></tr>
          <tr><td class="label">Move-in Date</td><td>${formatDate(booking.moveInDate)}</td></tr>
          <tr><td class="label">Token Amount</td><td>${formatCurrency(booking.tokenAmount)}</td></tr>
          <tr><td class="label">Payment Status</td><td>${booking.paymentStatus}</td></tr>
          <tr><td class="label">Booking Status</td><td>${booking.bookingStatus}</td></tr>
        </table>
      </body>
    </html>
  `);
  receipt.document.close();
  receipt.focus();
  receipt.print();
};

const BookingsPage = () => {
  const rooms = useMemo(loadRooms, []);
  const [bookings, setBookings] = useState(loadBookings);
  const [beds, setBeds] = useState(loadBeds);
  const [viewBooking, setViewBooking] = useState(null);
  const [approveBooking, setApproveBooking] = useState(null);
  const [rejectBooking, setRejectBooking] = useState(null);
  const [assignBooking, setAssignBooking] = useState(null);
  const [workflowError, setWorkflowError] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", branch: "All Branches", status: "All", paymentStatus: "All", dateRange: "This Month" });

  useEffect(() => {
    const syncedBeds = syncBedsWithBookings(loadBeds(), bookings);
    setBeds(syncedBeds);
    saveAvailabilitySnapshot(syncedBeds, rooms);
  }, [bookings, rooms]);

  const persistBookings = (nextBookings) => {
    setBookings(nextBookings);
    saveBookings(nextBookings);
  };

  const persistBeds = (nextBeds) => {
    setBeds(nextBeds);
    saveAvailabilitySnapshot(nextBeds, rooms);
  };

  const stats = useMemo(() => ({
    totalBookings: bookings.length,
    pendingApproval: bookings.filter((booking) => booking.bookingStatus === "Pending").length,
    approved: bookings.filter((booking) => ["Approved", "Assigned to Warden"].includes(booking.bookingStatus)).length,
    rejected: bookings.filter((booking) => booking.bookingStatus === "Rejected").length,
    checkedIn: bookings.filter((booking) => booking.bookingStatus === "Checked In").length,
    cancelled: bookings.filter((booking) => booking.bookingStatus === "Cancelled").length
  }), [bookings]);

  const filteredBookings = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return bookings.filter((booking) => {
      const matchesSearch = !query || [booking.id, booking.customerName, booking.phone].some((value) => value.toLowerCase().includes(query));
      const matchesBranch = filters.branch === "All Branches" || booking.branchName === filters.branch;
      const matchesStatus = filters.status === "All" || booking.bookingStatus === filters.status;
      const matchesPayment = filters.paymentStatus === "All" || booking.paymentStatus === filters.paymentStatus;
      const matchesDate = isWithinDateRange(booking.bookingDate, filters.dateRange);
      return matchesSearch && matchesBranch && matchesStatus && matchesPayment && matchesDate;
    });
  }, [bookings, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / rowsPerPage));
  const visibleBookings = filteredBookings.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ search: "", branch: "All Branches", status: "All", paymentStatus: "All", dateRange: "This Month" });
    setPage(1);
  };

  const applyStatusChange = (booking, nextStatus, extra = {}) => {
    const nextBooking = { ...booking, bookingStatus: nextStatus, ...extra };
    persistBookings(bookings.map((item) => (item.id === booking.id ? nextBooking : item)));
    persistBeds(updateBedForBooking(beds, nextBooking, nextStatus));
    return nextBooking;
  };

  const confirmApprove = (booking) => {
    if (!canApproveBooking(bookings, booking)) {
      setWorkflowError(`Bed ${booking.bedName} in Room ${booking.roomNumber} already has an active booking.`);
      setApproveBooking(null);
      return;
    }
    applyStatusChange(booking, "Approved", { rejectionReason: "" });
    setApproveBooking(null);
  };

  const confirmReject = (booking, reason) => {
    applyStatusChange(booking, "Rejected", { rejectionReason: reason, assignedWardenId: "", assignedWardenName: "" });
    setRejectBooking(null);
  };

  const confirmAssign = (booking, warden) => {
    applyStatusChange(booking, "Assigned to Warden", { assignedWardenId: warden.id, assignedWardenName: warden.name });
    setAssignBooking(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Bookings</h1>
          <p className="text-sm text-slate-500">Manage all customer bookings across every branch.</p>
        </div>
        <Button variant="secondary" onClick={() => window.print()}><Download className="h-4 w-4" /> Export</Button>
      </div>

      {workflowError && (
        <div className="mt-4 flex items-start justify-between gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
          <p>{workflowError}</p>
          <button type="button" onClick={() => setWorkflowError("")} aria-label="Dismiss workflow error"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Total Bookings" value={stats.totalBookings} />
        <StatCard label="Pending Approval" value={stats.pendingApproval} />
        <StatCard label="Approved" value={stats.approved} />
        <StatCard label="Rejected" value={stats.rejected} />
        <StatCard label="Checked In" value={stats.checkedIn} />
        <StatCard label="Cancelled" value={stats.cancelled} />
      </div>

      <Card className="mt-5">
        <div className="grid gap-3 xl:grid-cols-[1.3fr_repeat(4,1fr)_auto]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input className={`${fieldClass} pl-11`} placeholder="Search by booking ID, customer name, phone number" value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} />
          </label>
          <select aria-label="Branch" className={fieldClass} value={filters.branch} onChange={(event) => updateFilter("branch", event.target.value)}>
            {["All Branches", ...AREAS].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select aria-label="Status" className={fieldClass} value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
            {["All", ...BOOKING_ACTION_STATUSES].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select aria-label="Payment Status" className={fieldClass} value={filters.paymentStatus} onChange={(event) => updateFilter("paymentStatus", event.target.value)}>
            {["All", ...PAYMENT_STATUSES].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select aria-label="Date Range" className={fieldClass} value={filters.dateRange} onChange={(event) => updateFilter("dateRange", event.target.value)}>
            {["Today", "This Week", "This Month", "Custom"].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <Button type="button" variant="secondary" onClick={resetFilters}>Reset Filters</Button>
        </div>
      </Card>

      <Card className="mt-5 overflow-x-auto p-0">
        <table className="w-full min-w-[1280px] text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-slate-500">
            <tr>
              {["Booking ID", "Customer", "Branch", "Room", "Bed", "Booking Date", "Move-in Date", "Token Amount", "Payment Status", "Booking Status", "Actions"].map((heading) => (
                <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleBookings.map((booking) => (
              <tr key={booking.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-bold text-ink">{booking.id}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{booking.customerName}</p>
                  <p className="text-xs text-slate-500">{booking.phone}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{booking.branchName}</td>
                <td className="px-4 py-3 text-slate-600">Room {booking.roomNumber}</td>
                <td className="px-4 py-3 text-slate-600">{booking.bedName}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(booking.bookingDate)}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(booking.moveInDate)}</td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(booking.tokenAmount)}</td>
                <td className="px-4 py-3"><Badge value={booking.paymentStatus} styles={paymentStyles} /></td>
                <td className="px-4 py-3"><Badge value={booking.bookingStatus} styles={statusStyles} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setViewBooking(booking)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-gold hover:text-gold" aria-label="View booking">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setApproveBooking(booking)} disabled={!["Pending", "Rejected", "Cancelled"].includes(booking.bookingStatus)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40" aria-label="Approve booking">
                      <ShieldCheck className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setRejectBooking(booking)} disabled={["Rejected", "Cancelled", "Checked In"].includes(booking.bookingStatus)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-danger hover:border-danger hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Reject booking">
                      <XCircle className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setAssignBooking(booking)} disabled={!["Approved", "Assigned to Warden"].includes(booking.bookingStatus)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40" aria-label="Assign warden">
                      <UserCheck className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => printReceipt(booking)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-gold hover:text-gold" aria-label="Print booking">
                      <Printer className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!visibleBookings.length && (
              <tr><td colSpan="11" className="px-4 py-8 text-center text-slate-500">No bookings match the selected filters.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <p>Showing {visibleBookings.length} of {filteredBookings.length} bookings</p>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button>
          <span className="grid min-h-11 place-items-center rounded-xl border border-line px-4 font-semibold text-ink">{page} / {totalPages}</span>
          <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</Button>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500">
          {[["Pending", "Pending"], ["Approve", "Approved"], ["Assign to Warden", "Assigned to Warden"], ["Warden Receives Notification", "Assigned to Warden"], ["Resident Check-in", "Checked In"]].map(([label, status], index) => (
            <div key={`${label}-${index}`} className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[status]}`}>{label}</span>
              {index < 4 && <FileText className="h-4 w-4 text-gold" />}
            </div>
          ))}
        </div>
      </div>

      {viewBooking && <BookingViewModal booking={viewBooking} onClose={() => setViewBooking(null)} />}
      {approveBooking && <ApprovalDialog booking={approveBooking} onClose={() => setApproveBooking(null)} onApprove={confirmApprove} />}
      {rejectBooking && <RejectDialog booking={rejectBooking} onClose={() => setRejectBooking(null)} onReject={confirmReject} />}
      {assignBooking && <AssignWardenDialog booking={assignBooking} onClose={() => setAssignBooking(null)} onAssign={confirmAssign} />}
    </div>
  );
};

export default BookingsPage;
