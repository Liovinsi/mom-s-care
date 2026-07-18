import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CreditCard, IndianRupee, ShieldCheck } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import api from "../../services/api";
import { formatCurrency } from "../../data/bookingFlow";

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [reference, setReference] = useState("");

  const pay = async () => {
    try {
      const { data } = await api.get("/payments?status=PENDING");
      const payment = data.data.find((item) => item.booking?._id === state?.booking?._id || item.booking === state?.booking?._id);
      if (payment) await api.patch(`/payments/${payment._id}/paid`, { method: "UPI", reference });
    } catch {
      // The UI still moves forward for offline scaffolding; production API records payment when connected.
    }
    navigate("/booking-status", { state: { booking: state?.booking, reference } });
  };

  const booking = state?.booking || {};
  const tokenAmount = booking.tokenAmount || 2000;

  return (
    <main className="bg-paper/70">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">UPI Token Payment</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl">Confirm Your Booking Token</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-secondary">
            Pay the refundable booking token and enter the UPI reference to complete the reservation request.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-14">
        <Card className="hover:translate-y-0">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gold/10 text-gold">
              <IndianRupee className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-ink">UPI Payment</h2>
              <p className="mt-2 leading-7 text-secondary">Use your preferred UPI app, then enter the transaction reference below.</p>
            </div>
          </div>

          <div className="mt-7 rounded-[18px] border border-line bg-paper p-5">
            <p className="text-sm font-semibold text-secondary">Token Amount</p>
            <p className="mt-2 text-4xl font-semibold text-ink">{formatCurrency(tokenAmount)}</p>
            <p className="mt-2 text-sm text-muted">UPI ID: pgstayluxe@upi</p>
          </div>

          <div className="mt-6">
            <Input label="UPI / transaction reference" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="TXN123456" />
          </div>

          <Button className="mt-6 w-full" onClick={pay} disabled={!reference.trim()}>
            <CreditCard className="h-4 w-4" /> Confirm Token Payment
          </Button>
        </Card>

        <Card className="h-fit hover:translate-y-0">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Booking Summary</p>
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

          <div className="mt-7 flex items-start gap-3 rounded-[18px] border border-gold/20 bg-gold/10 p-4 text-sm leading-6 text-secondary">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
            <p>Token payment confirms the bed selection request. Final approval can be tracked from booking status.</p>
          </div>
        </Card>
      </section>
    </main>
  );
};

export default Payment;
