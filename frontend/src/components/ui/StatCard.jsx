import Card from "./Card";

const StatCard = ({ label, value, helper }) => (
  <Card className="p-4">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
    {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
  </Card>
);

export default StatCard;
