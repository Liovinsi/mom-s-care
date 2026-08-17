import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const toDateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatFieldDate = (value, placeholder) => value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : placeholder;

const monthKey = (date) => date.getFullYear() * 12 + date.getMonth();
const weekdayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

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

  const [endCalendarOpen, setEndCalendarOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const minEndValue = startDate || toDateValue(today);
  const minMonthDate = startDate ? new Date(`${startDate}T00:00:00`) : today;
  const canGoPrevMonth = monthKey(viewMonth) > monthKey(minMonthDate);

  const openEndCalendar = () => {
    onActiveFieldChange("end");
    const base = new Date(`${endDate || minEndValue}T00:00:00`);
    setViewMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    setEndCalendarOpen(true);
  };

  const changeViewMonth = (delta) => setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));

  const calendarCells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingBlanks = new Date(year, month, 1).getDay();
    const cells = Array.from({ length: leadingBlanks }, () => null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      const value = toDateValue(new Date(year, month, day));
      cells.push({ day, value, disabled: value < minEndValue });
    }
    return cells;
  }, [viewMonth, minEndValue]);

  const pickEndDate = (value) => {
    onEndDateChange(value);
    setEndCalendarOpen(false);
  };

  const selectDate = (value) => {
    if (activeField === "end") {
      if (startDate && value < startDate) return;
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
        <button type="button" onClick={openEndCalendar} aria-haspopup="dialog" aria-expanded={endCalendarOpen} className={`flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left ${activeField === "end" ? "border-brand ring-2 ring-brand/15" : "border-line"}`}>
          <span><span className="block text-xs font-bold uppercase tracking-widest text-muted">End Stay (Optional)</span><strong className="mt-1 block text-sm text-ink">{formatFieldDate(endDate, "Monthly stay")}</strong></span>
          <CalendarDays className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
        </button>
      </div>

      {endCalendarOpen && createPortal(
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/40 sm:items-center sm:p-4" role="presentation" onClick={() => setEndCalendarOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Select end date" className="w-full rounded-t-[24px] bg-white p-5 shadow-luxury sm:max-w-sm sm:rounded-[24px]" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line sm:hidden" />
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => changeViewMonth(-1)} disabled={!canGoPrevMonth} aria-label="Previous month" className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
              <p className="text-sm font-bold text-ink">{viewMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
              <button type="button" onClick={() => changeViewMonth(1)} aria-label="Next month" className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink"><ChevronRight className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted">
              {weekdayLabels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1">
              {calendarCells.map((cell, index) => cell ? (
                <button key={cell.value} type="button" disabled={cell.disabled} onClick={() => pickEndDate(cell.value)} className={`aspect-square rounded-lg text-sm font-semibold transition ${cell.value === endDate ? "bg-brand text-white" : cell.disabled ? "cursor-not-allowed text-muted opacity-30" : "text-ink hover:bg-paper"}`}>{cell.day}</button>
              ) : <span key={`blank-${index}`} />)}
            </div>
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
              <button type="button" onClick={() => pickEndDate("")} className="text-sm font-semibold text-brand hover:text-brandDark">Clear End Stay</button>
              <button type="button" onClick={() => setEndCalendarOpen(false)} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink">Done</button>
            </div>
          </div>
        </div>,
        document.body
      )}

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
