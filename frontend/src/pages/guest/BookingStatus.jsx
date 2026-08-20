import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, ChevronDown, CreditCard, Home, ReceiptText } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { loadEnquiries, saveEnquiries } from "../../data/adminEnquiries";
import { loadPayments, savePayments, createPaymentReceiptNo } from "../../data/adminPayments";
import { loadResidents, saveResidents } from "../../data/adminResidents";
import { loadBeds } from "../../data/adminBeds";
import { saveAvailabilitySnapshot } from "../../lib/liveAvailability";
import { formatCurrency } from "../../data/bookingFlow";
import { useAuth } from "../../context/AuthContext";

const HISTORY_STATUSES = ["REJECTED", "NOT_INTERESTED"];

const formatDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

const bedTypeLabel = (sharingType) => sharingType ? (sharingType === "4 Sharing" ? "Bunk Cot (Upper/Lower)" : "Single Cot") : "";

const messageForEnquiry = (enquiry) => {
  if (enquiry.status === "NEW") return "Enquiry submitted. Our admin will contact you shortly.";
  if (enquiry.status === "CONTACTED") return "Our team has contacted you. Awaiting a final decision on this bed.";
  if (enquiry.status === "INTERESTED") return "Our team is considering your enquiry for this bed. Awaiting the final decision.";
  if (enquiry.status === "NOT_INTERESTED") return "This bed did not move forward for you this time. You can browse other available beds.";
  if (enquiry.status === "CONFIRMED" && enquiry.paymentStatus !== "Paid") return "Your Bed Request Has Been Approved. Complete the payment to confirm your booking.";
  if (enquiry.status === "CONFIRMED" && enquiry.paymentStatus === "Paid") return "Payment received. Your booking is confirmed.";
  if (enquiry.status === "REJECTED") return "Sorry, this bed has been assigned to another user. You can continue browsing other available beds.";
  return "";
};

const enquiryToStatusCard = (enquiry) => ({
  _id: enquiry.id,
  raw: enquiry,
  branch: { name: enquiry.branchName },
  room: { name: `Room ${enquiry.roomNumber}` },
  bed: { label: enquiry.bedName },
  rawStatus: enquiry.status,
  sortDate: enquiry.approvedAt || enquiry.contactedAt || enquiry.createdAt || "",
  sharingType: enquiry.sharingType,
  roomType: enquiry.roomType,
  moveInDate: enquiry.moveInDate,
  checkOutDate: enquiry.checkOutDate,
  tokenAmount: enquiry.tokenAmount,
  paymentStatus: enquiry.status === "CONFIRMED" ? (enquiry.paymentStatus === "Paid" ? "Paid" : "Payment Pending") : "Not Required",
  message: messageForEnquiry(enquiry),
  status: enquiry.status?.toUpperCase()
});

const buildDetailRows = (enquiry) => [
  ["Branch / PG Name", enquiry.branch?.name],
  ["Room Number", enquiry.room?.name],
  ["Sharing Type", enquiry.sharingType],
  ["AC / Non AC", enquiry.roomType],
  ["Bed Type", bedTypeLabel(enquiry.sharingType)],
  ["Move-in Date", formatDate(enquiry.moveInDate)],
  ...(enquiry.checkOutDate ? [["End Date", formatDate(enquiry.checkOutDate)]] : []),
  ["Enquiry ID", enquiry._id],
  ...(enquiry.tokenAmount ? [["Token / Payment Amount", formatCurrency(enquiry.tokenAmount)]] : []),
  ["Payment Status", enquiry.paymentStatus],
  ["Enquiry Status", enquiry.rawStatus]
].filter(([, value]) => value);

const DetailGrid = ({ enquiry }) => (
  <div className="grid gap-3 text-sm sm:grid-cols-2">
    {buildDetailRows(enquiry).map(([label, value]) => (
      <div key={label} className="rounded-xl border border-line bg-white px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</p>
        <p className="mt-1 font-semibold text-ink">{value}</p>
      </div>
    ))}
  </div>
);

