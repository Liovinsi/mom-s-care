import { ArrowLeft, Bed, Check, Lock, Wrench } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import { bookingBranches, bookingRooms, formatCurrency } from "../../data/bookingFlow";
import { MAX_ENQUIRIES_PER_BED, countActiveEnquiriesForBed, enquiryLimitMessage, findEnquiryForUserAndBed, useLiveEnquiries } from "../../data/adminEnquiries";
import { buildLiveBedIndex, useLiveAvailability } from "../../lib/liveAvailability";
import { useAuth } from "../../context/AuthContext";

const statusForDate = (bed, checkIn) => {
  if (["Available", "Maintenance", "Blocked"].includes(bed.status)) return bed.status;
  return checkIn && bed.checkOutDate && checkIn > bed.checkOutDate ? "Available" : bed.status;
};

const BedSelection = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedBeds, setSelectedBeds] = useState([]);
  const [limitToast, setLimitToast] = useState("");
  const room = bookingRooms.find((item) => item.id === roomId) || bookingRooms[0];
  const branch = bookingBranches.find((item) => item.id === room.branchId) || bookingBranches[0];
  const guests = Math.max(1, Number(searchParams.get("guests")) || 1);
  const checkIn = searchParams.get("checkIn") || "";
  const { beds } = useLiveAvailability();
  const enquiries = useLiveEnquiries();
  // Indexed by BOTH the admin bed's raw id and its "public" id (see
  // buildLiveBedIndex) — a canonically-seeded bunk bed's raw id ("anna-101-bed-l2")
  // never matches the guest catalog's id ("anna-101-l2") directly, so indexing by
  // raw id alone silently misses it and the tile falls back to a stale static
  // status instead of the real one (this was the actual bug: the tile could show
  // "Available" while the real record was already Reserved/Occupied).
  const storedBedsById = buildLiveBedIndex(beds, room.id);
  // The static catalog (room.bedList) is the source of truth for which beds a room
  // has; a live/admin record only overrides that one bed's status when it exists,
  // so approving/reserving one bed never hides its siblings from other guests.
  const bedList = room.bedList.map((staticBed) => {
    const liveBed = storedBedsById.get(staticBed.id);
    return liveBed ? { ...staticBed, ...liveBed, label: liveBed.bedName || staticBed.label, status: statusForDate(liveBed, checkIn) } : staticBed;
  });
  const toggleBed = (bed) => setSelectedBeds((current) => current.some((item) => item.id === bed.id) ? current.filter((item) => item.id !== bed.id) : current.length < guests ? [...current, bed] : current);
  const bookingQuery = new URLSearchParams({ roomId: room.id, bedId: selectedBeds[0]?.id || "", bedIds: selectedBeds.map((bed) => bed.id).join(","), guests: String(guests), checkIn });
  const gridColumns = room.bedType === "Bunk Cot" ? Math.max(1, Math.ceil(bedList.length / 2)) : bedList.length >= 5 ? 3 : 2;
  const selectedLabels = selectedBeds.map((bed, index) => bed.positionLabel || bed.label?.match(/([A-Z])$/i)?.[1]?.toUpperCase() || String.fromCharCode(65 + index)).join(", ");

  return (
    <main className="min-h-[calc(100vh-73px)] bg-paper/70 pb-24">
      <Toast message={limitToast} onClose={() => setLimitToast("")} />
      <section className="border-b border-line bg-white"><div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8"><button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-semibold text-secondary"><ArrowLeft className="h-4 w-4" /> Back</button><h1 className="mt-4 text-2xl font-semibold text-ink">Room {room.number}</h1><p className="mt-1 text-sm text-secondary">{branch.name} · {checkIn} · {guests} {guests === 1 ? "Guest" : "Guests"}</p></div></section>
      <section className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8"><div className="rounded-[18px] border border-line bg-white p-6 shadow-soft"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-lg font-semibold text-ink">Select Beds</h2><p className="mt-1 text-sm font-semibold text-secondary">🛏️ {room.bedType === "Bunk Cot" ? "Bunk Cot (Upper/Lower)" : "Single Cot"}</p></div><div className="flex flex-wrap gap-2 text-xs font-semibold"><span className="inline-flex items-center gap-1.5 rounded-full border border-[#22C55E] px-2.5 py-1 text-[#22C55E] dark:border-[#4ADE80] dark:text-[#4ADE80]"><Bed className="h-3.5 w-3.5" /> Available</span><span className="inline-flex items-center gap-1.5 rounded-full border border-[#2563EB] px-2.5 py-1 text-[#2563EB] dark:border-[#60A5FA] dark:text-[#60A5FA]"><Check className="h-3.5 w-3.5" /> Selected</span><span className="inline-flex items-center gap-1.5 rounded-full border border-[#EF4444] px-2.5 py-1 text-[#EF4444] dark:border-[#F87171] dark:text-[#F87171]"><Lock className="h-3.5 w-3.5" /> Occupied</span><span className="inline-flex items-center gap-1.5 rounded-full border border-[#9CA3AF] px-2.5 py-1 text-[#9CA3AF] dark:border-[#D1D5DB] dark:text-[#D1D5DB]"><Wrench className="h-3.5 w-3.5" /> Maintenance</span></div></div>
        <div className="mt-9 grid w-fit gap-6" style={{ gridTemplateColumns: `repeat(${gridColumns}, 100px)` }}>
          {bedList.map((bed, index) => {
            const available = bed.status === "Available";
            const selected = selectedBeds.some((item) => item.id === bed.id);
            const activeEnquiryCount = countActiveEnquiriesForBed(enquiries, bed.id);
            const alreadyEnquired = Boolean(user && findEnquiryForUserAndBed(enquiries, user, bed.id));
            const atCapacity = available && !alreadyEnquired && activeEnquiryCount >= MAX_ENQUIRIES_PER_BED;
            const guestLimitReached = selectedBeds.length >= guests && !selected;
            const maintenance = bed.status === "Maintenance";
            const label = bed.positionLabel || bed.label?.match(/([A-Z])$/i)?.[1]?.toUpperCase() || String.fromCharCode(65 + index);
            const badgeText = !available
              ? null
              : alreadyEnquired ? "Enquiry Sent" : atCapacity ? "🟠 Enquiry Limit Reached" : activeEnquiryCount > 0 ? `🟠 ${activeEnquiryCount} ${activeEnquiryCount === 1 ? "Enquiry" : "Enquiries"}` : "🟢 Available";
            const softBlocked = alreadyEnquired || atCapacity;
            const handleClick = () => {
              if (alreadyEnquired) { setLimitToast("You already sent an enquiry for this bed. Our admin team will contact you."); return; }
              if (atCapacity) { setLimitToast(enquiryLimitMessage(label)); return; }
              toggleBed(bed);
            };
            return (
              <button key={bed.id} type="button" disabled={!available || (guestLimitReached && !softBlocked)} onClick={handleClick} className={`relative flex h-[150px] w-[100px] flex-col items-center justify-between rounded-[14px] border-2 bg-white p-4 text-sm font-semibold transition duration-200 ease-in-out ${selected ? "scale-105 border-[#2563EB] text-[#2563EB] shadow-[0_10px_28px_rgba(37,99,235,0.20)] dark:border-[#60A5FA] dark:text-[#60A5FA]" : available ? `border-[#22C55E] text-[#22C55E] dark:border-[#4ADE80] dark:text-[#4ADE80] ${softBlocked || guestLimitReached ? "opacity-40" : "hover:scale-[1.02] hover:shadow-soft"}` : maintenance ? "cursor-not-allowed border-[#9CA3AF] text-[#9CA3AF] dark:border-[#D1D5DB] dark:text-[#D1D5DB]" : "cursor-not-allowed border-[#EF4444] text-[#EF4444] dark:border-[#F87171] dark:text-[#F87171]"}`}>
                {selected && <Check className="absolute right-2 top-2 h-5 w-5 text-[#2563EB] dark:text-[#60A5FA]" />}
                {!available && (maintenance ? <Wrench className="absolute right-2 top-2 h-4 w-4 text-[#9CA3AF] dark:text-[#D1D5DB]" /> : <Lock className="absolute right-2 top-2 h-4 w-4 text-[#EF4444] dark:text-[#F87171]" />)}
                <Bed className="h-7 w-7" />
                <span>{bed.position && bed.position !== "Single" ? bed.position : "Single"}</span>
                <span className="text-lg">{label}</span>
                {badgeText && <span className="text-[10px] font-bold normal-case leading-tight tracking-normal text-secondary">{badgeText}</span>}
              </button>
            );
          })}
        </div>
      </div></section>
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(30,30,36,0.08)] backdrop-blur"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4"><div className="grid grid-cols-3 gap-x-6 gap-y-1 text-sm"><p><span className="block text-xs font-semibold text-muted">Selected</span><strong className="text-ink">{selectedLabels || "None"}</strong></p><p><span className="block text-xs font-semibold text-muted">Rent</span><strong className="text-ink">{formatCurrency(room.monthlyRent)}</strong></p><p><span className="block text-xs font-semibold text-muted">Deposit</span><strong className="text-ink">{formatCurrency(room.securityDeposit)}</strong></p></div>{selectedBeds.length === guests ? <Link to={`/booking-details?${bookingQuery.toString()}`} state={{ roomId: room.id, bedId: selectedBeds[0].id, selectedBed: selectedBeds[0], selectedBeds, guests, checkIn }}><Button>Continue</Button></Link> : <Button disabled>Select {guests - selectedBeds.length} more</Button>}</div></div>
    </main>
  );
};

export default BedSelection;
