import { useEffect, useMemo, useState } from "react";
import {
  loadPaymentNotifications,
  loadPayments,
  loadRentDueConfig,
  savePaymentNotifications,
  savePayments
} from "../data/adminPayments";
import { loadResidents, saveResidents } from "../data/adminResidents";
import { getSocket } from "../services/socket";

export const today = "2026-07-18";
export const currentMonth = "2026-07";

export const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export const formatDate = (value) => {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const paymentMonth = (payment) => payment.month || payment.paymentDate?.slice(0, 7) || currentMonth;

export const createReceiptNo = (payments) => {
  const max = payments.reduce((value, payment) => Math.max(value, Number(payment.receiptNo?.replace(/\D/g, "") || 0)), 0);
  return `RCPT${String(max + 1).padStart(4, "0")}`;
};

export const getRentDueDay = (resident, config = loadRentDueConfig()) =>
  Number(config.branchDueDays?.[resident.branchId] || resident.rentDueDay || config.defaultDueDay || 5);

export const calculateRentDue = (resident, payments, date = today, config = loadRentDueConfig()) => {
  const dueDay = getRentDueDay(resident, config);
  const month = date.slice(0, 7);
  const dueDate = `${month}-${String(dueDay).padStart(2, "0")}`;
  const monthlyRent = Number(resident.monthlyRent || 0);
  const rentPayments = payments.filter((payment) => (
    payment.residentId === resident.id &&
    payment.paymentType === "Monthly Rent" &&
    paymentMonth(payment) === month
  ));
  const paid = rentPayments
    .filter((payment) => payment.paymentStatus === "Paid" || payment.paymentStatus === "Partial")
    .reduce((sum, payment) => sum + Number(payment.paidAmount || payment.amount || 0), 0);
  const pendingAmount = Math.max(monthlyRent - paid, 0);
  const lateDays = pendingAmount > 0 && date > dueDate
    ? Math.floor((new Date(`${date}T00:00:00`) - new Date(`${dueDate}T00:00:00`)) / 86400000)
    : 0;
  const status = pendingAmount === 0 ? "Paid" : paid > 0 ? "Partial" : lateDays > 0 ? "Overdue" : "Pending";

  return { dueDay, dueDate, month, monthlyRent, paid, pendingAmount, lateDays, status };
};

export const calculatePaymentAnalytics = (payments, residents = [], date = today) => {
  const paidPayments = payments.filter((payment) => payment.paymentStatus === "Paid" || payment.paymentStatus === "Partial");
  const weekStart = new Date(`${date}T00:00:00`);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const inCurrentWeek = (payment) => new Date(`${payment.paymentDate}T00:00:00`) >= weekStart && payment.paymentDate <= date;
  const expectedCollection = residents.reduce((sum, resident) => sum + Number(resident.monthlyRent || 0), 0);
  const paidRent = paidPayments
    .filter((payment) => payment.paymentType === "Monthly Rent" && paymentMonth(payment) === currentMonth)
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  return {
    monthlyRevenue: paidPayments.filter((payment) => paymentMonth(payment) === currentMonth).reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    weeklyRevenue: paidPayments.filter(inCurrentWeek).reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    todayCollection: paidPayments.filter((payment) => payment.paymentDate === date).reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    pendingCollection: payments.filter((payment) => payment.paymentStatus === "Pending" || payment.paymentStatus === "Partial").reduce((sum, payment) => sum + Number(payment.amount || 0) - Number(payment.paidAmount || 0), 0),
    expectedCollection,
    securityDepositCollected: paidPayments.filter((payment) => payment.paymentType === "Security Deposit").reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    refunds: payments.filter((payment) => payment.paymentStatus === "Refunded" || payment.paymentType === "Refund").reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    pendingRent: Math.max(expectedCollection - paidRent, 0),
    overduePayments: payments.filter((payment) => payment.paymentStatus === "Overdue").reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  };
};

export const addPaymentNotification = (message, payment) => {
  const notifications = loadPaymentNotifications();
  const nextNotifications = [
    {
      id: `NTF-${Date.now()}`,
      message,
      branchId: payment?.branchId || "",
      branchName: payment?.branchName || "",
      residentName: payment?.residentName || "",
      amount: payment?.amount || 0,
      createdAt: `${today} 10:00`
    },
    ...notifications
  ].slice(0, 40);
  savePaymentNotifications(nextNotifications);
};

export const savePaymentRecord = async (payment) => {
  const payments = loadPayments();
  const receiptNo = payment.receiptNo || createReceiptNo(payments);
  const amount = Number(payment.amount || 0);
  const paidAmount = payment.paymentStatus === "Paid" ? amount : Number(payment.paidAmount || 0);
  const nextPayment = {
    ...payment,
    id: payment.id || receiptNo,
    receiptNo,
    amount,
    paidAmount,
    paymentDate: payment.paymentDate || today,
    paidDate: ["Paid", "Partial"].includes(payment.paymentStatus) ? payment.paymentDate || today : payment.paidDate || "",
    month: payment.month || payment.paymentDate?.slice(0, 7) || currentMonth
  };
  const nextPayments = payments.some((item) => item.id === nextPayment.id)
    ? payments.map((item) => (item.id === nextPayment.id ? nextPayment : item))
    : [nextPayment, ...payments];

  savePayments(nextPayments);
  addPaymentNotification(`${nextPayment.paymentType} ${nextPayment.paymentStatus === "Paid" ? "collected" : "added"} for ${nextPayment.residentName}.`, nextPayment);

  const residents = loadResidents();
  const nextResidents = residents.map((resident) => {
    if (resident.id !== nextPayment.residentId) return resident;
    const due = calculateRentDue(resident, nextPayments);
    return {
      ...resident,
      pendingAmount: due.pendingAmount,
      lastPaymentDate: nextPayment.paymentStatus === "Paid" ? nextPayment.paymentDate : resident.lastPaymentDate,
      paymentHistory: [nextPayment.receiptNo, ...(resident.paymentHistory || [])]
    };
  });
  saveResidents(nextResidents);

  return { payment: nextPayment, payments: nextPayments, residents: nextResidents };
};

export const printPaymentReceipt = (payment) => {
  const receipt = window.open("", "_blank", "width=860,height=960");
  if (!receipt) return;

  const rent = payment.paymentType === "Monthly Rent" ? Number(payment.amount || 0) : 0;
  const deposit = payment.paymentType === "Security Deposit" ? Number(payment.amount || 0) : 0;
  const otherCharges = ["Electricity Charges", "Other Charges", "Fine"].includes(payment.paymentType) ? Number(payment.amount || 0) : 0;
  const total = rent + deposit + otherCharges || Number(payment.amount || 0);

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
          .sign { margin-top: 54px; display: flex; justify-content: space-between; gap: 80px; }
          .line { border-top: 1px solid #1F2937; padding-top: 8px; width: 220px; text-align: center; font-size: 13px; }
          .actions { margin-top: 28px; }
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
          <tr><td class="label">Month</td><td>${payment.month || paymentMonth(payment)}</td></tr>
          <tr><td class="label">Rent</td><td>${formatCurrency(rent)}</td></tr>
          <tr><td class="label">Deposit</td><td>${formatCurrency(deposit)}</td></tr>
          <tr><td class="label">Other Charges</td><td>${formatCurrency(otherCharges)}</td></tr>
          <tr><td class="label">Total</td><td><strong>${formatCurrency(total)}</strong></td></tr>
          <tr><td class="label">Payment Method</td><td>${payment.paymentMethod}</td></tr>
          <tr><td class="label">Collected By</td><td>${payment.collectedBy || payment.createdBy}</td></tr>
        </table>
        <div class="sign">
          <div class="line">Resident Signature</div>
          <div class="line">Authorized Signature</div>
        </div>
        <div class="actions">
          <button onclick="window.print()">Print Receipt / Download PDF</button>
        </div>
      </body>
    </html>
  `);
  receipt.document.close();
  receipt.focus();
};

export const useLivePayments = () => {
  const [payments, setPayments] = useState(() => loadPayments());
  const [notifications, setNotifications] = useState(() => loadPaymentNotifications());

  useEffect(() => {
    const refreshPayments = () => setPayments(loadPayments());
    const refreshNotifications = () => setNotifications(loadPaymentNotifications());
    const socket = getSocket();
    const onPaymentUpdated = () => refreshPayments();

    window.addEventListener("pg:payments-updated", refreshPayments);
    window.addEventListener("pg:payment-notifications-updated", refreshNotifications);
    window.addEventListener("storage", refreshPayments);
    socket.on("payment:updated", onPaymentUpdated);

    return () => {
      window.removeEventListener("pg:payments-updated", refreshPayments);
      window.removeEventListener("pg:payment-notifications-updated", refreshNotifications);
      window.removeEventListener("storage", refreshPayments);
      socket.off("payment:updated", onPaymentUpdated);
    };
  }, []);

  return useMemo(() => ({ payments, notifications }), [payments, notifications]);
};
