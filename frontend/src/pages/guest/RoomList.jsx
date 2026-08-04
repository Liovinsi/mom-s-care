import { Bed, BedDouble, Check, Lock, MapPin, Search, Users, Wrench } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import InlineStayCalendar from "../../components/booking/InlineStayCalendar";
import { bookingBranches, bookingRooms, formatCurrency } from "../../data/bookingFlow";
import { useLiveAvailability } from "../../lib/liveAvailability";
import { BookingAuthToast, useBookingAuth } from "../../hooks/useBookingAuth";

const isAvailableOn = (bed, checkIn, checkOut = "") => {
  if (["Maintenance", "Reserved", "Blocked"].includes(bed.status)) return false;
  if (bed.status === "Available") return true;
  if (!checkIn || !bed.checkOutDate) return false;
  return checkIn > bed.checkOutDate || Boolean(checkOut && bed.checkInDate && checkOut < bed.checkInDate);
};

const sharingOptions = ["1 Sharing", "2 Sharing", "3 Sharing", "4 Sharing"];
const roomTypeOptions = ["AC", "Non AC"];

const RoomList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const branchId = searchParams.get("branch") || "virugambakkam-pg";
  const initialCheckIn = searchParams.get("checkIn") || "";
  const initialCheckOut = searchParams.get("checkOut") || "";
  const initialGuests = Math.max(1, Number(searchParams.get("guests")) || 1);
  const [branchSelection, setBranchSelection] = useState(branchId);
  const [appliedBranchId, setAppliedBranchId] = useState(branchId);
  const [moveInDate, setMoveInDate] = useState(initialCheckIn);
  const [endStay, setEndStay] = useState(initialCheckOut);
  const [activeDateField, setActiveDateField] = useState("start");
  const [guestCount, setGuestCount] = useState(initialGuests);
  const [appliedDate, setAppliedDate] = useState(initialCheckIn);
  const [appliedEndStay, setAppliedEndStay] = useState(initialCheckOut);
  const [appliedGuests, setAppliedGuests] = useState(initialGuests);
  const [guestSelectorOpen, setGuestSelectorOpen] = useState(false);
  const [sharingType, setSharingType] = useState("");
  const [roomType, setRoomType] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modalMode, setModalMode] = useState("booking");
  const [selectedBeds, setSelectedBeds] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const branch = bookingBranches.find((item) => item.id === appliedBranchId) || bookingBranches[0];
  const { beds: liveBeds, rooms: liveRooms } = useLiveAvailability();
  const { continueToBooking, showSignInNotice } = useBookingAuth();

  const searchRooms = (event) => {
    event.preventDefault();
    if (!moveInDate) return;
    setAppliedBranchId(branchSelection);
    setAppliedDate(moveInDate);
    setAppliedEndStay(endStay);
    setAppliedGuests(guestCount);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("checkIn", moveInDate);
    nextParams.set("guests", String(guestCount));
    nextParams.set("branch", branchSelection);
    if (endStay) nextParams.set("checkOut", endStay); else nextParams.delete("checkOut");
    setSearchParams(nextParams, { replace: true });
  };

  const allRooms = bookingRooms
    .filter((room) => room.branchId === branch.id)
    .map((room) => {
      const storedBeds = liveBeds.filter((bed) => bed.roomId === room.id);
      const effectiveBeds = storedBeds.length
        ? storedBeds.map((bed) => ({ ...bed, label: bed.bedName, effectiveStatus: isAvailableOn(bed, appliedDate, appliedEndStay) ? "Available" : bed.status }))
        : room.bedList.map((bed) => ({ ...bed, effectiveStatus: bed.status }));
      const availableBeds = effectiveBeds.filter((bed) => bed.effectiveStatus === "Available").length;
      const liveRoom = liveRooms.find((item) => item.id === room.id);
      return { ...room, availableBeds, effectiveBeds, isBlocked: liveRoom?.isBlocked || liveRoom?.status === "Blocked", isMaintenance: liveRoom?.status === "Maintenance" };
    });

  const rooms = allRooms
    .filter((room) => room.availableBeds >= appliedGuests && !room.isBlocked && !room.isMaintenance)
    .filter((room) => !sharingType || room.sharingType === sharingType)
    .filter((room) => !roomType || room.roomType === roomType)
    .filter((room) => !priceFilter || priceFilter === "under-10000" ? !priceFilter || room.monthlyRent < 10000 : priceFilter === "10000-15000" ? room.monthlyRent >= 10000 && room.monthlyRent <= 15000 : room.monthlyRent > 15000)
    .filter((room) => !availabilityFilter || availabilityFilter === "available" ? !availabilityFilter || room.availableBeds > 0 : availabilityFilter === "one" ? room.availableBeds === 1 : room.availableBeds >= 2)
    .sort((first, second) => {
      if (sortBy === "price-low") return first.monthlyRent - second.monthlyRent;
      if (sortBy === "price-high") return second.monthlyRent - first.monthlyRent;
      if (sortBy === "available") return second.availableBeds - first.availableBeds;
      if (sortBy === "rated" || sortBy === "popular") return Number(branch.rating) - Number(branch.rating);
      return second.number.localeCompare(first.number, undefined, { numeric: true });
    });

  const resetSearch = () => {
    setMoveInDate("");
    setEndStay("");
    setGuestCount(1);
    setAppliedDate("");
    setAppliedEndStay("");
    setAppliedGuests(1);
    setSharingType("");
    setRoomType("");
    setPriceFilter("");
    setAvailabilityFilter("");
    setSortBy("newest");
    setSearchParams(new URLSearchParams({ branch: appliedBranchId }), { replace: true });
  };

  const openBooking = (room) => {
    continueToBooking({
      roomId: room.id,
      redirect: `/booking/${room.id}?${roomQuery.toString()}`,
      onAuthenticated: () => {
        setSelectedRoom(room);
        setModalMode("booking");
        setSelectedBeds([]);
        setGalleryIndex(0);
      }
    });
  };

  const openDetails = (room) => {
    setSelectedRoom(room);
    setModalMode("details");
    setSelectedBeds([]);
    setGalleryIndex(0);
  };

  const closeBooking = () => {
    setSelectedRoom(null);
    setSelectedBeds([]);
  };

  const toggleBed = (bed) => {
    setSelectedBeds((current) => {
      const selected = current.some((item) => item.id === bed.id);
      if (selected) return current.filter((item) => item.id !== bed.id);
      if (current.length >= appliedGuests) return current;
      return [...current, bed];
    });
  };

  const gallery = selectedRoom ? (branch.gallery?.slice(0, 4) || [branch.image]).filter(Boolean) : [];
  const roomQuery = new URLSearchParams(searchParams);
  roomQuery.set("branch", branch.id);
  if (appliedDate) roomQuery.set("checkIn", appliedDate); else roomQuery.delete("checkIn");
  if (appliedEndStay) roomQuery.set("checkOut", appliedEndStay); else roomQuery.delete("checkOut");
  roomQuery.set("guests", String(appliedGuests));
  const bookingDetailsQuery = selectedRoom ? new URLSearchParams({ roomId: selectedRoom.id, bedId: selectedBeds[0]?.id || "", bedIds: selectedBeds.map((bed) => bed.id).join(","), guests: String(appliedGuests), checkIn: appliedDate, ...(appliedEndStay ? { checkOut: appliedEndStay } : {}) }) : new URLSearchParams();

  return (
    <main className="min-h-[calc(100vh-73px)] bg-paper/70">
      <BookingAuthToast visible={showSignInNotice} />
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 sm:items-center sm:p-4" onClick={closeBooking}>
          <div role="dialog" aria-modal="true" aria-label={`Book Room ${selectedRoom.number}`} className="max-h-[96vh] w-full overflow-y-auto rounded-t-[24px] bg-white shadow-luxury sm:max-w-5xl sm:rounded-[24px]" onClick={(event) => event.stopPropagation()}>
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
              <div><p className="text-xs font-bold uppercase tracking-widest text-brand">{modalMode === "details" ? "Room Details" : "Book Your Stay"}</p><h2 className="mt-1 text-xl font-semibold text-ink">Room {selectedRoom.number}</h2></div>
              <button type="button" onClick={closeBooking} aria-label="Close booking" className="grid h-10 w-10 place-items-center rounded-full border border-line text-xl font-semibold text-ink">×</button>
            </div>

            {modalMode === "details" ? (
              <div className="p-5 pb-24 sm:p-7 sm:pb-24">
                <section>
                  <h3 className="text-lg font-semibold text-ink">Room Gallery</h3>
                  <div className="relative mt-4 overflow-hidden rounded-[18px]">
                    <img src={gallery[galleryIndex] || branch.image} alt={`Room ${selectedRoom.number} view ${galleryIndex + 1}`} className="h-72 w-full object-cover sm:h-96" />
                    {gallery.length > 1 && <><button type="button" onClick={() => setGalleryIndex((galleryIndex - 1 + gallery.length) % gallery.length)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-bold text-ink">Previous</button><button type="button" onClick={() => setGalleryIndex((galleryIndex + 1) % gallery.length)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-bold text-ink">Next</button></>}
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2">{gallery.map((image, index) => <button key={image} type="button" onClick={() => setGalleryIndex(index)} className={`overflow-hidden rounded-xl border ${galleryIndex === index ? "border-brand" : "border-line"}`}><img src={image} alt="" className="h-16 w-full object-cover" /></button>)}</div>
                </section>

                <section className="mt-7 border-t border-line pt-6">
                  <h3 className="text-lg font-semibold text-ink">About This Room</h3>
                  <p className="mt-3 leading-7 text-secondary">This premium {selectedRoom.sharingType.toLowerCase()} {selectedRoom.roomType} room is designed for a comfortable long-term stay, with practical storage, study-friendly spaces, regular housekeeping, and access to all shared facilities at {branch.name}.</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">{[["Monthly Rent", formatCurrency(selectedRoom.monthlyRent)], ["Security Deposit", formatCurrency(selectedRoom.securityDeposit)], ["Available Beds", selectedRoom.availableBeds]].map(([label, value]) => <div key={label} className="rounded-xl border border-line p-4"><p className="text-xs font-bold uppercase tracking-widest text-muted">{label}</p><p className="mt-2 font-semibold text-ink">{value}</p></div>)}</div>
                </section>

                <div className="mt-7 grid gap-6 border-t border-line pt-6 md:grid-cols-2">
                  <section><h3 className="text-lg font-semibold text-ink">Amenities</h3><div className="mt-4 grid gap-2">{branch.facilities.map((amenity) => <p key={amenity} className="rounded-xl border border-line px-4 py-3 text-sm font-semibold text-secondary">{amenity}</p>)}</div></section>
                  <div className="grid gap-6">
                    <section><h3 className="text-lg font-semibold text-ink">House Rules</h3><ul className="mt-4 grid gap-2 text-sm leading-6 text-secondary"><li>Valid ID is required during check-in.</li><li>Visitors must register at reception.</li><li>Quiet hours apply after 10 PM.</li><li>Residents must follow branch safety policies.</li></ul></section>
                    <section><h3 className="text-lg font-semibold text-ink">Nearby Places</h3><div className="mt-4 grid gap-2 text-sm text-secondary"><p>Bus stop · 200 m</p><p>Hospital · 800 m</p><p>Supermarket · 500 m</p><p>Metro station · 1 km</p></div></section>
                    <section><h3 className="text-lg font-semibold text-ink">Resident Reviews</h3><p className="mt-3 text-sm leading-6 text-secondary">★★★★☆ {branch.rating} · Residents appreciate the clean rooms, convenient location, and responsive support.</p></section>
                  </div>
                </div>

                <div className="sticky bottom-0 mt-7 border-t border-line bg-white/95 py-4 backdrop-blur"><Button className="w-full" onClick={() => openBooking(selectedRoom)}>Book This Room</Button></div>
              </div>
            ) : (
            <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[1fr_340px]">
              <div>
                <section>
                  <h3 className="text-lg font-semibold text-ink">Room Gallery</h3>
                  <div className="relative mt-4 overflow-hidden rounded-[18px]">
                    <img src={gallery[galleryIndex] || branch.image} alt={`Room ${selectedRoom.number} view ${galleryIndex + 1}`} className="h-72 w-full object-cover sm:h-96" />
                    {gallery.length > 1 && <><button type="button" onClick={() => setGalleryIndex((galleryIndex - 1 + gallery.length) % gallery.length)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-bold text-ink">Previous</button><button type="button" onClick={() => setGalleryIndex((galleryIndex + 1) % gallery.length)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-bold text-ink">Next</button></>}
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2">{gallery.map((image, index) => <button key={image} type="button" onClick={() => setGalleryIndex(index)} className={`overflow-hidden rounded-xl border ${galleryIndex === index ? "border-brand" : "border-line"}`}><img src={image} alt="" className="h-16 w-full object-cover" /></button>)}</div>
                </section>

                <section className="mt-7 border-t border-line pt-6">
                  <h3 className="text-lg font-semibold text-ink">Room Information</h3>
                  <p className="mt-3 leading-7 text-secondary">A comfortable {selectedRoom.sharingType.toLowerCase()} {selectedRoom.roomType} room with practical storage and access to all shared facilities at {branch.name}.</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">{branch.facilities.map((amenity) => <p key={amenity} className="rounded-xl border border-line px-4 py-3 text-sm font-semibold text-secondary">{amenity}</p>)}</div>
                </section>

                <section className="mt-7 border-t border-line pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-4"><h3 className="text-lg font-semibold text-ink">Bed Layout</h3><div className="flex flex-wrap gap-2 text-xs font-semibold text-secondary"><span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1"><Bed className="h-3.5 w-3.5" /> Available</span><span className="inline-flex items-center gap-1.5 rounded-full border border-brand px-2.5 py-1 text-brand"><Check className="h-3.5 w-3.5" /> Selected</span><span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1"><Lock className="h-3.5 w-3.5" /> Occupied</span><span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-2.5 py-1"><Wrench className="h-3.5 w-3.5" /> Maintenance</span></div></div>
                  <div className="mt-8 grid w-fit grid-cols-2 gap-8 sm:grid-cols-3">
                    {selectedRoom.effectiveBeds.map((bed, index) => {
                      const available = bed.effectiveStatus === "Available";
                      const selected = selectedBeds.some((item) => item.id === bed.id);
                      const limitReached = selectedBeds.length >= appliedGuests && !selected;
                      const label = bed.positionLabel || bed.label?.match(/([A-Z])$/i)?.[1]?.toUpperCase() || String.fromCharCode(65 + index);
                      const maintenance = bed.effectiveStatus === "Maintenance";
                      return <button key={bed.id} type="button" disabled={!available || limitReached} onClick={() => toggleBed(bed)} className={`relative grid h-40 w-[100px] place-items-center rounded-[14px] border-2 px-3 text-sm font-semibold transition duration-200 ${selected ? "border-brand bg-white text-brand shadow-soft" : available ? `border-slate-300 bg-white text-ink ${limitReached ? "opacity-40" : "hover:-translate-y-1 hover:border-brand hover:shadow-soft"}` : maintenance ? "cursor-not-allowed border-slate-300 bg-slate-200 text-slate-500" : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"}`}>{selected && <Check className="absolute right-2 top-2 h-5 w-5 rounded-full bg-brand p-1 text-white" />}{!available && (maintenance ? <Wrench className="absolute right-2 top-2 h-4 w-4" /> : <Lock className="absolute right-2 top-2 h-4 w-4" />)}<span className="text-center">{bed.position && bed.position !== "Single" && <span className="mb-1 block text-xs">{bed.position}</span>}<span className="text-lg">{label}</span></span></button>;
                    })}
                  </div>
                </section>
              </div>

              <aside className="h-fit rounded-[18px] border border-line bg-paper p-5 lg:sticky lg:top-24">
                <h3 className="text-lg font-semibold text-ink">Booking Summary</h3>
                <div className="mt-5 grid gap-3 text-sm">{[["Room", `Room ${selectedRoom.number}`], ["Cot Type", selectedRoom.bedType === "Bunk Cot" ? "Bunk Cot (Upper/Lower)" : "Single Cot"], ["Sharing", selectedRoom.sharingType], ["Monthly Rent", formatCurrency(selectedRoom.monthlyRent)], ["Security Deposit", formatCurrency(selectedRoom.securityDeposit)], ["Available Beds", selectedRoom.availableBeds], ["Start Stay", appliedDate ? new Date(`${appliedDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Not selected"], ["End Stay", appliedEndStay ? new Date(`${appliedEndStay}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Monthly stay"], ["Guests", appliedGuests], ["Selected Beds", selectedBeds.map((bed, index) => bed.positionLabel || bed.label?.match(/([A-Z])$/i)?.[1]?.toUpperCase() || String.fromCharCode(65 + index)).join(", ") || "None"]].map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-b border-line pb-3"><span className="font-semibold text-secondary">{label}</span><strong className="text-right text-ink">{value}</strong></div>)}</div>
                {selectedBeds.length === appliedGuests && appliedDate ? <Link to={`/booking-details?${bookingDetailsQuery.toString()}`} state={{ roomId: selectedRoom.id, bedId: selectedBeds[0].id, selectedBed: selectedBeds[0], selectedBeds, guests: appliedGuests, checkIn: appliedDate, checkOut: appliedEndStay }} className="mt-5 block"><Button className="w-full">Continue</Button></Link> : <Button disabled className="mt-5 w-full">{!appliedDate ? "Select Start Stay" : `Select ${appliedGuests - selectedBeds.length} more`}</Button>}
              </aside>
            </div>
            )}
          </div>
        </div>
      )}

      {guestSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-4" onClick={() => setGuestSelectorOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Select guests" className="w-full rounded-t-[24px] bg-white p-6 shadow-luxury sm:max-w-md sm:rounded-[24px]" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-line sm:hidden" />
            <h2 className="text-xl font-semibold text-ink">Guests</h2>
            <div className="mt-6 flex items-center justify-between border-y border-line py-5">
              <div><p className="font-semibold text-ink">Adults</p><p className="mt-1 text-sm text-muted">Minimum 1 guest</p></div>
              <div className="flex items-center gap-4">
                <button type="button" disabled={guestCount === 1} onClick={() => setGuestCount((value) => Math.max(1, value - 1))} className="grid h-10 w-10 place-items-center rounded-full border border-line text-xl font-semibold text-ink disabled:opacity-40">−</button>
                <span className="w-5 text-center font-semibold text-ink">{guestCount}</span>
                <button type="button" disabled={guestCount === 4} onClick={() => setGuestCount((value) => Math.min(4, value + 1))} className="grid h-10 w-10 place-items-center rounded-full border border-brand text-xl font-semibold text-brand disabled:opacity-40">+</button>
              </div>
            </div>
            <Button type="button" className="mt-6 w-full" onClick={() => setGuestSelectorOpen(false)}>Apply</Button>
          </div>
        </div>
      )}

      <section className="sticky top-[73px] z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-ink">🏠 {branch.name}</h1>
          <form onSubmit={searchRooms} className="mt-6 rounded-[18px] border border-line bg-white p-4 shadow-soft">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <label className="block"><span className="mb-2 block text-sm font-semibold text-ink">Branch</span><select value={branchSelection} onChange={(event) => setBranchSelection(event.target.value)} className="min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink">{bookingBranches.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label className="block"><span className="mb-2 block text-sm font-semibold text-ink">Guests</span><button type="button" onClick={() => setGuestSelectorOpen(true)} className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-line bg-white px-4 text-left text-sm font-semibold text-ink"><Users className="h-4 w-4 text-brand" /> {guestCount} {guestCount === 1 ? "Guest" : "Guests"}</button></label>
              <Button type="submit" className="min-h-12"><Search className="h-4 w-4" /> Search</Button>
            </div>
            <div className="mt-4 border-t border-line pt-4"><InlineStayCalendar startDate={moveInDate} endDate={endStay} activeField={activeDateField} onActiveFieldChange={setActiveDateField} onStartDateChange={setMoveInDate} onEndDateChange={setEndStay} /></div>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
        <Card className="hover:translate-y-0">
          <div className="grid gap-6 lg:grid-cols-2">
            <div><p className="text-xs font-bold uppercase tracking-widest text-muted">Sharing Type</p><div className="mt-3 flex flex-wrap gap-2">{sharingOptions.map((option) => <button key={option} type="button" onClick={() => setSharingType((value) => value === option ? "" : option)} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${sharingType === option ? "border-brand bg-brand text-white" : "border-line bg-white text-secondary"}`}>{option}</button>)}</div></div>
            <div><p className="text-xs font-bold uppercase tracking-widest text-muted">Room Type</p><div className="mt-3 flex flex-wrap gap-2">{roomTypeOptions.map((option) => <button key={option} type="button" onClick={() => setRoomType((value) => value === option ? "" : option)} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${roomType === option ? "border-brand bg-brand text-white" : "border-line bg-white text-secondary"}`}>{option}</button>)}</div></div>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted">Price Range</span><select value={priceFilter} onChange={(event) => setPriceFilter(event.target.value)} className="min-h-11 w-full rounded-xl border border-line bg-white px-4 text-sm font-semibold text-secondary"><option value="">All Prices</option><option value="under-10000">Under ₹10,000</option><option value="10000-15000">₹10,000–₹15,000</option><option value="15000-plus">₹15,000+</option></select></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted">Availability</span><select value={availabilityFilter} onChange={(event) => setAvailabilityFilter(event.target.value)} className="min-h-11 w-full rounded-xl border border-line bg-white px-4 text-sm font-semibold text-secondary"><option value="">Any Availability</option><option value="available">Available Now</option><option value="one">1 Bed Left</option><option value="two-plus">2+ Beds</option></select></label>
          </div>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-5"><label><span className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted">Sort</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="min-h-11 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-secondary"><option value="price-low">Price Low → High</option><option value="price-high">Price High → Low</option><option value="newest">Newest</option><option value="popular">Most Popular</option><option value="rated">Highest Rated</option><option value="available">Most Available Beds</option></select></label><Button type="button" variant="secondary" onClick={resetSearch}>Reset</Button></div>
        </Card>

        <div className="mb-5 mt-7 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-semibold text-ink">Showing {rooms.length} of {allRooms.length} Rooms</h2><p className="text-sm font-semibold text-secondary">{appliedDate ? new Date(`${appliedDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "All dates"} · {appliedGuests} {appliedGuests === 1 ? "Guest" : "Guests"}</p></div>

        <div className="space-y-6">
          {rooms.map((room, index) => (
            <Card key={room.id} className="overflow-hidden p-0 hover:translate-y-0">
              <div className="grid md:grid-cols-[320px_1fr]">
                <img src={branch.gallery?.length ? branch.gallery[(index + 2) % branch.gallery.length] : branch.image} alt={`Room ${room.number}`} className="h-72 w-full object-cover md:h-full" />
                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="text-2xl font-semibold text-ink">Room {room.number}</h3><p className="mt-2 text-sm font-semibold text-brand">★★★★☆ <span className="text-secondary">{branch.rating}</span></p></div><p className="text-2xl font-semibold text-ink">{formatCurrency(room.monthlyRent)}<span className="text-sm font-normal text-muted">/month</span></p></div>
                  <div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">{room.sharingType}</span><span className="rounded-full border border-line px-3 py-1 text-sm font-semibold text-secondary">{room.roomType}</span><span className="rounded-full border border-line px-3 py-1 text-sm font-semibold text-secondary">🛏️ {room.bedType === "Bunk Cot" ? "Bunk Cot (Upper/Lower)" : "Single Cot"}</span></div>
                  <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-success"><span className="h-2.5 w-2.5 rounded-full bg-success" /> {room.availableBeds} {room.availableBeds === 1 ? "Bed" : "Beds"} Left</p>
                  <div className="mt-4 flex flex-wrap gap-2">{branch.facilities.slice(0, 3).map((amenity) => <span key={amenity} className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-secondary">{amenity}</span>)}</div>
                  <p className="mt-4 flex items-center gap-2 text-xs text-muted"><MapPin className="h-3.5 w-3.5" /> {branch.addressLines.slice(-2).join(" ")}</p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row"><Link to={`/rooms/${room.id}?${roomQuery.toString()}`}><Button variant="secondary" className="w-full sm:w-auto">More Details</Button></Link><Button className="w-full sm:w-auto" onClick={() => openBooking(room)}><BedDouble className="h-4 w-4" /> Book Now</Button></div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {!rooms.length && <Card className="text-center hover:translate-y-0"><h2 className="text-xl font-semibold text-ink">No matching rooms found</h2><p className="mt-2 text-secondary">Try fewer guests, another date, or clear a filter.</p></Card>}
      </section>
    </main>
  );
};

export default RoomList;
