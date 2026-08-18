import { Download, Eye, FileText, Plus, Printer, Search, ShieldCheck, UserCheck, X, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import { AREAS } from "../../data/adminBranches";
import { BOOKING_ACTION_STATUSES, PAYMENT_STATUSES, REJECTION_REASONS, defaultWardens, loadBookings, saveBookings } from "../../data/adminBookings";
import { loadBeds, saveBeds } from "../../data/adminBeds";
import { loadRooms } from "../../data/adminRooms";
import { loadResidents, saveResidents } from "../../data/adminResidents";
import { saveAvailabilitySnapshot } from "../../lib/liveAvailability";
import { digitsOnly, mobileInputProps, MOBILE_NUMBER_ERROR, MOBILE_NUMBER_REGEX } from "../../lib/mobileNumber";

const rowsPerPage = 10;
const fieldClass = "min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/25";
const activeBookingStatuses = ["Pending Approval", "Pending", "Approved", "Assigned to Warden", "Checked In"];

const statusStyles = {
  "Pending Approval": "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  Pending: "bg-brand/10 text-brandDark",
  Approved: "bg-brand/10 text-brandDark",
  "Assigned to Warden": "bg-brand/10 text-brand",
  Rejected: "bg-paper text-brandDark",
  Cancelled: "bg-slate-100 text-slate-600",
  "Checked In": "bg-brand/10 text-brandDark"
};

const paymentStyles = {
  Paid: "bg-brand/10 text-brandDark",
  Pending: "bg-brand/10 text-brandDark",
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
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
    {src ? (
      <>
        <img src={src} alt={label} className="h-40 w-full rounded-2xl border border-line object-cover" />
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
          <a href={src} download className="text-xs font-bold text-brand hover:underline">Download</a>
        </div>
      </>
    ) : (
      <div className="grid h-40 place-items-center rounded-2xl border border-line bg-paper px-4 text-center text-sm font-semibold text-slate-500">
        {label} not uploaded
      </div>
    )}
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
        checkOutDate: "",
        blockedUntil: ""
      };
    }
    if (nextBookingStatus === "Pending Approval") {
      return {
        ...bed,
        status: "Blocked",
        currentResident: "",
        bookingId: booking.id,
        blockedUntil: booking.blockedUntil || bed.blockedUntil,
        checkInDate: booking.moveInDate,
        checkOutDate: booking.checkOutDate || ""
      };
    }
    if (["Pending", "Approved", "Assigned to Warden"].includes(nextBookingStatus)) {
      return {
        ...bed,
        status: "Reserved",
        currentResident: "",
        bookingId: booking.id,
        checkInDate: booking.moveInDate,
        checkOutDate: "",
        blockedUntil: ""
      };
    }
    if (["Rejected", "Cancelled"].includes(nextBookingStatus)) {
      return {
        ...bed,
        status: "Available",
        currentResident: "",
        bookingId: "",
        checkInDate: "",
        checkOutDate: "",
        blockedUntil: ""
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

const todayValue = () => new Date().toISOString().slice(0, 10);

const createBookingId = (bookings) => {
  const maxId = bookings.reduce((value, booking) => Math.max(value, Number(String(booking.id).replace(/\D/g, "") || 0)), 0);
  return `BK${String(maxId + 1).padStart(4, "0")}`;
};

const DirectBookingDialog = ({ bookings, beds, rooms, onClose, onCreate }) => {
  const branchOptions = useMemo(
    () => [...new Map(rooms.map((room) => [room.branchId, { id: room.branchId, name: room.branchName }])).values()],
    [rooms]
  );
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    gender: "",
    occupation: "",
    organization: "",
    branchId: branchOptions[0]?.id || "",
    roomId: "",
    bedId: "",
    moveInDate: todayValue(),
    expectedStay: "12 Months",
    tokenAmount: "",
    notes: ""
  });
  const [errors, setErrors] = useState({});

  const branchRooms = rooms.filter((room) => room.branchId === form.branchId);
  const roomBeds = beds.filter((bed) => bed.roomId === form.roomId && bed.status === "Available");
  const selectedRoom = rooms.find((room) => room.id === form.roomId);
  const selectedBed = beds.find((bed) => bed.id === form.bedId);

  const update = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "branchId") {
        next.roomId = "";
        next.bedId = "";
        next.tokenAmount = "";
      }
      if (field === "roomId") {
        const room = rooms.find((item) => item.id === value);
        next.bedId = "";
        next.tokenAmount = room ? String(Math.min(5000, room.monthlyRent || 0)) : "";
      }
      return next;
    });
  };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.customerName.trim()) nextErrors.customerName = "Customer name is required";
    if (!MOBILE_NUMBER_REGEX.test(form.phone.trim())) nextErrors.phone = MOBILE_NUMBER_ERROR;
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = "Enter a valid email address";
    if (!form.branchId) nextErrors.branchId = "Branch is required";
    if (!form.roomId) nextErrors.roomId = "Room is required";
    if (!form.bedId) nextErrors.bedId = "Available bed is required";
    if (!form.moveInDate) nextErrors.moveInDate = "Move-in date is required";
    if (!Number(form.tokenAmount || 0) || Number(form.tokenAmount) < 0) nextErrors.tokenAmount = "Enter a valid token amount";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !selectedRoom || !selectedBed) return;

    onCreate({
      id: createBookingId(bookings),
      customerName: form.customerName.trim(),
      gender: form.gender,
      dob: "",
      phone: form.phone.trim(),
      email: form.email.trim(),
      emergencyContact: "",
      occupation: form.occupation,
      organization: form.organization,
      aadhaarNumber: "",
      aadhaarFront: "",
      aadhaarBack: "",
      branchId: selectedRoom.branchId,
      branchName: selectedRoom.branchName,
      roomId: selectedRoom.id,
      roomNumber: selectedRoom.roomNumber,
      bedId: selectedBed.id,
      bedName: selectedBed.bedName,
      sharingType: selectedRoom.sharingType,
      roomType: selectedRoom.roomType,
      bookingDate: todayValue(),
      moveInDate: form.moveInDate,
      expectedStay: form.expectedStay,
      tokenAmount: Number(form.tokenAmount || 0),
      transactionId: "",
      paymentMethod: "Manual",
      paymentDate: "",
      paymentScreenshot: "",
      paymentStatus: "Pending",
      bookingStatus: "Pending Approval",
      assignedWardenId: "",
      assignedWardenName: "",
      rejectionReason: "",
      notes: form.notes
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40">
      <form onSubmit={submit} className="h-full w-full max-w-3xl overflow-y-auto bg-white p-5 shadow-luxury">
        <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-5 flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <div>
            <h2 className="text-xl font-bold text-ink">Create Booking</h2>
            <p className="text-sm text-slate-500">Add walk-in or phone enquiry bookings directly.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:border-brandDark hover:text-brandDark" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Customer Name *</span>
            <input className={fieldClass} value={form.customerName} onChange={(event) => update("customerName", event.target.value)} />
            {errors.customerName && <span className="mt-1 block text-xs font-semibold text-danger">{errors.customerName}</span>}
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Mobile Number *</span>
            <input className={fieldClass} {...mobileInputProps} value={form.phone} onChange={(event) => update("phone", digitsOnly(event.target.value))} />
            {errors.phone && <span className="mt-1 block text-xs font-semibold text-danger">{errors.phone}</span>}
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Email</span>
            <input className={fieldClass} type="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
            {errors.email && <span className="mt-1 block text-xs font-semibold text-danger">{errors.email}</span>}
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Gender</span>
            <select className={fieldClass} value={form.gender} onChange={(event) => update("gender", event.target.value)}>
              <option value="">Select</option>
              {["Male", "Female", "Other"].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Occupation</span>
            <select className={fieldClass} value={form.occupation} onChange={(event) => update("occupation", event.target.value)}>
              <option value="">Select</option>
              {["Student", "Working Professional"].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Company / College</span>
            <input className={fieldClass} value={form.organization} onChange={(event) => update("organization", event.target.value)} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Branch *</span>
            <select className={fieldClass} value={form.branchId} onChange={(event) => update("branchId", event.target.value)}>
              {branchOptions.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>
            {errors.branchId && <span className="mt-1 block text-xs font-semibold text-danger">{errors.branchId}</span>}
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Room *</span>
            <select className={fieldClass} value={form.roomId} onChange={(event) => update("roomId", event.target.value)}>
              <option value="">Select room</option>
              {branchRooms.map((room) => <option key={room.id} value={room.id}>Room {room.roomNumber} · {room.sharingType} · {room.roomType}</option>)}
            </select>
            {errors.roomId && <span className="mt-1 block text-xs font-semibold text-danger">{errors.roomId}</span>}
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Available Bed *</span>
            <select className={fieldClass} value={form.bedId} onChange={(event) => update("bedId", event.target.value)} disabled={!form.roomId}>
              <option value="">Select bed</option>
              {roomBeds.map((bed) => <option key={bed.id} value={bed.id}>{bed.bedName}</option>)}
            </select>
            {form.roomId && !roomBeds.length && <span className="mt-1 block text-xs font-semibold text-danger">No available beds in this room</span>}
            {errors.bedId && <span className="mt-1 block text-xs font-semibold text-danger">{errors.bedId}</span>}
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Move-in Date *</span>
            <input className={fieldClass} type="date" value={form.moveInDate} onChange={(event) => update("moveInDate", event.target.value)} />
            {errors.moveInDate && <span className="mt-1 block text-xs font-semibold text-danger">{errors.moveInDate}</span>}
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Expected Stay</span>
            <input className={fieldClass} value={form.expectedStay} onChange={(event) => update("expectedStay", event.target.value)} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Token Amount *</span>
            <input className={fieldClass} type="number" min="0" value={form.tokenAmount} onChange={(event) => update("tokenAmount", event.target.value)} />
            {errors.tokenAmount && <span className="mt-1 block text-xs font-semibold text-danger">{errors.tokenAmount}</span>}
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-ink">Notes</span>
            <textarea className={`${fieldClass} min-h-24 py-3`} value={form.notes} onChange={(event) => update("notes", event.target.value)} />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-line pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Create Booking</Button>
        </div>
      </form>
    </div>
  );
};

const ApprovalDialog = ({ booking, onClose, onApprove }) => {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/40 px-4">
      <Card className="w-full max-w-lg">
        <h2 className="text-xl font-bold text-ink">Approve this booking?</h2>
        <p className="mt-2 text-sm text-slate-600">Confirm the guest details and convert this temporary hold into an approved booking.</p>
        <p className="mt-4 rounded-xl bg-paper p-3 text-sm font-semibold text-ink">{booking.id} · {booking.customerName} · {booking.bedName}</p>
        <div className="mt-5 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={() => onApprove(booking)}>Confirm Booking</Button>
        </div>
      </Card>
    </div>
  );
};

const RejectDialog = ({ booking, onClose, onReject }) => {
  const [reason, setReason] = useState(REJECTION_REASONS[0]);
  const releasingBlock = booking.bookingStatus === "Pending Approval";
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/40 px-4">
      <Card className="w-full max-w-md">
        <h2 className="text-xl font-bold text-ink">{releasingBlock ? "Cancel Blocked Booking" : "Reject Booking"}</h2>
        <p className="mt-2 text-sm text-slate-600">{releasingBlock ? "Cancelling this request will release the bed for new bookings immediately." : "Choose a reason before rejecting this booking."}</p>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-semibold text-ink">Reason</span>
          <select className={fieldClass} value={reason} onChange={(event) => setReason(event.target.value)}>
            {REJECTION_REASONS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <div className="mt-5 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="button" variant="danger" onClick={() => onReject(booking, reason)}>{releasingBlock ? "Cancel & Release Bed" : "Reject Booking"}</Button>
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
        <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:border-brandDark hover:text-brandDark" aria-label="Close">
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
            <a href={booking.aadhaarFront} download className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-brandDark hover:text-brandDark">
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
          body { font-family: Arial, sans-serif; color: #1F2937; padding: 32px; }
          h1 { color: #DD5E67; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          td { border: 1px solid #E5E5E5; padding: 12px; }
          .label { font-weight: 700; background: #FFF4F6; width: 34%; }
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
  const [createBookingOpen, setCreateBookingOpen] = useState(false);
  const [workflowError, setWorkflowError] = useState("");
  const [actionToast, setActionToast] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", branch: "All Branches", status: "All", paymentStatus: "All", dateRange: "This Month" });

  useEffect(() => {
    const syncedBeds = syncBedsWithBookings(loadBeds(), bookings);
    setBeds(syncedBeds);
    saveAvailabilitySnapshot(syncedBeds, rooms);
  }, [bookings, rooms]);

  useEffect(() => {
    const refreshBookings = () => setBookings(loadBookings());
    window.addEventListener("pg:bookings-updated", refreshBookings);
    window.addEventListener("storage", refreshBookings);
    return () => {
      window.removeEventListener("pg:bookings-updated", refreshBookings);
      window.removeEventListener("storage", refreshBookings);
    };
  }, []);

  const persistBookings = (nextBookings) => {
    setBookings(nextBookings);
    saveBookings(nextBookings);
  };

  const persistBeds = (nextBeds) => {
    setBeds(nextBeds);
    saveBeds(nextBeds);
    saveAvailabilitySnapshot(nextBeds, rooms);
  };

  const stats = useMemo(() => ({
    totalBookings: bookings.length,
    pendingApproval: bookings.filter((booking) => ["Pending Approval", "Pending"].includes(booking.bookingStatus)).length,
    approved: bookings.filter((booking) => ["Approved", "Assigned to Warden"].includes(booking.bookingStatus)).length,
    rejected: bookings.filter((booking) => booking.bookingStatus === "Rejected").length,
    checkedIn: bookings.filter((booking) => booking.bookingStatus === "Checked In").length,
    cancelled: bookings.filter((booking) => booking.bookingStatus === "Cancelled").length
  }), [bookings]);
  const blockedBedNotifications = useMemo(
    () => bookings.filter((booking) => ["Pending Approval", "Pending"].includes(booking.bookingStatus)).slice(0, 3),
    [bookings]
  );

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

    applyStatusChange(booking, "Approved", {
      rejectionReason: "",
      blockedUntil: ""
    });
    saveResidents(loadResidents().map((resident) => resident.bookingId === booking.id ? { ...resident, status: "Active" } : resident));
    setActionToast("Booking Approved Successfully.");
    window.setTimeout(() => setActionToast(""), 3000);
    setApproveBooking(null);
  };

  const confirmReject = (booking, reason) => {
    applyStatusChange(booking, "Rejected", { rejectionReason: reason, assignedWardenId: "", assignedWardenName: "", blockedUntil: "" });
    saveResidents(loadResidents().filter((resident) => resident.bookingId !== booking.id));
    setRejectBooking(null);
  };

  const confirmAssign = (booking, warden) => {
    const nextBooking = { ...booking, assignedWardenId: warden.id, assignedWardenName: warden.name };
    persistBookings(bookings.map((item) => item.id === booking.id ? nextBooking : item));
    saveResidents(loadResidents().map((resident) => resident.bookingId === booking.id ? { ...resident, assignedWarden: warden.name } : resident));
    setAssignBooking(null);
  };

  const createDirectBooking = (booking) => {
    if (!canApproveBooking(bookings, booking)) {
      setWorkflowError(`Bed ${booking.bedName} in Room ${booking.roomNumber} already has an active booking.`);
      return;
    }

    const nextBookings = [booking, ...bookings];
    persistBookings(nextBookings);
    persistBeds(updateBedForBooking(beds, booking, "Pending Approval"));
    setCreateBookingOpen(false);
    setFilters((current) => ({ ...current, search: booking.id, status: "All", paymentStatus: "All", dateRange: "Custom" }));
    setPage(1);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Bookings</h1>
          <p className="text-sm text-slate-500">Manage all customer bookings across every branch.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setCreateBookingOpen(true)}><Plus className="h-4 w-4" /> Create Booking</Button>
          <Button variant="secondary" onClick={() => window.print()}><Download className="h-4 w-4" /> Export</Button>
        </div>
      </div>

      {workflowError && (
        <div className="mt-4 flex items-start justify-between gap-3 rounded-2xl border border-brand/20 bg-paper p-4 text-sm font-semibold text-brandDark">
          <p>{workflowError}</p>
          <button type="button" onClick={() => setWorkflowError("")} aria-label="Dismiss workflow error"><X className="h-4 w-4" /></button>
        </div>
      )}

      {actionToast && <div role="status" className="fixed right-5 top-20 z-[80] rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-luxury">{actionToast}</div>}

      {blockedBedNotifications.length > 0 && (
        <Card className="mt-5 hover:translate-y-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ink">Blocked Bed Notifications</h2>
              <p className="text-sm text-slate-500">Follow up with guests who blocked beds online.</p>
            </div>
            <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brandDark">{blockedBedNotifications.length} pending</span>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {blockedBedNotifications.map((booking) => (
              <div key={booking.id} className="rounded-xl border border-brand/20 bg-brand/10 p-3 text-sm">
                <p className="font-semibold text-ink">{booking.customerName}</p>
                <p className="mt-1 text-slate-600">{booking.phone}</p>
                <p className="mt-2 font-semibold text-slate-700">{booking.branchName} · Room {booking.roomNumber} · {booking.bedName}</p>
              </div>
            ))}
          </div>
        </Card>
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
              <tr key={booking.id} className={`border-b border-line last:border-0 ${booking.bookingStatus === "Pending Approval" ? "bg-orange-50/80 dark:bg-orange-500/10" : ""}`}>
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
                    <button type="button" title="View Details" onClick={() => setViewBooking(booking)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="View booking details">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button type="button" title="Approve" onClick={() => setApproveBooking(booking)} disabled={!["Pending Approval", "Pending", "Rejected", "Cancelled"].includes(booking.bookingStatus)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark disabled:cursor-not-allowed disabled:opacity-40" aria-label="Approve booking">
                      <ShieldCheck className="h-4 w-4" />
                    </button>
                    <button type="button" title="Reject" onClick={() => setRejectBooking(booking)} disabled={["Rejected", "Cancelled", "Checked In"].includes(booking.bookingStatus)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-danger hover:border-danger hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40" aria-label="Reject booking">
                      <XCircle className="h-4 w-4" />
                    </button>
                    <button type="button" title="Assign Warden" onClick={() => setAssignBooking(booking)} disabled={!["Pending Approval", "Approved", "Assigned to Warden"].includes(booking.bookingStatus)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark disabled:cursor-not-allowed disabled:opacity-40" aria-label="Assign warden">
                      <UserCheck className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => printReceipt(booking)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="Print booking">
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
          {[["Pending Approval", "Pending Approval"], ["Approve", "Approved"], ["Assign to Warden", "Assigned to Warden"], ["Warden Receives Notification", "Assigned to Warden"], ["Resident Check-in", "Checked In"]].map(([label, status], index) => (
            <div key={`${label}-${index}`} className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[status]}`}>{label}</span>
              {index < 4 && <FileText className="h-4 w-4 text-brand" />}
            </div>
          ))}
        </div>
      </div>

      {viewBooking && <BookingViewModal booking={viewBooking} onClose={() => setViewBooking(null)} />}
      {approveBooking && <ApprovalDialog booking={approveBooking} onClose={() => setApproveBooking(null)} onApprove={confirmApprove} />}
      {rejectBooking && <RejectDialog booking={rejectBooking} onClose={() => setRejectBooking(null)} onReject={confirmReject} />}
      {assignBooking && <AssignWardenDialog booking={assignBooking} onClose={() => setAssignBooking(null)} onAssign={confirmAssign} />}
      {createBookingOpen && (
        <DirectBookingDialog
          bookings={bookings}
          beds={beds}
          rooms={rooms}
          onClose={() => setCreateBookingOpen(false)}
          onCreate={createDirectBooking}
        />
      )}
    </div>
  );
};

export default BookingsPage;
