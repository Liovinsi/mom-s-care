import { BedDouble, Check, MapPin, Star } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { bookingBranches, bookingRooms, formatCurrency } from "../../data/bookingFlow";
import { useLiveAvailability } from "../../lib/liveAvailability";
import { BookingAuthToast, useBookingAuth } from "../../hooks/useBookingAuth";

const SelectedRoomDetails = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const room = bookingRooms.find((item) => item.id === roomId) || bookingRooms[0];
  const branch = bookingBranches.find((item) => item.id === room.branchId) || bookingBranches[0];
  const { beds } = useLiveAvailability();
  const { continueToBooking, showSignInNotice } = useBookingAuth();
  const roomBeds = beds.filter((bed) => bed.roomId === room.id);
  const availableBeds = roomBeds.length ? roomBeds.filter((bed) => bed.status === "Available").length : room.bedList.filter((bed) => bed.status === "Available").length;
  const checkIn = searchParams.get("checkIn") || "";
  const guests = Math.max(1, Number(searchParams.get("guests")) || 1);
  const gallery = (branch.gallery?.slice(0, 4) || [branch.image]).filter(Boolean);

  return (
    <main className="bg-paper/70 pb-24">
      <BookingAuthToast visible={showSignInNotice} />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {gallery.map((image, index) => <img key={image} src={image} alt={`Room ${room.number} view ${index + 1}`} className={`w-full rounded-[18px] object-cover ${index === 0 ? "h-72 sm:col-span-2 lg:row-span-2 lg:h-full" : "h-44"}`} />)}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">{room.roomType}</span><span className="inline-flex items-center gap-1 text-sm font-semibold text-ink"><Star className="h-4 w-4 fill-brand text-brand" /> {branch.rating}</span></div>
            <h1 className="mt-4 text-4xl font-semibold text-ink">Room {room.number}</h1>
            <p className="mt-2 flex items-center gap-2 text-secondary"><MapPin className="h-4 w-4 text-brand" /> {branch.name} · {room.sharingType}</p>
            <p className="mt-6 max-w-3xl leading-7 text-secondary">This premium {room.sharingType.toLowerCase()} {room.roomType} room is designed for a comfortable long-term stay with practical storage, study-friendly spaces, regular housekeeping, and access to all shared facilities.</p>

            <h2 className="mt-8 text-xl font-semibold text-ink">Amenities</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">{branch.facilities.map((amenity) => <p key={amenity} className="flex items-center gap-2 rounded-xl border border-line px-4 py-3 text-sm font-semibold text-secondary"><Check className="h-4 w-4 text-brand" /> {amenity}</p>)}</div>

            <div className="mt-8 grid gap-7 border-t border-line pt-7 md:grid-cols-3">
              <section><h2 className="text-lg font-semibold text-ink">Nearby Places</h2><div className="mt-3 grid gap-2 text-sm text-secondary"><p>Bus stop · 200 m</p><p>Hospital · 800 m</p><p>Supermarket · 500 m</p><p>Metro · 1 km</p></div></section>
              <section><h2 className="text-lg font-semibold text-ink">House Rules</h2><div className="mt-3 grid gap-2 text-sm text-secondary"><p>Valid ID required</p><p>Visitors register at reception</p><p>Quiet hours after 10 PM</p><p>Follow branch safety policies</p></div></section>
              <section><h2 className="text-lg font-semibold text-ink">Reviews</h2><p className="mt-3 text-sm leading-6 text-secondary">★★★★☆ {branch.rating}<br />Clean rooms, convenient location, and responsive staff.</p></section>
            </div>
          </div>

          <Card className="h-fit hover:translate-y-0 lg:sticky lg:top-24">
            <h2 className="text-xl font-semibold text-ink">Room Summary</h2>
            <div className="mt-5 grid gap-4 text-sm">{[["Monthly Rent", formatCurrency(room.monthlyRent)], ["Security Deposit", formatCurrency(room.securityDeposit)], ["Sharing Type", room.sharingType], ["Room Type", room.roomType], ["Cot Type", room.bedType === "Bunk Cot" ? "Bunk Cot (Upper/Lower)" : "Single Cot"], ["Available Beds", availableBeds], ["Move-in Date", checkIn || "Not selected"], ["Guests", guests]].map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-b border-line pb-3"><span className="font-semibold text-secondary">{label}</span><strong className="text-right text-ink">{value}</strong></div>)}</div>
          </Card>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(30,30,36,0.08)] backdrop-blur"><div className="mx-auto flex max-w-7xl justify-end"><Button onClick={() => continueToBooking({ roomId: room.id, redirect: `/booking/${room.id}?${searchParams.toString()}` })}><BedDouble className="h-4 w-4" /> Book This Room</Button></div></div>
    </main>
  );
};

export default SelectedRoomDetails;
