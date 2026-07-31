import { Armchair } from "lucide-react";

const stateStyles = {
  AVAILABLE: "border-brand/30 bg-brand/10 text-brandDark hover:bg-paper",
  HELD: "border-brand/30 bg-brand/10 text-brandDark",
  BOOKED: "border-brand/30 bg-paper text-brandDark",
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
