import { Armchair } from "lucide-react";

const stateStyles = {
  AVAILABLE: "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  HELD: "border-amber-300 bg-amber-50 text-amber-700",
  BOOKED: "border-red-300 bg-red-50 text-red-700",
  MAINTENANCE: "border-slate-300 bg-slate-100 text-slate-500"
};

const BedGrid = ({ beds, selectedBed, onSelect }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
    {beds.map((bed) => {
      const selected = selectedBed?._id === bed._id;
      const disabled = bed.status !== "AVAILABLE";
      return (
        <button
          key={bed._id}
          disabled={disabled}
          onClick={() => onSelect(bed)}
          className={`min-h-24 rounded-lg border p-3 text-left transition disabled:cursor-not-allowed ${stateStyles[bed.status]} ${selected ? "ring-2 ring-mint ring-offset-2" : ""}`}
        >
          <Armchair className="mb-2 h-5 w-5" />
          <span className="block text-sm font-bold">Bed {bed.label}</span>
          <span className="block text-xs">{bed.status}</span>
        </button>
      );
    })}
  </div>
);

export default BedGrid;
