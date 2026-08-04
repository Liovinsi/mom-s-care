const styles = {
  AVAILABLE: "bg-brand/10 text-brandDark",
  HELD: "bg-brand/10 text-brandDark",
  BOOKED: "bg-paper text-brandDark",
  MAINTENANCE: "bg-slate-100 text-slate-700",
  BLOCKED: "bg-orange-100 text-orange-700",
  APPROVED: "bg-brand/10 text-brandDark",
  PENDING_APPROVAL: "bg-brand/10 text-brandDark",
  PENDING_PAYMENT: "bg-brand/10 text-brandDark",
  REJECTED: "bg-paper text-brandDark"
};

const Badge = ({ value }) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[value] || "bg-slate-100 text-slate-700"}`}>
    {String(value || "NA").replaceAll("_", " ")}
  </span>
);

export default Badge;
