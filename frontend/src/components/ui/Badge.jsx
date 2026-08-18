const styles = {
  AVAILABLE: "bg-brand/10 text-brandDark dark:bg-brand/15",
  HELD: "bg-brand/10 text-brandDark dark:bg-brand/15",
  BOOKED: "bg-paper text-brandDark dark:bg-slate-800",
  MAINTENANCE: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100",
  BLOCKED: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  APPROVED: "bg-brand/10 text-brandDark dark:bg-brand/15",
  PENDING_APPROVAL: "bg-brand/10 text-brandDark dark:bg-brand/15",
  PENDING_PAYMENT: "bg-brand/10 text-brandDark dark:bg-brand/15",
  REJECTED: "bg-paper text-brandDark dark:bg-slate-800"
};

const Badge = ({ value }) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[value] || "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100"}`}>
    {String(value || "NA").replaceAll("_", " ")}
  </span>
);

export default Badge;
