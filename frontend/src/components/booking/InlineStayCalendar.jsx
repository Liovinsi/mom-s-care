import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useRef } from "react";

const toDateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatFieldDate = (value, placeholder) => value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : placeholder;

const InlineStayCalendar = ({ startDate, endDate, activeField, onActiveFieldChange, onStartDateChange, onEndDateChange }) => {
  const scrollerRef = useRef(null);
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);
  const days = useMemo(() => Array.from({ length: 60 }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() + index);
    return { date, value: toDateValue(date) };
  }), [today]);

  const selectDate = (value) => {
    if (activeField === "end") {
      if (!startDate || value < startDate) return;
      onEndDateChange(value);
      return;
    }
    onStartDateChange(value);
    if (endDate && endDate < value) onEndDateChange("");
  };

  const scroll = (direction) => scrollerRef.current?.scrollBy({ left: direction * 420, behavior: "smooth" });

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => onActiveFieldChange("start")} className={`rounded-xl border px-4 py-3 text-left ${activeField === "start" ? "border-brand ring-2 ring-brand/15" : "border-line"}`}><span className="block text-xs font-bold uppercase tracking-widest text-muted">Start Stay</span><strong className="mt-1 block text-sm text-ink">{formatFieldDate(startDate, "Select date")}</strong></button>
        <button type="button" onClick={() => onActiveFieldChange("end")} className={`rounded-xl border px-4 py-3 text-left ${activeField === "end" ? "border-brand ring-2 ring-brand/15" : "border-line"}`}><span className="block text-xs font-bold uppercase tracking-widest text-muted">End Stay (Optional)</span><strong className="mt-1 block text-sm text-ink">{formatFieldDate(endDate, "Monthly stay")}</strong></button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button type="button" onClick={() => scroll(-1)} aria-label="Previous dates" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-white text-ink"><ChevronLeft className="h-4 w-4" /></button>
        <div ref={scrollerRef} className="scrollbar-thin flex flex-1 snap-x gap-2 overflow-x-auto py-1">
          {days.map(({ date, value }) => {
            const selectedStart = value === startDate;
            const selectedEnd = value === endDate;
            const beforeStart = activeField === "end" && startDate && value < startDate;
            return <button key={value} type="button" disabled={beforeStart} onClick={() => selectDate(value)} className={`min-w-[82px] snap-start rounded-xl border px-3 py-2 text-center transition ${selectedStart ? "border-brand bg-brand text-white" : selectedEnd ? "border-brand bg-brandDark text-white" : beforeStart ? "cursor-not-allowed border-line bg-paper text-muted opacity-40" : "border-line bg-white text-secondary hover:border-brand"}`}><span className="block text-xs font-semibold">{date.toLocaleDateString("en-IN", { weekday: "short" })}</span><span className="mt-1 block text-sm font-bold">{date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span></button>;
          })}
        </div>
        <button type="button" onClick={() => scroll(1)} aria-label="Next dates" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-white text-ink"><ChevronRight className="h-4 w-4" /></button>
      </div>
      {endDate && <button type="button" onClick={() => onEndDateChange("")} className="mt-3 text-sm font-semibold text-brand hover:text-brandDark">Clear End Stay</button>}
    </div>
  );
};

export default InlineStayCalendar;