const CurrentBookingCard = ({ enquiry, onPayNow }) => (
  <Card className="hover:translate-y-0">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="font-semibold text-ink">{enquiry.branch?.name || "Branch"} · {enquiry.room?.name || "Room"}</p>
        <p className="text-sm text-secondary">Bed {enquiry.bed?.label || ""}</p>
      </div>
      <Badge value={enquiry.status} />
    </div>
    {enquiry.message && <p className="mt-3 text-sm font-semibold text-orange-700 dark:text-orange-400">{enquiry.message}</p>}
    {enquiry.rawStatus === "CONFIRMED" && enquiry.raw.paymentStatus !== "Paid" && (
      <Button className="mt-4" onClick={() => onPayNow(enquiry.raw)}>
        <CreditCard className="h-4 w-4" /> Pay {formatCurrency(enquiry.tokenAmount)} Now
      </Button>
    )}
    <div className="mt-5 border-t border-line pt-5">
      <DetailGrid enquiry={enquiry} />
    </div>
  </Card>
);

const HistoryBookingCard = ({ enquiry }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="hover:translate-y-0">
      <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} className="flex w-full flex-wrap items-center justify-between gap-3 text-left">
        <div>
          <p className="font-semibold text-ink">{enquiry.branch?.name || "Branch"} · {enquiry.room?.name || "Room"}</p>
          <p className="mt-1 text-sm text-secondary">{formatDate(enquiry.moveInDate)}{enquiry.checkOutDate ? ` – ${formatDate(enquiry.checkOutDate)}` : " · Monthly stay"}</p>
          {enquiry.message && <p className="mt-2 text-sm font-semibold text-orange-700 dark:text-orange-400">{enquiry.message}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Badge value={enquiry.status} />
          <ChevronDown className={`h-4 w-4 text-muted transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>
      {expanded && (
        <div className="mt-4 border-t border-line pt-4">
          <DetailGrid enquiry={enquiry} />
        </div>
      )}
    </Card>
  );
};

const payForEnquiry = (enquiry) => {
  const nowIso = new Date().toISOString();
  const today = nowIso.slice(0, 10);

  saveEnquiries(loadEnquiries().map((item) => (item.id === enquiry.id ? { ...item, paymentStatus: "Paid", paidAt: nowIso } : item)));

  const payments = loadPayments();
  const receiptNo = createPaymentReceiptNo(payments);
  savePayments([
    {
      id: receiptNo,
      receiptNo,
      residentId: "",
      residentName: enquiry.userName,
      bookingId: enquiry.id,
      branchId: enquiry.branchId,
      branchName: enquiry.branchName,
      roomId: enquiry.roomId,
      roomNumber: enquiry.roomNumber,
      bedId: enquiry.bedId,
      bedName: enquiry.bedName,
      paymentType: "Booking Token",
      amount: enquiry.tokenAmount,
      paymentMethod: "UPI",
      transactionId: `ONLINE-${enquiry.id}`,
      referenceNumber: `ONLINE-${enquiry.id}`,
      paymentDate: today,
      paymentStatus: "Paid",
      remarks: "Online booking token payment after enquiry approval.",
      paymentProof: "",
      proofName: "",
      proofType: "",
      createdBy: "Guest",
      collectedBy: "Online Payment",
      month: today.slice(0, 7),
      monthlyRent: enquiry.monthlyRent,
      paidAmount: enquiry.tokenAmount,
      lateFees: 0,
      originalPaymentId: "",
      refundReason: "",
      refundMethod: ""
    },
    ...payments
  ]);

  const residents = loadResidents();
  const highestResidentNumber = residents.reduce((value, resident) => Math.max(value, Number(String(resident.id).replace(/\D/g, "") || 0)), 0);
  saveResidents([
    {
      id: `RES${String(highestResidentNumber + 1).padStart(4, "0")}`,
      userId: enquiry.userId,
      fullName: enquiry.userName,
      gender: enquiry.gender,
      dob: enquiry.dob,
      phone: enquiry.phone,
      email: enquiry.email,
      currentAddress: enquiry.currentAddress,
      occupation: enquiry.occupation,
      organization: enquiry.organization,
      aadhaarNumber: enquiry.aadhaarNumber,
      aadhaarFront: enquiry.aadhaarFront,
      branchId: enquiry.branchId,
      branchName: enquiry.branchName,
      roomId: enquiry.roomId,
      roomNumber: enquiry.roomNumber,
      bedId: enquiry.bedId,
      bedName: enquiry.bedName,
      sharingType: enquiry.sharingType,
      roomType: enquiry.roomType,
      moveInDate: enquiry.moveInDate,
      monthlyRent: enquiry.monthlyRent,
      securityDeposit: enquiry.securityDeposit,
      tokenPaid: enquiry.tokenAmount,
      pendingAmount: 0,
      lastPaymentDate: today,
      bookingId: enquiry.id,
      bookingDate: (enquiry.approvedAt || nowIso).slice(0, 10),
      assignedWarden: "",
      status: "Active"
    },
    ...residents
  ]);

  const beds = loadBeds();
  saveAvailabilitySnapshot(beds.map((bed) => (bed.id === enquiry.bedId ? {
    ...bed,
    status: "Occupied",
    currentResident: enquiry.userName,
    bookingId: enquiry.id,
    checkInDate: enquiry.moveInDate,
    checkOutDate: ""
  } : bed)));
};

const BookingStatus = () => {
  const { state } = useLocation();
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const confirmedEnquiry = state?.booking;

  useEffect(() => {
    const refreshEnquiries = () => setEnquiries(loadEnquiries().filter((enquiry) => enquiry.userId === user?.id || enquiry.email === user?.email).map(enquiryToStatusCard));
    refreshEnquiries();
    window.addEventListener("pg:enquiries-updated", refreshEnquiries);
    window.addEventListener("storage", refreshEnquiries);
    return () => {
      window.removeEventListener("pg:enquiries-updated", refreshEnquiries);
      window.removeEventListener("storage", refreshEnquiries);
    };
  }, [user?.email, user?.id]);

  const handlePayNow = (enquiry) => {
    payForEnquiry(enquiry);
  };

  if (confirmedEnquiry) {
    const summaryRows = [
      ["Branch", confirmedEnquiry.branch],
      ["Room Number", confirmedEnquiry.roomNumber ? `Room ${confirmedEnquiry.roomNumber}` : ""],
      ["Sharing Type", confirmedEnquiry.sharingType],
      ["AC / Non AC", confirmedEnquiry.roomType],
      ["Selected Bed", confirmedEnquiry.selectedBed],
      ["Guests", confirmedEnquiry.guests],
      ["Check-in", confirmedEnquiry.checkIn],
      ["Check-out", confirmedEnquiry.checkOut || (confirmedEnquiry.checkIn ? "Monthly stay" : "")],
      ["Monthly Rent", confirmedEnquiry.monthlyRent ? formatCurrency(confirmedEnquiry.monthlyRent) : ""],
      ["Guest", confirmedEnquiry.guestName],
      ["Mobile", confirmedEnquiry.mobileNumber]
    ].filter(([, value]) => value);

    return (
      <main className="bg-paper/70">
        <section className="border-b border-line bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">Enquiry Sent</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl">Your Enquiry Has Been Submitted</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-secondary">
              Admin staff will contact you to verify the details. This bed remains available to other guests until an admin approves your enquiry.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Card className="text-center hover:translate-y-0">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand/10 text-brand">
              <CheckCircle2 className="h-9 w-9" />
            </span>
            <h2 className="mt-6 text-3xl font-semibold text-ink">Enquiry Submitted Successfully</h2>
            <p className="mt-3 text-secondary">Our admin will contact you shortly. You can continue browsing other PG options.</p>

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

  const sortedEnquiries = [...enquiries].sort((first, second) => new Date(second.sortDate || 0) - new Date(first.sortDate || 0));
  const currentEnquiry = sortedEnquiries.find((enquiry) => !HISTORY_STATUSES.includes(enquiry.rawStatus)) || null;
  const historyEnquiries = sortedEnquiries.filter((enquiry) => enquiry !== currentEnquiry);

  return (
    <main className="bg-paper/70">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">My Enquiries</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl">Track Your Enquiry</h1>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-lg font-semibold text-ink">Current Enquiry</h2>
          <div className="mt-4">
            {currentEnquiry ? <CurrentBookingCard enquiry={currentEnquiry} onPayNow={handlePayNow} /> : <Card className="hover:translate-y-0">No active enquiry right now.</Card>}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold text-ink">Enquiry History</h2>
          <div className="mt-4 space-y-3">
            {historyEnquiries.length === 0 && <Card className="hover:translate-y-0">No past enquiries yet.</Card>}
            {historyEnquiries.map((enquiry) => <HistoryBookingCard key={enquiry._id} enquiry={enquiry} />)}
          </div>
        </div>
      </section>
    </main>
  );
};

export default BookingStatus;
