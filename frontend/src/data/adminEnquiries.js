import { useEffect, useState } from "react";

export const ENQUIRY_STORAGE_KEY = "pg_admin_enquiries";

export const ENQUIRY_STATUSES = ["NEW", "CONTACTED", "INTERESTED", "NOT_INTERESTED", "CONFIRMED", "REJECTED"];
// An enquiry is still "open" (able to be confirmed, rejected, or duplicate-checked
// against) in any of these; CONFIRMED/REJECTED are terminal.
export const OPEN_ENQUIRY_STATUSES = ["NEW", "CONTACTED", "INTERESTED", "NOT_INTERESTED"];
export const ENQUIRY_REJECTION_REASONS = ["Bed Assigned To Another Guest", "User Unresponsive", "Chose Another PG", "Invalid Details", "Other"];

export const loadEnquiries = () => {
  const stored = localStorage.getItem(ENQUIRY_STORAGE_KEY);
  const allowed = new Set(["anna-nagar", "virugambakkam"]);
  return (stored ? JSON.parse(stored) : []).filter((enquiry) => allowed.has(enquiry.branchId));
};

export const saveEnquiries = (enquiries) => {
  const allowed = new Set(["anna-nagar", "virugambakkam"]);
  const scopedEnquiries = enquiries.filter((enquiry) => allowed.has(enquiry.branchId));
  localStorage.setItem(ENQUIRY_STORAGE_KEY, JSON.stringify(scopedEnquiries));
  window.dispatchEvent(new CustomEvent("pg:enquiries-updated", { detail: { enquiries: scopedEnquiries } }));
};

export const tokenAmountForRoom = (room) => Math.min(5000, Number(room?.monthlyRent || 0));

// A bed keeps accepting enquiries from different users until this many are open;
// admin still has to pick one of them — the bed is never auto-assigned at the cap.
export const MAX_ENQUIRIES_PER_BED = 3;

export const enquiryLimitMessage = (bedLabel) =>
  `${MAX_ENQUIRIES_PER_BED} people have already enquired for ${bedLabel || "this bed"}. The admin will choose one user — please consider another available bed.`;

// A user may enquire about a bed only once (userId+bedId, or email+bedId for
// enquiries made before auth wiring). This checks against every prior enquiry
// for that bed regardless of status, matching the "one enquiry per user per bed" rule.
export const findEnquiryForUserAndBed = (enquiries, user, bedId) => {
  const userId = user?.id;
  const email = user?.email;
  return enquiries.find((enquiry) => enquiry.bedId === bedId && ((userId && enquiry.userId === userId) || (email && enquiry.email === email)));
};

// Enquiry volume on a bed never implies it's unavailable — REJECTED/NOT_INTERESTED
// enquiries no longer represent live interest, so they don't count toward the badge.
export const countActiveEnquiriesForBed = (enquiries, bedId) =>
  enquiries.filter((enquiry) => enquiry.bedId === bedId && OPEN_ENQUIRY_STATUSES.includes(enquiry.status)).length;

// Bed status always wins over enquiry volume: an assigned/booked bed shows as
// such even if it still has a long enquiry history sitting underneath it.
export const bedEnquiryBadge = (bedStatus, activeEnquiryCount) => {
  if (["Reserved", "Occupied"].includes(bedStatus)) return { tone: "assigned", label: "Assigned", atLimit: false };
  if (activeEnquiryCount > 0) return {
    tone: "enquiries",
    label: `${activeEnquiryCount} ${activeEnquiryCount === 1 ? "Enquiry" : "Enquiries"}`,
    atLimit: activeEnquiryCount >= MAX_ENQUIRIES_PER_BED
  };
  return { tone: "available", label: "Available", atLimit: false };
};

export const useLiveEnquiries = () => {
  const [enquiries, setEnquiries] = useState(loadEnquiries);
  useEffect(() => {
    const refresh = () => setEnquiries(loadEnquiries());
    window.addEventListener("pg:enquiries-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("pg:enquiries-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return enquiries;
};
