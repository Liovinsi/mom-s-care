export const PAYMENT_STORAGE_KEY = "pg_admin_payments";

export const PAYMENT_TYPES = ["Booking Token", "Security Deposit", "Monthly Rent", "Electricity Charges", "Other Charges", "Refund", "Fine"];
export const RECORD_PAYMENT_TYPES = ["Monthly Rent", "Security Deposit", "Electricity Charges", "Other Charges", "Booking Token", "Fine"];
export const PAYMENT_METHODS = ["Cash", "UPI", "Card", "Bank Transfer"];
export const PAYMENT_STATUSES = ["Paid", "Pending", "Overdue", "Partial", "Refunded"];
export const RENT_DUE_CONFIG_KEY = "pg_payment_rent_due_config";
export const PAYMENT_NOTIFICATION_KEY = "pg_payment_notifications";

const proofImage = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=82";

export const defaultPayments = [
  {
    id: "RCPT0001",
    receiptNo: "RCPT0001",
    residentId: "RES0001",
    residentName: "Rahul Kumar",
    bookingId: "BK0001",
    branchId: "anna-nagar",
    branchName: "Anna Nagar",
    roomId: "anna-101",
    roomNumber: "101",
    bedId: "anna-101-bed-a",
    bedName: "Bed A",
    paymentType: "Monthly Rent",
    amount: 16000,
    paymentMethod: "UPI",
    transactionId: "TXN-RK-JUL-001",
    referenceNumber: "UPI987651",
    paymentDate: "2026-07-05",
    paymentStatus: "Paid",
    remarks: "July monthly rent collected.",
    paymentProof: proofImage,
    proofName: "rahul-july-rent.jpg",
    proofType: "image/jpeg",
    createdBy: "Admin",
    collectedBy: "Priya Raman",
    month: "2026-07",
    monthlyRent: 16000,
    paidAmount: 16000,
    lateFees: 0,
    originalPaymentId: "",
    refundReason: "",
    refundMethod: ""
  },
  {
    id: "RCPT0002",
    receiptNo: "RCPT0002",
    residentId: "RES0002",
    residentName: "Priya Sharma",
    bookingId: "BK0002",
    branchId: "velachery",
    branchName: "Velachery",
    roomId: "vela-301",
    roomNumber: "302",
    bedId: "vela-301-bed-c",
    bedName: "Bed C",
    paymentType: "Booking Token",
    amount: 5000,
    paymentMethod: "Credit Card",
    transactionId: "TXN-PS-TKN-002",
    referenceNumber: "CARD22109",
    paymentDate: "2026-07-15",
    paymentStatus: "Paid",
    remarks: "Booking token received.",
    paymentProof: proofImage,
    proofName: "priya-token.png",
    proofType: "image/png",
    createdBy: "Admin",
    collectedBy: "Lakshmi Narayanan",
    month: "2026-07",
    monthlyRent: 17000,
    paidAmount: 5000,
    lateFees: 0,
    originalPaymentId: "",
    refundReason: "",
    refundMethod: ""
  },
  {
    id: "RCPT0003",
    receiptNo: "RCPT0003",
    residentId: "RES0003",
    residentName: "Ananya Iyer",
    bookingId: "BK0004",
    branchId: "guindy",
    branchName: "Guindy",
    roomId: "guindy-401",
    roomNumber: "401",
    bedId: "guindy-401-bed-a",
    bedName: "Bed A",
    paymentType: "Security Deposit",
    amount: 48000,
    paymentMethod: "Bank Transfer",
    transactionId: "NEFT-GDY-48000",
    referenceNumber: "BNK554201",
    paymentDate: "2026-07-10",
    paymentStatus: "Paid",
    remarks: "Deposit paid before check-in.",
    paymentProof: proofImage,
    proofName: "ananya-deposit.jpg",
    proofType: "image/jpeg",
    createdBy: "Admin",
    collectedBy: "Mohan Das",
    month: "2026-07",
    monthlyRent: 24000,
    paidAmount: 48000,
    lateFees: 0,
    originalPaymentId: "",
    refundReason: "",
    refundMethod: ""
  },
  {
    id: "RCPT0004",
    receiptNo: "RCPT0004",
    residentId: "RES0004",
    residentName: "Naveen Raj",
    bookingId: "BK0003",
    branchId: "tambaram",
    branchName: "Tambaram",
    roomId: "tamb-201",
    roomNumber: "201",
    bedId: "tamb-201-bed-b",
    bedName: "Bed B",
    paymentType: "Monthly Rent",
    amount: 8000,
    paymentMethod: "Cash",
    transactionId: "",
    referenceNumber: "CASH-JUL-004",
    paymentDate: "2026-07-14",
    paymentStatus: "Pending",
    remarks: "Partial rent pending settlement.",
    paymentProof: "",
    proofName: "",
    proofType: "",
    createdBy: "Admin",
    collectedBy: "Ramesh Babu",
    month: "2026-07",
    monthlyRent: 12500,
    paidAmount: 8000,
    lateFees: 0,
    originalPaymentId: "",
    refundReason: "",
    refundMethod: ""
  },
  {
    id: "RCPT0005",
    receiptNo: "RCPT0005",
    residentId: "RES0005",
    residentName: "Karthik S",
    bookingId: "BK-TN-203A",
    branchId: "t-nagar",
    branchName: "T Nagar",
    roomId: "tnagar-203",
    roomNumber: "203",
    bedId: "tnagar-203-bed-a",
    bedName: "Bed A",
    paymentType: "Refund",
    amount: 6000,
    paymentMethod: "UPI",
    transactionId: "RFND-TN-006",
    referenceNumber: "UPIRF554",
    paymentDate: "2026-07-16",
    paymentStatus: "Refunded",
    remarks: "Security deposit balance refunded after check-out.",
    paymentProof: proofImage,
    proofName: "karthik-refund.jpg",
    proofType: "image/jpeg",
    createdBy: "Admin",
    collectedBy: "Janani S",
    month: "2026-07",
    monthlyRent: 18000,
    paidAmount: 6000,
    lateFees: 0,
    originalPaymentId: "RCPT0003",
    refundReason: "Check-out settlement",
    refundMethod: "UPI"
  },
  {
    id: "RCPT0006",
    receiptNo: "RCPT0006",
    residentId: "RES0001",
    residentName: "Rahul Kumar",
    bookingId: "BK0001",
    branchId: "anna-nagar",
    branchName: "Anna Nagar",
    roomId: "anna-101",
    roomNumber: "101",
    bedId: "anna-101-bed-a",
    bedName: "Bed A",
    paymentType: "Fine",
    amount: 500,
    paymentMethod: "Debit Card",
    transactionId: "FINE-RK-006",
    referenceNumber: "DBT33001",
    paymentDate: "2026-06-20",
    paymentStatus: "Paid",
    remarks: "Late access card replacement fine.",
    paymentProof: proofImage,
    proofName: "rahul-fine.jpg",
    proofType: "image/jpeg",
    createdBy: "Admin",
    collectedBy: "Priya Raman",
    month: "2026-06",
    monthlyRent: 16000,
    paidAmount: 500,
    lateFees: 0,
    originalPaymentId: "",
    refundReason: "",
    refundMethod: ""
  },
  {
    id: "RCPT0007",
    receiptNo: "RCPT0007",
    residentId: "RES0003",
    residentName: "Ananya Iyer",
    bookingId: "BK0004",
    branchId: "guindy",
    branchName: "Guindy",
    roomId: "guindy-401",
    roomNumber: "401",
    bedId: "guindy-401-bed-a",
    bedName: "Bed A",
    paymentType: "Monthly Rent",
    amount: 24000,
    paymentMethod: "Cheque",
    transactionId: "CHQ998721",
    referenceNumber: "CHQ998721",
    paymentDate: "2026-07-01",
    paymentStatus: "Overdue",
    remarks: "Cheque clearance delayed.",
    paymentProof: "",
    proofName: "",
    proofType: "",
    createdBy: "Admin",
    collectedBy: "Mohan Das",
    month: "2026-07",
    monthlyRent: 24000,
    paidAmount: 0,
    lateFees: 250,
    originalPaymentId: "",
    refundReason: "",
    refundMethod: ""
  }
];

