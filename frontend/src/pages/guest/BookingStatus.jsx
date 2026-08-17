import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, ChevronDown, Home, ReceiptText } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { loadBookings } from "../../data/adminBookings";
import { formatCurrency } from "../../data/bookingFlow";
import { useAuth } from "../../context/AuthContext";

const HISTORY_STATUSES = ["Rejected", "Cancelled"];

const formatDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

const bedTypeLabel = (sharingType) => sharingType ? (sharingType === "4 Sharing" ? "Bunk Cot (Upper/Lower)" : "Single Cot") : "";

const bookingToStatusCard = (booking) => ({
  _id: booking.id,
  branch: { name: booking.branchName },
  room: { name: `Room ${booking.roomNumber}` },
  bed: { label: booking.bedName },
  rawStatus: booking.bookingStatus,
  sortDate: booking.moveInDate || booking.bookingDate || "",
  sharingType: booking.sharingType,
  roomType: booking.roomType,
  moveInDate: booking.moveInDate,
  checkOutDate: booking.checkOutDate,
  tokenAmount: booking.tokenAmount,
  paymentStatus: booking.paymentStatus,
  message: booking.bookingStatus === "Pending Approval"
    ? "Your booking is under verification. Our team will contact you soon."
    : booking.bookingStatus === "Rejected"
      ? `Your booking was rejected.${booking.rejectionReason ? ` Reason: ${booking.rejectionReason}` : ""}`
      : "",
  status: booking.bookingStatus?.toUpperCase().replaceAll(" ", "_")
});

const buildDetailRows = (booking) => [
  ["Branch / PG Name", booking.branch?.name],
  ["Room Number", booking.room?.name],
  ["Sharing Type", booking.sharingType],
  ["AC / Non AC", booking.roomType],
  ["Bed Type", bedTypeLabel(booking.sharingType)],
  ["Move-in Date", formatDate(booking.moveInDate)],
  ...(booking.checkOutDate ? [["End Date", formatDate(booking.checkOutDate)]] : []),
  ["Booking ID", booking._id],
  ...(booking.tokenAmount ? [["Token / Payment Amount", formatCurrency(booking.tokenAmount)]] : []),
  ["Payment Status", booking.paymentStatus],
  ["Booking Status", booking.rawStatus]
].filter(([, value]) => value);

const DetailGrid = ({ booking }) => (
  <div className="grid gap-3 text-sm sm:grid-cols-2">
    {buildDetailRows(booking).map(([label, value]) => (
      <div key={label} className="rounded-xl border border-line bg-white px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</p>
        <p className="mt-1 font-semibold text-ink">{value}</p>
      </div>
    ))}
  </div>
);

const CurrentBookingCard = ({ booking }) => (
  <Card className="hover:translate-y-0">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="font-semibold text-ink">{booking.branch?.name || "Branch"} · {booking.room?.name || "Room"}</p>
        <p className="text-sm text-secondary">Bed {booking.bed?.label || ""}</p>
      </div>
      <Badge value={booking.status} />
    </div>
    {booking.message && <p className="mt-3 text-sm font-semibold text-orange-700">{booking.message}</p>}
    <div className="mt-5 border-t border-line pt-5">
      <DetailGrid booking={booking} />
    </div>
  </Card>
);

