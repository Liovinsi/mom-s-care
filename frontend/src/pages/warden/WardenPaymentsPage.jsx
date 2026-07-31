import { Eye, History, Printer, ReceiptText, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import { useAuth } from "../../context/AuthContext";
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "../../data/adminPayments";
import { loadResidents } from "../../data/adminResidents";
import { loadWardens } from "../../data/adminWardens";
import { calculateRentDue, currentMonth, formatCurrency, formatDate, savePaymentRecord, today, useLivePayments } from "../../lib/livePayments";

const rowsPerPage = 8;
const fieldClass = "min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/25 disabled:bg-paper disabled:text-slate-500";

const statusStyles = {
  Paid: "bg-brand/10 text-brandDark",
  Pending: "bg-brand/10 text-brandDark",
  Partial: "bg-brand/10 text-brandDark",
  Overdue: "bg-paper text-brandDark"
};

const annaNagarDummyResidents = [
  {
    id: "RES001",
    fullName: "Rahul Kumar",
    phone: "9876542101",
    branchId: "anna-nagar",
    branchName: "Anna Nagar",
    roomId: "anna-101",
    roomNumber: "101",
    bedId: "anna-101-bed-a",
    bedName: "Bed A",
    monthlyRent: 8000,
    rentDueDay: 31,
    securityDeposit: 16000,
    pendingAmount: 8000,
    lastPaymentDate: "",
    paymentHistory: [],
    status: "Active"
  },
  {
    id: "RES002",
    fullName: "Priya Sharma",
    phone: "9876542102",
    branchId: "anna-nagar",
    branchName: "Anna Nagar",
    roomId: "anna-203",
    roomNumber: "203",
    bedId: "anna-203-bed-c",
    bedName: "Bed C",
    monthlyRent: 9500,
    securityDeposit: 19000,
    pendingAmount: 0,
    lastPaymentDate: today,
    paymentHistory: ["RCPT-SEED-002"],
    status: "Active"
  }
];

const seedPaymentHistory = [
  {
    id: "RCPT-SEED-002",
    receiptNo: "RCPT-SEED-002",
    residentId: "RES002",
    residentName: "Priya Sharma",
    branchId: "anna-nagar",
    branchName: "Anna Nagar",
    roomNumber: "203",
    bedName: "Bed C",
    paymentType: "Monthly Rent",
    amount: 9500,
    paidAmount: 9500,
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    paymentDate: today,
    paidDate: today,
    collectedBy: "Arun Kumar",
    month: currentMonth,
    monthlyRent: 9500,
    securityDeposit: 19000,
    electricityCharges: 0,
    otherCharges: 0,
    discount: 0,
    lateFees: 0
  }
];

const getAssignedBranch = (user, wardens) => {
  const assignedWarden = wardens.find((warden) => (
    warden.employeeId === user?.employeeId ||
    warden.email === user?.email ||
    `${warden.firstName} ${warden.lastName}` === user?.name
  ));

  return {
    id: user?.branchId || assignedWarden?.branchId || "anna-nagar",
    name: user?.branchName || assignedWarden?.branchName || "Anna Nagar"
  };
};

const StatusBadge = ({ status }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[status] || statusStyles.Pending}`}>{status}</span>
);

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
    {children}
  </label>
);

const uniqueResidents = (residents) => {
  const seen = new Set();
  return residents.filter((resident) => {
    if (seen.has(resident.id)) return false;
    seen.add(resident.id);
    return true;
  });
};

const allBranchPayments = (payments, branchId) => [...seedPaymentHistory, ...payments].filter((payment) => payment.branchId === branchId);

const residentLedgerRow = (resident, payments) => {
  const due = calculateRentDue(resident, payments);
  const lastRentPayment = payments.find((payment) => payment.residentId === resident.id && payment.paymentType === "Monthly Rent");
  return {
    ...resident,
    dueDate: due.dueDate,
    pendingAmount: resident.pendingAmount === 0 ? 0 : due.pendingAmount || resident.pendingAmount,
    paymentStatus: resident.pendingAmount === 0 ? "Paid" : due.status,
    paidAmount: due.paid,
    lastPaymentMethod: lastRentPayment?.paymentMethod || "Cash"
  };
};

const printReceipt = (payment) => {
  const receipt = window.open("", "_blank", "width=860,height=960");
  if (!receipt) return;

  receipt.document.write(`
    <html>
      <head>
        <title>Fee Receipt ${payment.receiptNo}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #1F2937; padding: 32px; }
          .top { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #DD5E67; padding-bottom: 18px; }
          .logo { width: 72px; height: 72px; object-fit: cover; border-radius: 16px; }
          h1 { margin: 8px 0 0; font-size: 28px; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          td { border: 1px solid #E5E5E5; padding: 12px; font-size: 14px; }
          .label { width: 35%; background: #FFF4F6; font-weight: 700; }
          .actions { margin-top: 28px; display: flex; gap: 12px; }
          button { background: #DD5E67; border: 0; color: white; padding: 12px 18px; border-radius: 10px; font-weight: 700; }
          @media print { .actions { display: none; } }
        </style>
      </head>
      <body>
        <div class="top">
          <div>
            <img class="logo" src="/logo.jpeg" alt="PG Stay logo" />
            <h1>Fee Receipt</h1>
            <p>${payment.branchName}</p>
          </div>
          <div>
            <p><strong>Receipt Number:</strong> ${payment.receiptNo}</p>
            <p><strong>Collected Date:</strong> ${formatDate(payment.paymentDate)}</p>
          </div>
        </div>
        <table>
          <tr><td class="label">Resident Name</td><td>${payment.residentName}</td></tr>
          <tr><td class="label">Resident ID</td><td>${payment.residentId}</td></tr>
          <tr><td class="label">Room Number</td><td>Room ${payment.roomNumber}</td></tr>
          <tr><td class="label">Bed Number</td><td>${payment.bedName}</td></tr>
          <tr><td class="label">Month</td><td>${payment.month}</td></tr>
          <tr><td class="label">Rent</td><td>${formatCurrency(payment.monthlyRent)}</td></tr>
          <tr><td class="label">Security Deposit</td><td>${formatCurrency(payment.securityDeposit)}</td></tr>
          <tr><td class="label">Other Charges</td><td>${formatCurrency(Number(payment.electricityCharges || 0) + Number(payment.otherCharges || 0) + Number(payment.lateFees || 0))}</td></tr>
          <tr><td class="label">Discount</td><td>${formatCurrency(payment.discount)}</td></tr>
          <tr><td class="label">Total Paid</td><td><strong>${formatCurrency(payment.amount)}</strong></td></tr>
          <tr><td class="label">Payment Method</td><td>${payment.paymentMethod}</td></tr>
          <tr><td class="label">Collected By</td><td>${payment.collectedBy}</td></tr>
        </table>
        <div class="actions">
          <button onclick="window.print()">Print Button</button>
          <button onclick="window.print()">Download PDF Button</button>
        </div>
      </body>
    </html>
  `);
  receipt.document.close();
  receipt.focus();
};

const ResidentDetailsModal = ({ row, onClose }) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4">
    <Card className="w-full max-w-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">{row.fullName}</h2>
          <p className="text-sm text-slate-500">{row.id} · Room {row.roomNumber} · {row.bedName}</p>
        </div>
        <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:border-brandDark hover:text-brandDark" aria-label="Close"><X className="h-4 w-4" /></button>
      </div>
      <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        {[
          ["Branch", row.branchName],
          ["Phone Number", row.phone],
          ["Monthly Rent", formatCurrency(row.monthlyRent)],
          ["Pending Amount", formatCurrency(row.pendingAmount)],
          ["Due Date", formatDate(row.dueDate)],
          ["Payment Status", row.paymentStatus]
        ].map(([label, value]) => <p key={label}><span className="font-semibold text-ink">{label}:</span> {value}</p>)}
      </div>
    </Card>
  </div>
);

const HistoryModal = ({ resident, payments, onClose }) => {
  const history = payments.filter((payment) => payment.residentId === resident.id);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/40 px-4 py-8">
      <Card className="w-full max-w-5xl overflow-x-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-ink">Payment History</h2>
            <p className="text-sm text-slate-500">{resident.fullName} · {resident.id}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:border-brandDark hover:text-brandDark" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <table className="mt-5 w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-slate-500">
            <tr>
              {["Receipt Number", "Resident", "Month", "Amount", "Payment Method", "Paid Date", "Collected By", "Status", "Action"].map((heading) => (
                <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((payment) => (
              <tr key={payment.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-bold text-ink">{payment.receiptNo}</td>
                <td className="px-4 py-3 text-slate-600">{payment.residentName}</td>
                <td className="px-4 py-3 text-slate-600">{payment.month}</td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(payment.amount)}</td>
                <td className="px-4 py-3 text-slate-600">{payment.paymentMethod}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(payment.paidDate || payment.paymentDate)}</td>
                <td className="px-4 py-3 text-slate-600">{payment.collectedBy}</td>
                <td className="px-4 py-3"><StatusBadge status={payment.paymentStatus} /></td>
                <td className="px-4 py-3">
                  <Button type="button" variant="secondary" className="min-h-9 px-3 py-1.5" onClick={() => printReceipt(payment)}><Printer className="h-4 w-4" /> Print</Button>
                </td>
              </tr>
            ))}
            {!history.length && <tr><td colSpan="9" className="px-4 py-8 text-center text-slate-500">No payment history yet.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

const CollectPaymentModal = ({ row, collectorName, onClose, onSaved }) => {
  const [form, setForm] = useState({
    securityDeposit: 0,
    electricityCharges: 0,
    otherCharges: 0,
    discount: 0,
    lateFees: row.paymentStatus === "Overdue" ? 250 : 0,
    paymentMethod: "Cash",
    referenceNumber: "",
    remarks: ""
  });

  const grandTotal = Math.max(
    Number(row.pendingAmount || 0) +
      Number(form.securityDeposit || 0) +
      Number(form.electricityCharges || 0) +
      Number(form.otherCharges || 0) +
      Number(form.lateFees || 0) -
      Number(form.discount || 0),
    0
  );

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!grandTotal) return;

    const { payment } = await savePaymentRecord({
      residentId: row.id,
      residentName: row.fullName,
      bookingId: row.bookingId,
      branchId: row.branchId,
      branchName: row.branchName,
      roomId: row.roomId,
      roomNumber: row.roomNumber,
      bedId: row.bedId,
      bedName: row.bedName,
      paymentType: "Monthly Rent",
      amount: grandTotal,
      paidAmount: grandTotal,
      paymentMethod: form.paymentMethod,
      paymentStatus: "Paid",
      paymentDate: today,
      paidDate: today,
      transactionId: form.referenceNumber,
      referenceNumber: form.referenceNumber,
      remarks: form.remarks,
      createdBy: collectorName,
      collectedBy: collectorName,
      month: currentMonth,
      monthlyRent: row.monthlyRent,
      securityDeposit: Number(form.securityDeposit || 0),
      electricityCharges: Number(form.electricityCharges || 0),
      otherCharges: Number(form.otherCharges || 0),
      discount: Number(form.discount || 0),
      lateFees: Number(form.lateFees || 0)
    });

    onSaved(payment);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/40 px-4 py-8">
      <form onSubmit={submit} className="w-full max-w-4xl rounded-[18px] border border-line bg-white p-5 shadow-luxury">
        <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
          <div>
            <h2 className="text-xl font-bold text-ink">Collect Payment</h2>
            <p className="text-sm text-slate-500">{row.fullName} · {row.id}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:border-brandDark hover:text-brandDark" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            ["Resident Name", row.fullName],
            ["Resident ID", row.id],
            ["Branch", row.branchName],
            ["Room Number", `Room ${row.roomNumber}`],
            ["Bed Number", row.bedName],
            ["Monthly Rent", formatCurrency(row.monthlyRent)],
            ["Pending Amount", formatCurrency(row.pendingAmount)]
          ].map(([label, value]) => (
            <Field key={label} label={label}><input className={fieldClass} value={value} disabled /></Field>
          ))}
          <Field label="Security Deposit"><input type="number" min="0" className={fieldClass} value={form.securityDeposit} onChange={(event) => update("securityDeposit", event.target.value)} /></Field>
          <Field label="Electricity Charges"><input type="number" min="0" className={fieldClass} value={form.electricityCharges} onChange={(event) => update("electricityCharges", event.target.value)} /></Field>
          <Field label="Other Charges"><input type="number" min="0" className={fieldClass} value={form.otherCharges} onChange={(event) => update("otherCharges", event.target.value)} /></Field>
          <Field label="Discount"><input type="number" min="0" className={fieldClass} value={form.discount} onChange={(event) => update("discount", event.target.value)} /></Field>
          <Field label="Late Fee"><input type="number" min="0" className={fieldClass} value={form.lateFees} onChange={(event) => update("lateFees", event.target.value)} /></Field>
          <Field label="Payment Method">
            <select className={fieldClass} value={form.paymentMethod} onChange={(event) => update("paymentMethod", event.target.value)}>
              {PAYMENT_METHODS.map((method) => <option key={method} value={method}>{method}</option>)}
            </select>
          </Field>
          <Field label="Reference Number (Optional)"><input className={fieldClass} value={form.referenceNumber} onChange={(event) => update("referenceNumber", event.target.value)} /></Field>
          <Field label="Grand Total"><input className={`${fieldClass} font-bold text-ink`} value={formatCurrency(grandTotal)} disabled /></Field>
          <div className="md:col-span-2">
            <Field label="Remarks (Optional)"><textarea className={`${fieldClass} min-h-24 py-3`} value={form.remarks} onChange={(event) => update("remarks", event.target.value)} /></Field>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-line pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit"><ReceiptText className="h-4 w-4" /> Collect Payment</Button>
        </div>
      </form>
    </div>
  );
};

const WardenPaymentsPage = () => {
  const { user } = useAuth();
  const wardens = useMemo(loadWardens, []);
  const assignedBranch = useMemo(() => getAssignedBranch(user, wardens), [user, wardens]);
  const collectorName = user?.name || "Warden";
  const baseResidents = useMemo(() => loadResidents().filter((resident) => resident.branchId === assignedBranch.id), [assignedBranch.id]);
  const residents = useMemo(() => uniqueResidents([...(assignedBranch.id === "anna-nagar" ? annaNagarDummyResidents : []), ...baseResidents]), [assignedBranch.id, baseResidents]);
  const { payments } = useLivePayments();
  const branchPayments = useMemo(() => allBranchPayments(payments, assignedBranch.id), [payments, assignedBranch.id]);
  const rows = useMemo(() => residents.map((resident) => residentLedgerRow(resident, branchPayments)), [residents, branchPayments]);
  const [filters, setFilters] = useState({ search: "", status: "All", month: "Current Month", method: "All" });
  const [page, setPage] = useState(1);
  const [viewRow, setViewRow] = useState(null);
  const [collectRow, setCollectRow] = useState(null);
  const [historyRow, setHistoryRow] = useState(null);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [notice, setNotice] = useState("");

  const stats = useMemo(() => {
    const paidResidents = rows.filter((row) => row.paymentStatus === "Paid").length;
    const pendingPayments = rows.filter((row) => ["Pending", "Partial"].includes(row.paymentStatus)).reduce((sum, row) => sum + Number(row.pendingAmount || 0), 0);
    const overduePayments = rows.filter((row) => row.paymentStatus === "Overdue").reduce((sum, row) => sum + Number(row.pendingAmount || 0), 0);
    const paidPayments = branchPayments.filter((payment) => payment.paymentStatus === "Paid" && payment.paymentType === "Monthly Rent");
    return {
      todayCollection: paidPayments.filter((payment) => payment.paymentDate === today).reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      monthlyCollection: paidPayments.filter((payment) => payment.month === currentMonth).reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      pendingPayments,
      overduePayments,
      paidResidents
    };
  }, [rows, branchPayments]);

  const filteredRows = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !search || [row.fullName, row.id, row.roomNumber, row.bedName, row.phone].some((value) => String(value || "").toLowerCase().includes(search));
      const matchesStatus = filters.status === "All" || row.paymentStatus === filters.status;
      const residentPayments = branchPayments.filter((payment) => payment.residentId === row.id);
      const matchesMonth = filters.month === "Current Month" || residentPayments.some((payment) => payment.month !== currentMonth);
      const matchesMethod = filters.method === "All" || residentPayments.some((payment) => payment.paymentMethod === filters.method) || row.lastPaymentMethod === filters.method;
      return matchesSearch && matchesStatus && matchesMonth && matchesMethod;
    });
  }, [rows, branchPayments, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const visibleRows = filteredRows.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const resetFilters = () => {
    setFilters({ search: "", status: "All", month: "Current Month", method: "All" });
    setPage(1);
  };

  const handleSaved = (payment) => {
    setCollectRow(null);
    setLastReceipt(payment);
    setNotice("Payment collected successfully.");
    printReceipt(payment);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Payments</h1>
          <p className="text-sm text-slate-500">Collect monthly rent for residents in your assigned branch.</p>
        </div>
        <div className="rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm font-semibold text-brand">Assigned Branch: {assignedBranch.name}</div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Today's Collection" value={formatCurrency(stats.todayCollection)} />
        <StatCard label="Monthly Collection" value={formatCurrency(stats.monthlyCollection)} />
        <StatCard label="Pending Payments" value={formatCurrency(stats.pendingPayments)} />
        <StatCard label="Overdue Payments" value={formatCurrency(stats.overduePayments)} />
        <StatCard label="Total Paid Residents" value={stats.paidResidents} />
      </div>

      {notice && (
        <Card className="mt-5 border-brand/30 bg-brand/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ink">{notice}</p>
            {lastReceipt && (
              <Button type="button" variant="secondary" onClick={() => printReceipt(lastReceipt)}>
                <Printer className="h-4 w-4" /> Print Receipt
              </Button>
            )}
          </div>
        </Card>
      )}

      <Card className="mt-5">
        <div className="grid gap-3 xl:grid-cols-[1.5fr_repeat(3,1fr)_auto]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input className={`${fieldClass} pl-11`} placeholder="Search by Resident Name, ID, Room, Bed, Phone" value={filters.search} onChange={(event) => { setFilters((current) => ({ ...current, search: event.target.value })); setPage(1); }} />
          </label>
          <select className={fieldClass} value={filters.status} onChange={(event) => { setFilters((current) => ({ ...current, status: event.target.value })); setPage(1); }}>
            {["All", "Pending", "Paid", "Partial", "Overdue"].map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <select className={fieldClass} value={filters.month} onChange={(event) => { setFilters((current) => ({ ...current, month: event.target.value })); setPage(1); }}>
            {["Current Month", "Previous Months"].map((month) => <option key={month} value={month}>{month}</option>)}
          </select>
          <select className={fieldClass} value={filters.method} onChange={(event) => { setFilters((current) => ({ ...current, method: event.target.value })); setPage(1); }}>
            {["All", ...PAYMENT_METHODS].map((method) => <option key={method} value={method}>{method}</option>)}
          </select>
          <Button type="button" variant="secondary" onClick={resetFilters}>Reset Filters</Button>
        </div>
      </Card>

      <Card className="mt-5 overflow-x-auto p-0">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-slate-500">
            <tr>
              {["Resident ID", "Resident Name", "Room", "Bed", "Monthly Rent", "Pending Amount", "Due Date", "Payment Status", "Actions"].map((heading) => (
                <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-bold text-ink">{row.id}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{row.fullName}</p>
                  <p className="text-xs text-slate-500">{row.phone}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">Room {row.roomNumber}</td>
                <td className="px-4 py-3 text-slate-600">{row.bedName}</td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(row.monthlyRent)}</td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(row.pendingAmount)}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(row.dueDate)}</td>
                <td className="px-4 py-3"><StatusBadge status={row.paymentStatus} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setViewRow(row)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="View payment row"><Eye className="h-4 w-4" /></button>
                    <button type="button" onClick={() => setCollectRow(row)} disabled={row.paymentStatus === "Paid"} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark disabled:cursor-not-allowed disabled:opacity-40" aria-label="Collect payment"><ReceiptText className="h-4 w-4" /></button>
                    <button type="button" onClick={() => { const payment = branchPayments.find((item) => item.residentId === row.id); if (payment) printReceipt(payment); }} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="Print receipt"><Printer className="h-4 w-4" /></button>
                    <button type="button" onClick={() => setHistoryRow(row)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="Payment history"><History className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!visibleRows.length && <tr><td colSpan="9" className="px-4 py-8 text-center text-slate-500">No residents match the selected filters.</td></tr>}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <p>Showing {visibleRows.length} of {filteredRows.length} residents</p>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button>
          <span className="grid min-h-11 place-items-center rounded-xl border border-line px-4 font-semibold text-ink">{page} / {totalPages}</span>
          <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</Button>
        </div>
      </div>

      {viewRow && <ResidentDetailsModal row={viewRow} onClose={() => setViewRow(null)} />}
      {collectRow && <CollectPaymentModal row={collectRow} collectorName={collectorName} onClose={() => setCollectRow(null)} onSaved={handleSaved} />}
      {historyRow && <HistoryModal resident={historyRow} payments={branchPayments} onClose={() => setHistoryRow(null)} />}
    </div>
  );
};

export default WardenPaymentsPage;
