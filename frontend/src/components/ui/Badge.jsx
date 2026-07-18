const styles = {
  AVAILABLE: "bg-emerald-50 text-emerald-700",
  HELD: "bg-amber-50 text-amber-700",
  BOOKED: "bg-red-50 text-red-700",
  MAINTENANCE: "bg-slate-100 text-slate-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  PENDING_APPROVAL: "bg-amber-50 text-amber-700",
  PENDING_PAYMENT: "bg-blue-50 text-blue-700",
  REJECTED: "bg-red-50 text-red-700"
};

const Badge = ({ value }) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[value] || "bg-slate-100 text-slate-700"}`}>
    {String(value || "NA").replaceAll("_", " ")}
  </span>
);

export default Badge;
