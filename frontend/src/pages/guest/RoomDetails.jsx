import { ExternalLink, Mail, MapPin, MessageCircle, Phone, Search, Send, Users } from "lucide-react";
import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import InlineStayCalendar from "../../components/booking/InlineStayCalendar";
import { bookingBranches, bookingRooms, formatCurrency } from "../../data/bookingFlow";
import { buildLiveBedIndex, useLiveAvailability } from "../../lib/liveAvailability";
import { BookingAuthToast, useBookingAuth } from "../../hooks/useBookingAuth";

const sharingTypes = ["2 Sharing", "3 Sharing", "4 Sharing"];
const roomTypes = ["AC", "Non AC"];

const isAvailableOn = (bed, checkIn) => {
  if (["Maintenance", "Reserved", "Blocked"].includes(bed.status)) return false;
  if (bed.status === "Available") return true;
  return Boolean(checkIn && bed.checkOutDate && checkIn > bed.checkOutDate);
};

const RoomDetails = () => {
  const { branchId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const branch = bookingBranches.find((item) => item.id === branchId) || bookingBranches[0];
  const today = new Date().toISOString().slice(0, 10);
  const initialDate = searchParams.get("checkIn") || today;
  const initialGuests = Math.max(1, Number(searchParams.get("guests")) || 1);
  const [moveInDate, setMoveInDate] = useState(initialDate);
  const [endStay, setEndStay] = useState(searchParams.get("checkOut") || "");
  const [activeDateField, setActiveDateField] = useState("start");
  const [guestCount, setGuestCount] = useState(initialGuests);
  const [appliedDate, setAppliedDate] = useState(initialDate);
  const [appliedGuests, setAppliedGuests] = useState(initialGuests);
  const [guestSelectorOpen, setGuestSelectorOpen] = useState(false);
  const [sharingType, setSharingType] = useState("");
  const [roomType, setRoomType] = useState("");
  const { beds: liveBeds, rooms: liveRooms } = useLiveAvailability();
  const { continueToBooking, showSignInNotice } = useBookingAuth();

  const allRooms = bookingRooms.filter((room) => room.branchId === branch.id).map((room) => {
    // Indexed by both the raw admin bed id and its "public" id — see
    // buildLiveBedIndex; a raw-id-only map silently misses canonically-seeded bunk
    // beds and falls back to a stale static status instead of the real one.
    const storedBedsById = buildLiveBedIndex(liveBeds, room.id);
    // room.bedList stays the source of truth for which beds exist; only overlay a
    // bed's own live status when a record for it exists, so one reserved bed never
    // makes the rest of the room's beds disappear from this availability count.
    const availableBeds = room.bedList.filter((staticBed) => {
      const liveBed = storedBedsById.get(staticBed.id);
      return liveBed ? isAvailableOn(liveBed, appliedDate) : staticBed.status === "Available";
    }).length;
    const liveRoom = liveRooms.find((item) => item.id === room.id);
    return { ...room, availableBeds, blocked: liveRoom?.isBlocked || liveRoom?.status === "Blocked", maintenance: liveRoom?.status === "Maintenance" };
  });

  const availableRoomCount = allRooms.filter((room) => room.availableBeds > 0 && !room.blocked && !room.maintenance).length;
  const occupiedRoomCount = allRooms.length - availableRoomCount;
  const visibleRooms = allRooms
    .filter((room) => room.availableBeds >= appliedGuests && !room.blocked && !room.maintenance)
    .filter((room) => !sharingType || room.sharingType === sharingType)
    .filter((room) => !roomType || room.roomType === roomType);

  const submitSearch = (event) => {
    event.preventDefault();
    if (!moveInDate) return;
    setAppliedDate(moveInDate);
    setAppliedGuests(guestCount);
    const next = new URLSearchParams(searchParams);
    next.set("checkIn", moveInDate);
    next.set("guests", String(guestCount));
    if (endStay) next.set("checkOut", endStay); else next.delete("checkOut");
    setSearchParams(next, { replace: true });
  };

  const detailsQuery = new URLSearchParams({ branch: branch.id, checkIn: appliedDate, guests: String(appliedGuests) });

  return (
    <main className="min-h-[calc(100vh-73px)] bg-paper/70">
      <BookingAuthToast visible={showSignInNotice} />
      {guestSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-4" onClick={() => setGuestSelectorOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Select guests" className="w-full rounded-t-[24px] bg-white p-6 shadow-luxury sm:max-w-md sm:rounded-[24px]" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-line sm:hidden" />
            <h2 className="text-xl font-semibold text-ink">Guests</h2>
            <div className="mt-6 flex items-center justify-between border-y border-line py-5"><div><p className="font-semibold text-ink">Adults</p><p className="mt-1 text-sm text-muted">Minimum 1 guest</p></div><div className="flex items-center gap-4"><button type="button" disabled={guestCount === 1} onClick={() => setGuestCount((value) => Math.max(1, value - 1))} className="grid h-10 w-10 place-items-center rounded-full border border-line text-xl font-semibold text-ink disabled:opacity-40">−</button><span className="w-5 text-center font-semibold text-ink">{guestCount}</span><button type="button" disabled={guestCount === 4} onClick={() => setGuestCount((value) => Math.min(4, value + 1))} className="grid h-10 w-10 place-items-center rounded-full border border-brand text-xl font-semibold text-brand disabled:opacity-40">+</button></div></div>
            <Button type="button" className="mt-6 w-full" onClick={() => setGuestSelectorOpen(false)}>Apply</Button>
          </div>
        </div>
      )}

      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand">Branch Overview</p>
          <h1 className="mt-3 text-4xl font-semibold text-ink">{branch.name}</h1>
          <p className="mt-3 max-w-3xl text-secondary">{branch.addressLines.join(" ")}</p>

          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            <span className="rounded-full border border-line bg-white px-4 py-2 text-ink">🏠 Total Rooms: {allRooms.length}</span>
            <span className="rounded-full border border-green-200 bg-green-50 px-4 py-2 text-green-700 dark:border-green-500/30 dark:bg-green-500/15 dark:text-green-400">🟢 Available: {availableRoomCount}</span>
            <span className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-400">🔴 Occupied: {occupiedRoomCount}</span>
          </div>

          <form onSubmit={submitSearch} className="mt-6 rounded-[18px] border border-line bg-white p-4 shadow-soft">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end"><label><span className="mb-2 block text-sm font-semibold text-ink">Guests</span><button type="button" onClick={() => setGuestSelectorOpen(true)} className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink"><Users className="h-4 w-4 text-brand" /> {guestCount} {guestCount === 1 ? "Guest" : "Guests"}</button></label><Button type="submit" className="min-h-12"><Search className="h-4 w-4" /> Search</Button></div>
            <div className="mt-4 border-t border-line pt-4"><InlineStayCalendar startDate={moveInDate} endDate={endStay} activeField={activeDateField} onActiveFieldChange={setActiveDateField} onStartDateChange={setMoveInDate} onEndDateChange={setEndStay} /></div>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5 rounded-[18px] border border-line bg-white p-4">
          <div><p className="text-xs font-bold uppercase tracking-widest text-muted">Sharing Type</p><div className="mt-3 flex flex-wrap gap-2">{sharingTypes.map((option) => <button key={option} type="button" onClick={() => setSharingType((value) => value === option ? "" : option)} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${sharingType === option ? "border-brand bg-brand text-white" : "border-line bg-white text-secondary"}`}>{option}</button>)}</div></div>
          <div><p className="text-xs font-bold uppercase tracking-widest text-muted">Room Type</p><div className="mt-3 flex gap-2">{roomTypes.map((option) => <button key={option} type="button" onClick={() => setRoomType((value) => value === option ? "" : option)} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${roomType === option ? "border-brand bg-brand text-white" : "border-line bg-white text-secondary"}`}>{option}</button>)}</div></div>
        </div>

        <div className="mb-5 mt-7 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-semibold text-ink">Available Rooms ({visibleRooms.length})</h2><p className="text-sm font-semibold text-secondary">Move-in: {new Date(`${appliedDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · Guests: {appliedGuests}</p></div>

        <div className="grid gap-6 md:grid-cols-2">{visibleRooms.map((room, index) => <Card key={room.id} className="overflow-hidden p-0 hover:translate-y-0"><img src={branch.gallery?.length ? branch.gallery[(index + 2) % branch.gallery.length] : branch.image} alt={`Room ${room.number}`} className="h-60 w-full object-cover" /><div className="p-5"><div className="flex justify-between gap-4"><div><h3 className="text-2xl font-semibold text-ink">Room {room.number}</h3><p className="mt-2 text-sm font-semibold text-brand">{room.sharingType} · {room.roomType}</p><p className="mt-2 text-sm font-semibold text-secondary">🛏️ {room.bedType === "Bunk Cot" ? "Bunk Cot (Upper/Lower)" : "Single Cot"}</p></div><p className="text-xl font-semibold text-ink">{formatCurrency(room.monthlyRent)}<span className="block text-right text-xs font-normal text-muted">/month</span></p></div><p className="mt-4 text-sm font-semibold text-green-700 dark:text-green-400">{room.availableBeds} {room.availableBeds === 1 ? "Bed" : "Beds"} Available</p><div className="mt-5 flex flex-col gap-3 sm:flex-row"><Link to={`/rooms/${room.id}?${detailsQuery.toString()}`}><Button variant="secondary" className="w-full">More Details</Button></Link><Button className="w-full" onClick={() => continueToBooking({ roomId: room.id, redirect: `/booking/${room.id}?${detailsQuery.toString()}` })}><Send className="h-4 w-4" /> Send Enquiry</Button></div></div></Card>)}</div>
        {!visibleRooms.length && <Card className="text-center hover:translate-y-0"><h3 className="text-xl font-semibold text-ink">No matching rooms</h3><p className="mt-2 text-secondary">Try fewer guests, another move-in date, or clear a filter.</p></Card>}

        <section className="mt-10" aria-labelledby="branch-location-title">
          <h2 id="branch-location-title" className="text-2xl font-semibold text-ink">Branch Location</h2>
          <Card className="mt-5 overflow-hidden p-0 hover:translate-y-0">
            <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
              <iframe
                src={`https://www.google.com/maps?q=${branch.latitude},${branch.longitude}&z=15&output=embed`}
                title={`${branch.name} location`}
                className="h-72 w-full lg:h-full lg:min-h-80"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="flex flex-col justify-center p-6">
                <MapPin className="h-6 w-6 text-brand" />
                <h3 className="mt-4 text-lg font-semibold text-ink">Full Address</h3>
                <p className="mt-3 whitespace-pre-line leading-7 text-secondary">{branch.fullAddress}</p>
                <a href={branch.googleMapsUrl} target="_blank" rel="noreferrer" className="mt-6 block">
                  <Button variant="secondary" className="w-full"><ExternalLink className="h-4 w-4" /> Open in Google Maps</Button>
                </a>
              </div>
            </div>
          </Card>
        </section>

        <section className="mt-10" aria-labelledby="branch-contact-title">
          <h2 id="branch-contact-title" className="text-2xl font-semibold text-ink">Contact Information</h2>
          <Card className="mt-5 hover:translate-y-0">
            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-xl border border-line p-4"><Phone className="h-5 w-5 text-brand" /><p className="mt-3 text-xs font-bold uppercase tracking-widest text-muted">Phone Number</p><a href={`tel:${branch.contactNumber.replace(/\s/g, "")}`} className="mt-1 block font-semibold text-ink">{branch.contactNumber}</a></div>
              <div className="rounded-xl border border-line p-4"><MessageCircle className="h-5 w-5 text-brand" /><p className="mt-3 text-xs font-bold uppercase tracking-widest text-muted">WhatsApp Number</p><a href={`https://wa.me/${branch.contactNumber.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="mt-1 block font-semibold text-ink">{branch.contactNumber}</a></div>
              <div className="rounded-xl border border-line p-4"><Mail className="h-5 w-5 text-brand" /><p className="mt-3 text-xs font-bold uppercase tracking-widest text-muted">Email</p><a href="mailto:support@pgstay.com" className="mt-1 block font-semibold text-ink">support@pgstay.com</a></div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href={`tel:${branch.contactNumber.replace(/\s/g, "")}`} className="sm:flex-1"><Button className="w-full"><Phone className="h-4 w-4" /> Call Now</Button></a>
              <a href={`https://wa.me/${branch.contactNumber.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="sm:flex-1"><Button variant="secondary" className="w-full"><MessageCircle className="h-4 w-4" /> WhatsApp</Button></a>
            </div>
          </Card>
        </section>
      </section>
    </main>
  );
};

export default RoomDetails;
