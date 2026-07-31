import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ClipboardCheck, IndianRupee, ShieldCheck } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { formatCurrency } from "../../data/bookingFlow";

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [reference, setReference] = useState("");

  const confirm = () => {
    navigate("/booking-status", { state: { booking: state?.booking, reference } });
  };

  const booking = state?.booking || {};
  const tokenAmount = booking.tokenAmount || 2000;

  return (
    <main className="bg-paper/70">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">Manual Confirmation</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl">Confirm Your Bed Block Request</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-secondary">
            Share a note for the admin team. Payment and final booking confirmation are handled in person.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-14">
        <Card className="hover:translate-y-0">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
              <IndianRupee className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-ink">Booking Token</h2>
              <p className="mt-2 leading-7 text-secondary">The token amount is shown for manual confirmation at the branch.</p>
            </div>
          </div>

          <div className="mt-7 rounded-[18px] border border-line bg-paper p-5">
            <p className="text-sm font-semibold text-secondary">Token Amount</p>
            <p className="mt-2 text-4xl font-semibold text-ink">{formatCurrency(tokenAmount)}</p>
            <p className="mt-2 text-sm text-muted">Final payment is handled during in-person confirmation.</p>
          </div>

          <div className="mt-6">
            <Input label="Admin follow-up note" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Preferred call time or note" />
          </div>

          <Button className="mt-6 w-full" onClick={confirm}>
            <ClipboardCheck className="h-4 w-4" /> Confirm Manual Follow-up
          </Button>
        </Card>

        <Card className="h-fit hover:translate-y-0">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">Booking Summary</p>
          <h2 className="mt-3 text-2xl font-semibold text-ink">Selected Room</h2>

          <div className="mt-6 grid gap-4 text-sm">
            {[
              ["Branch", booking.branch || "Selected branch"],
              ["Room Number", booking.roomNumber ? `Room ${booking.roomNumber}` : "Selected room"],
              ["Sharing Type", booking.sharingType || "Selected sharing"],
              ["AC / Non AC", booking.roomType || "Selected type"],
              ["Selected Bed", booking.selectedBed || "Selected bed"],
              ["Monthly Rent", booking.monthlyRent ? formatCurrency(booking.monthlyRent) : "-"],
              ["Security Deposit", booking.securityDeposit ? formatCurrency(booking.securityDeposit) : "-"],
              ["Token Amount", formatCurrency(tokenAmount)]
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
                <span className="font-semibold text-secondary">{label}</span>
                <span className="text-right font-semibold text-ink">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-7 flex items-start gap-3 rounded-[18px] border border-brand/20 bg-brand/10 p-4 text-sm leading-6 text-secondary">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <p>The selected bed remains blocked for admin review. Final approval can be tracked from booking status.</p>
          </div>
        </Card>
      </section>
    </main>
  );
};

export default Payment;