const HistoryBookingCard = ({ booking }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="hover:translate-y-0">
      <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} className="flex w-full flex-wrap items-center justify-between gap-3 text-left">
        <div>
          <p className="font-semibold text-ink">{booking.branch?.name || "Branch"} · {booking.room?.name || "Room"}</p>
          <p className="mt-1 text-sm text-secondary">{formatDate(booking.moveInDate)}{booking.checkOutDate ? ` – ${formatDate(booking.checkOutDate)}` : " · Monthly stay"}</p>
          {booking.paymentStatus && <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted">Payment: {booking.paymentStatus}</p>}
          {booking.message && <p className="mt-2 text-sm font-semibold text-orange-700">{booking.message}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Badge value={booking.status} />
          <ChevronDown className={`h-4 w-4 text-muted transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>
      {expanded && (
        <div className="mt-4 border-t border-line pt-4">
          <DetailGrid booking={booking} />
        </div>
      )}
    </Card>
  );
};

const BookingStatus = () => {
  const { state } = useLocation();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const confirmedBooking = state?.booking;

  useEffect(() => {
    const refreshBookings = () => setBookings(loadBookings().filter((booking) => booking.userId === user?.id || booking.userEmail === user?.email).map(bookingToStatusCard));
    refreshBookings();
    window.addEventListener("pg:bookings-updated", refreshBookings);
    window.addEventListener("storage", refreshBookings);
    return () => {
      window.removeEventListener("pg:bookings-updated", refreshBookings);
      window.removeEventListener("storage", refreshBookings);
    };
  }, [user?.email, user?.id]);

  if (confirmedBooking) {
    const summaryRows = [
      ["Branch", confirmedBooking.branch],
      ["Room Number", confirmedBooking.roomNumber ? `Room ${confirmedBooking.roomNumber}` : ""],
      ["Sharing Type", confirmedBooking.sharingType],
      ["AC / Non AC", confirmedBooking.roomType],
      ["Selected Bed", confirmedBooking.selectedBed],
      ["Guests", confirmedBooking.guests],
      ["Check-in", confirmedBooking.checkIn],
      ["Check-out", confirmedBooking.checkOut || (confirmedBooking.checkIn ? "Monthly stay" : "")],
      ["Monthly Rent", confirmedBooking.monthlyRent ? formatCurrency(confirmedBooking.monthlyRent) : ""],
      ["Guest", confirmedBooking.guestName],
      ["Mobile", confirmedBooking.mobileNumber]
    ].filter(([, value]) => value);

    return (
      <main className="bg-paper/70">
        <section className="border-b border-line bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">Bed Blocked</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl">Your Bed Is Blocked</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-secondary">
              The selected bed has been blocked. Admin staff will contact you to verify the details and confirm the booking.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Card className="text-center hover:translate-y-0">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand/10 text-brand">
              <CheckCircle2 className="h-9 w-9" />
            </span>
            <h2 className="mt-6 text-3xl font-semibold text-ink">Bed Blocked Successfully</h2>
            <p className="mt-3 text-secondary">Your booking is under verification. Our team will contact you soon.</p>

            <div className="mt-8 grid gap-4 text-left text-sm sm:grid-cols-2">
              {summaryRows.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-line bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</p>
                  <p className="mt-1 font-semibold text-ink">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/">
                <Button variant="secondary" className="w-full sm:w-auto">
                  <Home className="h-4 w-4" /> Home
                </Button>
              </Link>
              <Link to="/featured-branches">
                <Button className="w-full sm:w-auto">
                  <ReceiptText className="h-4 w-4" /> View Featured Branches
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </main>
    );
  }

  const sortedBookings = [...bookings].sort((first, second) => new Date(second.sortDate || 0) - new Date(first.sortDate || 0));
  const currentBooking = sortedBookings.find((booking) => !HISTORY_STATUSES.includes(booking.rawStatus)) || null;
  const historyBookings = sortedBookings.filter((booking) => booking !== currentBooking);

  return (
    <main className="bg-paper/70">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">My Bookings</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl">Track Your Booking</h1>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-lg font-semibold text-ink">Current Booking</h2>
          <div className="mt-4">
            {currentBooking ? <CurrentBookingCard booking={currentBooking} /> : <Card className="hover:translate-y-0">No active booking right now.</Card>}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold text-ink">Booking History</h2>
          <div className="mt-4 space-y-3">
            {historyBookings.length === 0 && <Card className="hover:translate-y-0">No past bookings yet.</Card>}
            {historyBookings.map((booking) => <HistoryBookingCard key={booking._id} booking={booking} />)}
          </div>
        </div>
      </section>
    </main>
  );
};

export default BookingStatus;