export const loadPayments = () => {
  const stored = localStorage.getItem(PAYMENT_STORAGE_KEY);
  return stored ? JSON.parse(stored) : defaultPayments;
};

export const savePayments = (payments) => {
  localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(payments));
  window.dispatchEvent(new CustomEvent("pg:payments-updated", { detail: { payments } }));
};

export const createPaymentReceiptNo = (payments) => {
  const max = payments.reduce((value, payment) => Math.max(value, Number(String(payment.receiptNo || payment.id || "").replace(/\D/g, "") || 0)), 0);
  return `RCPT${String(max + 1).padStart(4, "0")}`;
};

export const loadRentDueConfig = () => {
  const stored = localStorage.getItem(RENT_DUE_CONFIG_KEY);
  return stored ? JSON.parse(stored) : { defaultDueDay: 5, branchDueDays: {} };
};

export const saveRentDueConfig = (config) => {
  localStorage.setItem(RENT_DUE_CONFIG_KEY, JSON.stringify(config));
  window.dispatchEvent(new CustomEvent("pg:rent-config-updated", { detail: { config } }));
};

export const loadPaymentNotifications = () => {
  const stored = localStorage.getItem(PAYMENT_NOTIFICATION_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const savePaymentNotifications = (notifications) => {
  localStorage.setItem(PAYMENT_NOTIFICATION_KEY, JSON.stringify(notifications));
  window.dispatchEvent(new CustomEvent("pg:payment-notifications-updated", { detail: { notifications } }));
};
