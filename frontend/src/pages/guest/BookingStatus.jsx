import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Home, ReceiptText } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import api from "../../services/api";
import { formatCurrency } from "../../data/bookingFlow";

const BookingStatus = () => {
  const { state } = useLocation();
  const [bookings, setBookings] = useState([]);
  const confirmedBooking = state?.booking;

  useEffect(() => {
    api.get("/bookings").then(({ data }) => setBookings(data.data)).catch(() => {});
  }, []);

  if (confirmedBooking) {
    const summaryRows = [
      ["Branch", confirmedBooking.branch],
      ["Room Number", confirmedBooking.roomNumber ? `Room ${confirmedBooking.roomNumber}` : ""],
      ["Sharing Type", confirmedBooking.sharingType],
      ["AC / Non AC", confirmedBooking.roomType],
      ["Selected Bed", confirmedBooking.selectedBed],
      ["Monthly Rent", confirmedBooking.monthlyRent ? formatCurrency(confirmedBooking.monthlyRent) : ""],
      ["Token Paid", confirmedBooking.tokenAmount ? formatCurrency(confirmedBooking.tokenAmount) : ""]
    ].filter(([, value]) => value);

    return (
      <main className="bg-paper/70">
        <section className="border-b border-line bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Booking Successful</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl">Your Bed Is Reserved</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-secondary">
              The token payment has been marked complete. Your booking request is ready for approval tracking.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Card className="text-center hover:translate-y-0">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold/10 text-gold">
              <CheckCircle2 className="h-9 w-9" />
            </span>
            <h2 className="mt-6 text-3xl font-semibold text-ink">Booking Successful</h2>
            <p className="mt-3 text-secondary">Reference: {state?.reference || "UPI token payment recorded"}</p>

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

  return (
    <main className="bg-paper/70">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Booking Status</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl">Track Your Booking</h1>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-3">
        {bookings.length === 0 && <Card className="hover:translate-y-0">No bookings found. Create a booking to track approval.</Card>}
        {bookings.map((booking) => (
          <Card key={booking._id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-ink">{booking.branch?.name || "Branch"} · {booking.room?.name || "Room"}</p>
              <p className="text-sm text-secondary">Bed {booking.bed?.label || ""} · Token ₹{booking.tokenAmount}</p>
            </div>
            <Badge value={booking.status} />
          </Card>
        ))}
        </div>
      </section>
    </main>
  );
};

export default BookingStatus;
