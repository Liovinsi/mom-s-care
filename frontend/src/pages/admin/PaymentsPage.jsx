import { Download, Eye, FileDown, ImagePlus, Pencil, Plus, Printer, RotateCcw, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import { AREAS } from "../../data/adminBranches";
import { loadBookings } from "../../data/adminBookings";
import { PAYMENT_METHODS, PAYMENT_STATUSES, PAYMENT_TYPES, RECORD_PAYMENT_TYPES, loadPayments, savePayments } from "../../data/adminPayments";
import { loadResidents } from "../../data/adminResidents";
import { calculatePaymentAnalytics, calculateRentDue, printPaymentReceipt, savePaymentRecord, useLivePayments } from "../../lib/livePayments";

const rowsPerPage = 10;
const maxProofSize = 10 * 1024 * 1024;
const proofTypes = ["image/jpeg", "image/png", "application/pdf"];
const fieldClass = "min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/25 disabled:bg-paper disabled:text-slate-500";

const statusStyles = {
  Paid: "bg-brand/10 text-brandDark",
  Pending: "bg-brand/10 text-brandDark",
  Failed: "bg-paper text-brandDark",
  Refunded: "bg-slate-100 text-slate-600",
  Overdue: "bg-paper text-brandDark",
  Partial: "bg-brand/10 text-brandDark"
};

const emptyPayment = {
  residentId: "",
  residentName: "",
  bookingId: "",
  branchId: "",
  branchName: "",
  roomId: "",
  roomNumber: "",
  bedId: "",
  bedName: "",
  paymentType: "Monthly Rent",
  amount: "",
  paymentMethod: "UPI",
  transactionId: "",
  referenceNumber: "",
  paymentDate: "2026-07-18",
  paymentStatus: "Paid",
  remarks: "",
  paymentProof: "",
  proofName: "",
  proofType: "",
  createdBy: "Admin",
  collectedBy: "Admin",
  month: "2026-07",
  monthlyRent: 0,
  paidAmount: 0,
  lateFees: 0,
  originalPaymentId: "",
  refundReason: "",
  refundMethod: ""
};

const Field = ({ label, required, error, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-ink">{label}{required && " *"}</span>
    {children}
    {error && <span className="mt-1 block text-xs font-semibold text-danger">{error}</span>}
  </label>
);

const StatusBadge = ({ status }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[status] || statusStyles.Pending}`}>{status}</span>
);

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const readProofFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const validateProofFile = (file) => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const hasAllowedExtension = ["jpg", "jpeg", "png", "pdf"].includes(extension);
  if (!proofTypes.includes(file.type) && !hasAllowedExtension) return "Upload JPG, PNG, or PDF only";
  if (file.size > maxProofSize) return "Payment proof must be 10 MB or smaller";
  return "";
};

const ProofUpload = ({ proof, proofName, proofType, onChange, error, onError }) => {
  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const nextError = validateProofFile(file);
    if (nextError) {
      onError(nextError);
      event.target.value = "";
      return;
    }
    const value = await readProofFile(file);
    onError("");
    onChange({ paymentProof: value, proofName: file.name, proofType: file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "image/jpeg") });
  };

  const isPdf = proofType === "application/pdf" || proofName.toLowerCase().endsWith(".pdf");

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
        <div className="grid h-32 place-items-center rounded-xl border border-line bg-paper text-center">
          {proof ? (
            isPdf ? <p className="px-3 text-sm font-bold text-ink">{proofName || "PDF Uploaded"}</p> : <img src={proof} alt="Payment proof" className="h-full w-full rounded-xl object-cover" />
          ) : (
            <p className="px-3 text-sm font-bold text-slate-500">No Proof Uploaded</p>
          )}
        </div>
        <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line bg-paper px-4 text-center text-sm font-semibold text-ink transition hover:border-brandDark hover:text-brandDark">
          <ImagePlus className="mb-2 h-5 w-5" />
          Upload Payment Proof
          <span className="mt-1 text-xs font-medium text-slate-500">JPG, PNG, PDF up to 10 MB</span>
          <input type="file" accept="image/jpeg,image/png,application/pdf" className="hidden" onChange={handleUpload} />
        </label>
      </div>
      {error && <span className="mt-2 block text-xs font-semibold text-danger">{error}</span>}
    </div>
  );
};

const createReceiptNo = (payments) => {
  const max = payments.reduce((value, payment) => Math.max(value, Number(payment.receiptNo?.replace(/\D/g, "") || 0)), 0);
  return `RCPT${String(max + 1).padStart(4, "0")}`;
};

const validatePayment = (payment) => {
  const errors = {};
  if (!payment.residentId) errors.residentId = "Resident is required";
  if (!payment.paymentType) errors.paymentType = "Payment type is required";
  if (!Number(payment.amount || 0) || Number(payment.amount) <= 0) errors.amount = "Amount is required";
  if (!payment.paymentMethod) errors.paymentMethod = "Payment method is required";
  return errors;
};

const getPaymentMonth = (payment) => payment.month || payment.paymentDate?.slice(0, 7) || "";

const isInMonthFilter = (payment, filter) => {
  if (filter === "Custom") return true;
  const current = "2026-07";
  if (filter === "Current Month") return getPaymentMonth(payment) === current;
  if (filter === "Last Month") return getPaymentMonth(payment) === "2026-06";
  return true;
};

const PaymentDrawer = ({ payment, payments, residents, bookings, onClose, onSave }) => {
  const [form, setForm] = useState(payment || emptyPayment);
  const [errors, setErrors] = useState({});
  const [proofError, setProofError] = useState("");
  const editingId = payment?.id;
  const resident = residents.find((item) => item.id === form.residentId);
  const residentBookings = bookings.filter((item) => item.id === form.bookingId || item.customerName === resident?.fullName || item.bedId === resident?.bedId);

  const update = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "residentId") {
        const selected = residents.find((item) => item.id === value);
        if (selected) {
          Object.assign(next, {
            residentName: selected.fullName,
            bookingId: selected.bookingId,
            branchId: selected.branchId,
            branchName: selected.branchName,
            roomId: selected.roomId,
            roomNumber: selected.roomNumber,
            bedId: selected.bedId,
            bedName: selected.bedName,
            monthlyRent: selected.monthlyRent,
            collectedBy: selected.assignedWarden || "Admin",
            amount: current.amount || selected.monthlyRent
          });
        }
      }
      return next;
    });
  };

  const submit = (event) => {
    event.preventDefault();
    const normalized = {
      ...form,
      amount: Number(form.amount || 0),
      paidAmount: form.paymentStatus === "Paid" ? Number(form.amount || 0) : Number(form.paidAmount || 0),
      month: form.paymentDate?.slice(0, 7) || form.month
    };
    const nextErrors = validatePayment(normalized);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || proofError) return;
    const receiptNo = editingId ? normalized.receiptNo : createReceiptNo(payments);
    onSave({ ...normalized, id: editingId || receiptNo, receiptNo });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40">
      <form onSubmit={submit} className="h-full w-full max-w-4xl overflow-y-auto bg-white p-5 shadow-luxury">
        <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-5 flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <div>
            <h2 className="text-xl font-bold text-ink">{editingId ? "Edit Payment" : "Record Payment"}</h2>
            <p className="text-sm text-slate-500">Manage booking payments, rent, deposits, refunds, and payment proof.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:border-brandDark hover:text-brandDark" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <section>
          <h3 className="text-sm font-bold uppercase text-slate-500">Payment Information</h3>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <Field label="Resident" required error={errors.residentId}>
              <select className={fieldClass} value={form.residentId} onChange={(event) => update("residentId", event.target.value)} disabled={Boolean(editingId)}>
                <option value="">Select resident</option>
                {residents.map((item) => <option key={item.id} value={item.id}>{item.fullName} · {item.id}</option>)}
              </select>
            </Field>
            <Field label="Booking">
              <select className={fieldClass} value={form.bookingId} onChange={(event) => update("bookingId", event.target.value)} disabled={Boolean(editingId)}>
                <option value="">Select booking</option>
                {residentBookings.map((item) => <option key={item.id} value={item.id}>{item.id}</option>)}
                {form.bookingId && !residentBookings.some((item) => item.id === form.bookingId) && <option value={form.bookingId}>{form.bookingId}</option>}
              </select>
            </Field>
            {[
              ["Branch", form.branchName],
              ["Room", form.roomNumber ? `Room ${form.roomNumber}` : ""],
              ["Bed", form.bedName]
            ].map(([label, value]) => (
              <Field key={label} label={label} required>
                <input className={fieldClass} value={value} disabled />
              </Field>
            ))}
            <Field label="Payment Type" required error={errors.paymentType}>
              <select className={fieldClass} value={form.paymentType} onChange={(event) => update("paymentType", event.target.value)}>
                {RECORD_PAYMENT_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Amount" required error={errors.amount}>
              <input type="number" min="1" className={fieldClass} value={form.amount} onChange={(event) => update("amount", event.target.value)} />
            </Field>
            <Field label="Payment Method" required error={errors.paymentMethod}>
              <select className={fieldClass} value={form.paymentMethod} onChange={(event) => update("paymentMethod", event.target.value)}>
                {PAYMENT_METHODS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Transaction ID">
              <input className={fieldClass} value={form.transactionId} onChange={(event) => update("transactionId", event.target.value)} />
            </Field>
            <Field label="Reference Number">
              <input className={fieldClass} value={form.referenceNumber} onChange={(event) => update("referenceNumber", event.target.value)} />
            </Field>
            <Field label="Payment Date">
              <input type="date" className={fieldClass} value={form.paymentDate} onChange={(event) => update("paymentDate", event.target.value)} />
            </Field>
            <Field label="Payment Status">
              <select className={fieldClass} value={form.paymentStatus} onChange={(event) => update("paymentStatus", event.target.value)}>
                {PAYMENT_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Remarks">
                <textarea className={`${fieldClass} min-h-24 py-3`} value={form.remarks} onChange={(event) => update("remarks", event.target.value)} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Upload Payment Proof">
                <ProofUpload
                  proof={form.paymentProof}
                  proofName={form.proofName || ""}
                  proofType={form.proofType || ""}
                  error={proofError}
                  onError={setProofError}
                  onChange={(proofData) => setForm((current) => ({ ...current, ...proofData }))}
                />
              </Field>
            </div>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-line pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </div>
  );
};

const DetailGrid = ({ items }) => (
  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
    {items.map(([label, value]) => (
      <p key={label}><span className="font-semibold text-ink">{label}:</span> {value || "-"}</p>
    ))}
  </div>
);

const PaymentProofPreview = ({ payment }) => {
  if (!payment.paymentProof) return <p className="mt-4 rounded-xl bg-paper p-4 text-sm font-semibold text-slate-500">No payment proof uploaded.</p>;
  const isPdf = payment.proofType === "application/pdf" || payment.proofName?.toLowerCase().endsWith(".pdf");
  return (
    <div className="mt-4">
      {isPdf ? (
        <a href={payment.paymentProof} download={payment.proofName || "payment-proof.pdf"} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-white px-4 text-sm font-bold text-ink hover:border-brandDark hover:text-brandDark">Download PDF Proof</a>
      ) : (
        <img src={payment.paymentProof} alt="Payment proof" className="h-48 w-full rounded-2xl border border-line object-cover" />
      )}
      <p className="mt-2 text-xs font-bold uppercase text-slate-500">{payment.proofName || "Payment Proof"}</p>
    </div>
  );
};

const PaymentViewModal = ({ payment, onClose }) => (
  <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/40 px-4 py-8">
    <Card className="w-full max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-ink">{payment.receiptNo}</h2>
          <p className="text-sm text-slate-500">{payment.residentName} · {payment.branchName} · {payment.paymentType}</p>
          <div className="mt-2"><StatusBadge status={payment.paymentStatus} /></div>
        </div>
        <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:border-brandDark hover:text-brandDark" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-bold text-ink">Resident Details</h3>
          <DetailGrid items={[
            ["Receipt Number", payment.receiptNo],
            ["Resident", `${payment.residentName} (${payment.residentId})`],
            ["Booking ID", payment.bookingId],
            ["Branch", payment.branchName],
            ["Room", `Room ${payment.roomNumber}`],
            ["Bed", payment.bedName]
          ]} />
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-ink">Payment Details</h3>
          <DetailGrid items={[
            ["Payment Type", payment.paymentType],
            ["Amount", formatCurrency(payment.amount)],
            ["Payment Method", payment.paymentMethod],
            ["Transaction ID", payment.transactionId],
            ["Reference Number", payment.referenceNumber],
            ["Payment Date", formatDate(payment.paymentDate)],
            ["Created By", payment.createdBy],
            ["Remarks", payment.remarks]
          ]} />
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-bold text-ink">Payment Proof</h3>
          <PaymentProofPreview payment={payment} />
        </Card>
      </div>
    </Card>
  </div>
);

const qrDataUrl = (payment) => {
  const seed = `${payment.receiptNo}${payment.residentId}${payment.amount}`;
  const cells = Array.from({ length: 49 }, (_, index) => (seed.charCodeAt(index % seed.length) + index) % 3 === 0);
  const squares = cells.map((filled, index) => {
    if (!filled) return "";
    const x = (index % 7) * 10;
    const y = Math.floor(index / 7) * 10;
    return `<rect x="${x}" y="${y}" width="8" height="8" fill="#1F2937"/>`;
  }).join("");
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 70 70"><rect width="70" height="70" fill="#fff"/>${squares}</svg>`)}`;
};

const printReceipt = (payment) => {
  const receipt = window.open("", "_blank", "width=840,height=900");
  if (!receipt) return;
  receipt.document.write(`
    <html>
      <head>
        <title>Payment Receipt ${payment.receiptNo}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #1F2937; padding: 32px; }
          h1 { color: #DD5E67; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          td { border: 1px solid #E5E5E5; padding: 12px; }
          .label { font-weight: 700; background: #FFF4F6; width: 34%; }
          .top { display: flex; justify-content: space-between; align-items: start; gap: 24px; }
          .logo { width: 72px; height: 72px; object-fit: cover; border-radius: 16px; }
          .qr { width: 86px; height: 86px; border: 1px solid #E5E5E5; padding: 8px; border-radius: 12px; }
        </style>
      </head>
      <body>
        <div class="top">
          <div>
            <img class="logo" src="/logo.jpeg" alt="PG Stay logo" />
            <h1>Payment Receipt</h1>
            <p>Receipt Number: ${payment.receiptNo}</p>
          </div>
          <img class="qr" src="${qrDataUrl(payment)}" alt="QR Code" />
        </div>
        <table>
          <tr><td class="label">Resident Name</td><td>${payment.residentName}</td></tr>
          <tr><td class="label">Resident ID</td><td>${payment.residentId}</td></tr>
          <tr><td class="label">Branch</td><td>${payment.branchName}</td></tr>
          <tr><td class="label">Room</td><td>Room ${payment.roomNumber}</td></tr>
          <tr><td class="label">Bed</td><td>${payment.bedName}</td></tr>
          <tr><td class="label">Payment Type</td><td>${payment.paymentType}</td></tr>
          <tr><td class="label">Amount</td><td>${formatCurrency(payment.amount)}</td></tr>
          <tr><td class="label">Payment Method</td><td>${payment.paymentMethod}</td></tr>
          <tr><td class="label">Transaction ID</td><td>${payment.transactionId || "-"}</td></tr>
          <tr><td class="label">Payment Date</td><td>${formatDate(payment.paymentDate)}</td></tr>
          <tr><td class="label">Collected By</td><td>${payment.collectedBy || payment.createdBy}</td></tr>
        </table>
      </body>
    </html>
  `);
  receipt.document.close();
  receipt.focus();
  receipt.print();
};

const RefundDialog = ({ payment, onClose, onRefund }) => {
  const [form, setForm] = useState({ amount: payment.amount, reason: "", method: "UPI" });
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4">
      <Card className="w-full max-w-md">
        <h2 className="text-xl font-bold text-ink">Process Refund</h2>
        <p className="mt-2 text-sm text-slate-600">Refunds are linked to the original payment receipt.</p>
        <div className="mt-4 grid gap-3">
          <Field label="Refund Amount" required>
            <input type="number" min="1" max={payment.amount} className={fieldClass} value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
          </Field>
          <Field label="Refund Reason" required>
            <textarea className={`${fieldClass} min-h-24 py-3`} value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} />
          </Field>
          <Field label="Refund Method" required>
            <select className={fieldClass} value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })}>
              {["UPI", "Bank Transfer", "Cash"].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="button" variant="danger" disabled={!Number(form.amount || 0) || !form.reason.trim()} onClick={() => onRefund(payment, form)}>Process Refund</Button>
        </div>
      </Card>
    </div>
  );
};

const PaymentsPage = () => {
  const residents = useMemo(loadResidents, []);
  const bookings = useMemo(loadBookings, []);
  const { payments: livePayments } = useLivePayments();
  const [payments, setPayments] = useState(loadPayments);
  const [drawerPayment, setDrawerPayment] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [viewPayment, setViewPayment] = useState(null);
  const [refundPayment, setRefundPayment] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", branch: "All", paymentType: "All", paymentMethod: "All", paymentStatus: "All", month: "Current Month", year: "2026" });

  useEffect(() => {
    setPayments(livePayments);
  }, [livePayments]);

  const stats = useMemo(() => {
    const paidPayments = payments.filter((payment) => payment.paymentStatus === "Paid");
    const analytics = calculatePaymentAnalytics(payments, residents);
    return {
      totalRevenue: paidPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      todayCollection: paidPayments.filter((payment) => payment.paymentDate === "2026-07-18").reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      monthCollection: paidPayments.filter((payment) => getPaymentMonth(payment) === "2026-07").reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      pendingPayments: payments.filter((payment) => payment.paymentStatus === "Pending").reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      overduePayments: payments.filter((payment) => payment.paymentStatus === "Overdue").reduce((sum, payment) => sum + Number(payment.amount || 0) + Number(payment.lateFees || 0), 0),
      refunds: payments.filter((payment) => payment.paymentStatus === "Refunded" || payment.paymentType === "Refund").reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      weeklyRevenue: analytics.weeklyRevenue,
      expectedCollection: analytics.expectedCollection,
      securityDepositCollected: analytics.securityDepositCollected
    };
  }, [payments, residents]);

  const filteredPayments = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return payments.filter((payment) => {
      const matchesSearch = !query || [payment.residentName, payment.residentId, payment.bookingId, payment.receiptNo, payment.transactionId].some((value) => (value || "").toLowerCase().includes(query));
      const matchesBranch = filters.branch === "All" || payment.branchName === filters.branch;
      const matchesType = filters.paymentType === "All" || payment.paymentType === filters.paymentType;
      const matchesMethod = filters.paymentMethod === "All" || payment.paymentMethod === filters.paymentMethod;
      const matchesStatus = filters.paymentStatus === "All" || payment.paymentStatus === filters.paymentStatus;
      const matchesMonth = isInMonthFilter(payment, filters.month);
      const matchesYear = filters.year === "All" || payment.paymentDate?.startsWith(filters.year);
      return matchesSearch && matchesBranch && matchesType && matchesMethod && matchesStatus && matchesMonth && matchesYear;
    });
  }, [payments, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / rowsPerPage));
  const visiblePayments = filteredPayments.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const persistPayments = (nextPayments) => {
    setPayments(nextPayments);
    savePayments(nextPayments);
  };

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ search: "", branch: "All", paymentType: "All", paymentMethod: "All", paymentStatus: "All", month: "Current Month", year: "2026" });
    setPage(1);
  };

  const savePayment = async (payment) => {
    const { payments: nextPayments } = await savePaymentRecord(payment);
    setPayments(nextPayments);
    setShowDrawer(false);
  };

  const processRefund = (payment, refund) => {
    const receiptNo = createReceiptNo(payments);
    const refundRecord = {
      ...payment,
      id: receiptNo,
      receiptNo,
      paymentType: "Refund",
      amount: Number(refund.amount),
      paymentMethod: refund.method,
      paymentStatus: "Refunded",
      paymentDate: "2026-07-18",
      transactionId: `RFND-${receiptNo}`,
      referenceNumber: "",
      remarks: refund.reason,
      originalPaymentId: payment.id,
      refundReason: refund.reason,
      refundMethod: refund.method
    };
    persistPayments([refundRecord, ...payments.map((item) => (item.id === payment.id ? { ...item, paymentStatus: "Refunded" } : item))]);
    setRefundPayment(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Payments</h1>
          <p className="text-sm text-slate-500">Manage all booking payments, monthly rent, deposits, refunds and payment history.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => { setDrawerPayment(null); setShowDrawer(true); }}><Plus className="h-4 w-4" /> Record Payment</Button>
          <Button variant="secondary" onClick={() => window.print()}><Download className="h-4 w-4" /> Export</Button>
          <Button variant="secondary" onClick={() => window.print()}><FileDown className="h-4 w-4" /> Download Report</Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} />
        <StatCard label="Today's Collection" value={formatCurrency(stats.todayCollection)} />
        <StatCard label="Monthly Revenue" value={formatCurrency(stats.monthCollection)} />
        <StatCard label="Weekly Revenue" value={formatCurrency(stats.weeklyRevenue)} />
        <StatCard label="Pending Payments" value={formatCurrency(stats.pendingPayments)} />
        <StatCard label="Overdue Payments" value={formatCurrency(stats.overduePayments)} />
        <StatCard label="Expected Collection" value={formatCurrency(stats.expectedCollection)} />
        <StatCard label="Security Deposits" value={formatCurrency(stats.securityDepositCollected)} />
        <StatCard label="Refunds" value={formatCurrency(stats.refunds)} />
      </div>

      <Card className="mt-5">
        <div className="grid gap-3 xl:grid-cols-[1.4fr_repeat(6,1fr)_auto]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input className={`${fieldClass} pl-11`} placeholder="Search by resident, ID, booking, receipt, transaction" value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} />
          </label>
          <select aria-label="Branch" className={fieldClass} value={filters.branch} onChange={(event) => updateFilter("branch", event.target.value)}>
            {["All", ...AREAS].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select aria-label="Payment Type" className={fieldClass} value={filters.paymentType} onChange={(event) => updateFilter("paymentType", event.target.value)}>
            {["All", ...PAYMENT_TYPES].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select aria-label="Payment Method" className={fieldClass} value={filters.paymentMethod} onChange={(event) => updateFilter("paymentMethod", event.target.value)}>
            {["All", ...PAYMENT_METHODS].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select aria-label="Payment Status" className={fieldClass} value={filters.paymentStatus} onChange={(event) => updateFilter("paymentStatus", event.target.value)}>
            {["All", ...PAYMENT_STATUSES].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select aria-label="Month" className={fieldClass} value={filters.month} onChange={(event) => updateFilter("month", event.target.value)}>
            {["Current Month", "Last Month", "Custom"].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select aria-label="Year" className={fieldClass} value={filters.year} onChange={(event) => updateFilter("year", event.target.value)}>
            {["All", "2026", "2025"].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <Button type="button" variant="secondary" onClick={resetFilters}>Reset Filters</Button>
        </div>
      </Card>

      <Card className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Monthly Rent Tracking</h2>
            <p className="text-sm text-slate-500">Current Month · Paid, pending, overdue and late fees are calculated from payment history.</p>
          </div>
          <StatusBadge status="Paid" />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {residents.slice(0, 4).map((resident) => {
            const due = calculateRentDue(resident, payments);
            return (
              <div key={resident.id} className="rounded-2xl border border-line bg-paper p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-ink">{resident.fullName}</p>
                    <p className="text-xs text-slate-500">{resident.id} · Room {resident.roomNumber}</p>
                  </div>
                  <StatusBadge status={due.status} />
                </div>
                <div className="mt-3 grid gap-1 text-sm text-slate-600">
                  <p><span className="font-semibold text-ink">Due Date:</span> {formatDate(due.dueDate)}</p>
                  <p><span className="font-semibold text-ink">Paid:</span> {formatCurrency(due.paid)}</p>
                  <p><span className="font-semibold text-ink">Pending:</span> {formatCurrency(due.pendingAmount)}</p>
                  <p><span className="font-semibold text-ink">Late Days:</span> {due.lateDays}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        {[
          ["Monthly Revenue Chart", stats.monthCollection, stats.expectedCollection],
          ["Occupancy Chart", residents.filter((resident) => resident.status === "Active").length, residents.length || 1],
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
        <table className="w-full min-w-[1220px] text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-slate-500">
            <tr>
              {["Receipt No", "Resident", "Branch", "Room", "Bed", "Payment Type", "Amount", "Payment Method", "Payment Date", "Status", "Actions"].map((heading) => (
                <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visiblePayments.map((payment) => (
              <tr key={payment.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-bold text-ink">{payment.receiptNo}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{payment.residentName}</p>
                  <p className="text-xs text-slate-500">{payment.residentId}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{payment.branchName}</td>
                <td className="px-4 py-3 text-slate-600">Room {payment.roomNumber}</td>
                <td className="px-4 py-3 text-slate-600">{payment.bedName}</td>
                <td className="px-4 py-3 text-slate-600">{payment.paymentType}</td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(payment.amount)}</td>
                <td className="px-4 py-3 text-slate-600">{payment.paymentMethod}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(payment.paymentDate)}</td>
                <td className="px-4 py-3"><StatusBadge status={payment.paymentStatus} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setViewPayment(payment)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="View payment">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => { setDrawerPayment(payment); setShowDrawer(true); }} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="Edit payment">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => printPaymentReceipt(payment)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="Download receipt">
                      <Download className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => printPaymentReceipt(payment)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="Print payment">
                      <Printer className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setRefundPayment(payment)} disabled={payment.paymentStatus === "Refunded" || payment.paymentType === "Refund"} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-danger hover:border-danger hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40" aria-label="Refund payment">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!visiblePayments.length && (
              <tr><td colSpan="11" className="px-4 py-8 text-center text-slate-500">No payments match the selected filters.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <p>Showing {visiblePayments.length} of {filteredPayments.length} payments</p>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button>
          <span className="grid min-h-11 place-items-center rounded-xl border border-line px-4 font-semibold text-ink">{page} / {totalPages}</span>
          <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</Button>
        </div>
      </div>

      {showDrawer && <PaymentDrawer payment={drawerPayment} payments={payments} residents={residents} bookings={bookings} onClose={() => setShowDrawer(false)} onSave={savePayment} />}
      {viewPayment && <PaymentViewModal payment={viewPayment} onClose={() => setViewPayment(null)} />}
      {refundPayment && <RefundDialog payment={refundPayment} onClose={() => setRefundPayment(null)} onRefund={processRefund} />}
    </div>
  );
};

export default PaymentsPage;
