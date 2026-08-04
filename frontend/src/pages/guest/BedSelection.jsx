import { ArrowLeft, Bed, Check, Lock, Wrench } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import { bookingBranches, bookingRooms, formatCurrency } from "../../data/bookingFlow";
import { useLiveAvailability } from "../../lib/liveAvailability";

const statusForDate = (bed, checkIn) => {
  if (["Available", "Maintenance", "Blocked"].includes(bed.status)) return bed.status;
  return checkIn && bed.checkOutDate && checkIn > bed.checkOutDate ? "Available" : bed.status;
};

const BedSelection = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedBeds, setSelectedBeds] = useState([]);
  const room = bookingRooms.find((item) => item.id === roomId) || bookingRooms[0];
  const branch = bookingBranches.find((item) => item.id === room.branchId) || bookingBranches[0];
  const guests = Math.max(1, Number(searchParams.get("guests")) || 1);
  const checkIn = searchParams.get("checkIn") || "";
  const { beds } = useLiveAvailability();
  const storedBeds = beds.filter((bed) => bed.roomId === room.id);
  const bedList = storedBeds.length ? storedBeds.map((bed) => ({ ...bed, label: bed.bedName, status: statusForDate(bed, checkIn) })) : room.bedList;
  const toggleBed = (bed) => setSelectedBeds((current) => current.some((item) => item.id === bed.id) ? current.filter((item) => item.id !== bed.id) : current.length < guests ? [...current, bed] : current);
  const bookingQuery = new URLSearchParams({ roomId: room.id, bedId: selectedBeds[0]?.id || "", bedIds: selectedBeds.map((bed) => bed.id).join(","), guests: String(guests), checkIn });
  const gridColumns = room.bedType === "Bunk Cot" ? Math.max(1, Math.ceil(bedList.length / 2)) : bedList.length >= 5 ? 3 : 2;
  const selectedLabels = selectedBeds.map((bed, index) => bed.positionLabel || bed.label?.match(/([A-Z])$/i)?.[1]?.toUpperCase() || String.fromCharCode(65 + index)).join(", ");

  return (
    <main className="min-h-[calc(100vh-73px)] bg-paper/70 pb-24">
      <section className="border-b border-line bg-white"><div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8"><button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-semibold text-secondary"><ArrowLeft className="h-4 w-4" /> Back</button><h1 className="mt-4 text-2xl font-semibold text-ink">Room {room.number}</h1><p className="mt-1 text-sm text-secondary">{branch.name} · {checkIn} · {guests} {guests === 1 ? "Guest" : "Guests"}</p></div></section>
      <section className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8"><div className="rounded-[18px] border border-line bg-white p-6 shadow-soft"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-lg font-semibold text-ink">Select Beds</h2><p className="mt-1 text-sm font-semibold text-secondary">🛏️ {room.bedType === "Bunk Cot" ? "Bunk Cot (Upper/Lower)" : "Single Cot"}</p></div><div className="flex flex-wrap gap-2 text-xs font-semibold"><span className="inline-flex items-center gap-1.5 rounded-full border border-[#22C55E] px-2.5 py-1 text-[#22C55E]"><Bed className="h-3.5 w-3.5" /> Available</span><span className="inline-flex items-center gap-1.5 rounded-full border border-[#2563EB] px-2.5 py-1 text-[#2563EB]"><Check className="h-3.5 w-3.5" /> Selected</span><span className="inline-flex items-center gap-1.5 rounded-full border border-[#EF4444] px-2.5 py-1 text-[#EF4444]"><Lock className="h-3.5 w-3.5" /> Occupied</span><span className="inline-flex items-center gap-1.5 rounded-full border border-[#9CA3AF] px-2.5 py-1 text-[#9CA3AF]"><Wrench className="h-3.5 w-3.5" /> Maintenance</span></div></div><div className="mt-9 grid w-fit gap-6" style={{ gridTemplateColumns: `repeat(${gridColumns}, 100px)` }}>{bedList.map((bed, index) => { const available = bed.status === "Available"; const selected = selectedBeds.some((item) => item.id === bed.id); const limit = selectedBeds.length >= guests && !selected; const maintenance = bed.status === "Maintenance"; const label = bed.positionLabel || bed.label?.match(/([A-Z])$/i)?.[1]?.toUpperCase() || String.fromCharCode(65 + index); return <button key={bed.id} type="button" disabled={!available || limit} onClick={() => toggleBed(bed)} className={`relative flex h-[150px] w-[100px] flex-col items-center justify-between rounded-[14px] border-2 bg-white p-4 text-sm font-semibold transition duration-200 ease-in-out ${selected ? "scale-105 border-[#2563EB] text-[#2563EB] shadow-[0_10px_28px_rgba(37,99,235,0.20)]" : available ? `border-[#22C55E] text-[#22C55E] ${limit ? "opacity-40" : "hover:scale-[1.02] hover:shadow-soft"}` : maintenance ? "cursor-not-allowed border-[#9CA3AF] text-[#9CA3AF]" : "cursor-not-allowed border-[#EF4444] text-[#EF4444]"}`}>{selected && <Check className="absolute right-2 top-2 h-5 w-5 text-[#2563EB]" />}{!available && (maintenance ? <Wrench className="absolute right-2 top-2 h-4 w-4 text-[#9CA3AF]" /> : <Lock className="absolute right-2 top-2 h-4 w-4 text-[#EF4444]" />)}<Bed className="h-7 w-7" /><span>{bed.position && bed.position !== "Single" ? bed.position : "Single"}</span><span className="text-lg">{label}</span></button>; })}</div></div></section>
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(30,30,36,0.08)] backdrop-blur"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4"><div className="grid grid-cols-3 gap-x-6 gap-y-1 text-sm"><p><span className="block text-xs font-semibold text-muted">Selected</span><strong className="text-ink">{selectedLabels || "None"}</strong></p><p><span className="block text-xs font-semibold text-muted">Rent</span><strong className="text-ink">{formatCurrency(room.monthlyRent)}</strong></p><p><span className="block text-xs font-semibold text-muted">Deposit</span><strong className="text-ink">{formatCurrency(room.securityDeposit)}</strong></p></div>{selectedBeds.length === guests ? <Link to={`/booking-details?${bookingQuery.toString()}`} state={{ roomId: room.id, bedId: selectedBeds[0].id, selectedBed: selectedBeds[0], selectedBeds, guests, checkIn }}><Button>Continue</Button></Link> : <Button disabled>Select {guests - selectedBeds.length} more</Button>}</div></div>
    </main>
  );
};

export default BedSelection;
