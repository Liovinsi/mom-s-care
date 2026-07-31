import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, Lock } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { bookingBranches, bookingRooms, formatCurrency } from "../../data/bookingFlow";
import { useLiveAvailability } from "../../lib/liveAvailability";

const PremiumBedIllustration = ({ muted = false }) => (
  <svg
    width="72"
    height="72"
    viewBox="0 0 72 72"
    role="img"
    aria-label="Premium 3D bed"
    className={`drop-shadow-[0_12px_16px_rgba(30,30,36,0.14)] transition duration-200 ${muted ? "opacity-40 grayscale" : ""}`}
  >
    <defs>
      <linearGradient id="bedWood" x1="13" x2="61" y1="32" y2="58" gradientUnits="userSpaceOnUse">
        <stop stopColor="#DD5E67" />
        <stop offset="0.55" stopColor="#D12233" />
        <stop offset="1" stopColor="#1F2937" />
      </linearGradient>
      <linearGradient id="bedSide" x1="18" x2="62" y1="45" y2="63" gradientUnits="userSpaceOnUse">
        <stop stopColor="#D12233" />
        <stop offset="1" stopColor="#1F2937" />
      </linearGradient>
      <linearGradient id="mattress" x1="18" x2="58" y1="25" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="0.62" stopColor="#EFF4F7" />
        <stop offset="1" stopColor="#D7E0E7" />
      </linearGradient>
      <linearGradient id="blanket" x1="27" x2="61" y1="34" y2="53" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFF4F6" />
        <stop offset="0.55" stopColor="#F2D6DA" />
        <stop offset="1" stopColor="#D12233" />
      </linearGradient>
      <linearGradient id="pillow" x1="20" x2="43" y1="26" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#E7EDF1" />
      </linearGradient>
      <filter id="bedShadow" x="4" y="10" width="64" height="58" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="7" floodColor="#1F2937" floodOpacity="0.2" stdDeviation="4" />
      </filter>
    </defs>
    <ellipse cx="38" cy="59" fill="#1F2937" opacity="0.13" rx="27" ry="7" />
    <g filter="url(#bedShadow)">
      <path d="M14 31 28 23l33 19-14 8-33-19Z" fill="url(#bedWood)" />
      <path d="M14 31v16l33 19V50L14 31Z" fill="url(#bedSide)" />
      <path d="M47 50v16l14-8V42L47 50Z" fill="#D12233" />
      <path d="M16 28 28 21v22l-12-7V28Z" fill="#D12233" />
      <path d="M19 29 28 24v13l-9-5v-3Z" fill="#DD5E67" />
      <path d="M20 33 34 25l25 14-14 8-25-14Z" fill="url(#mattress)" />
      <path d="M20 33v5l25 14v-5L20 33Z" fill="#DCE5EA" />
      <path d="M45 47v5l14-8v-5l-14 8Z" fill="#C8D4DB" />
      <path d="M22 32.5 31 27.5l8 4.5-9 5-8-4.5Z" fill="url(#pillow)" />
      <path d="M32 27.5 40 23l8 4.5-8 4.5-8-4.5Z" fill="url(#pillow)" />
      <path d="M24 32.6c2.8 1.5 5.7 3.2 8.5 4.8" stroke="#DDE6EB" strokeLinecap="round" strokeWidth="1.2" />
      <path d="M34 27.9c2.6 1.5 5.2 3 7.8 4.4" stroke="#DDE6EB" strokeLinecap="round" strokeWidth="1.2" />
      <path d="M34 40 47 32.5 60 40l-13 7.5L34 40Z" fill="url(#blanket)" />
      <path d="M34 40v9l13 7.5v-9L34 40Z" fill="#DD5E67" />
      <path d="M47 47.5v9L60 49v-9l-13 7.5Z" fill="#D12233" />
      <path d="M37 41.7 50 34.2" stroke="#FFF4F6" strokeLinecap="round" strokeOpacity="0.65" strokeWidth="1.5" />
      <path d="M17 47v8" stroke="#1F2937" strokeLinecap="round" strokeWidth="3" />
      <path d="M32 56v7" stroke="#1F2937" strokeLinecap="round" strokeWidth="3" />
      <path d="M56 51v8" stroke="#1F2937" strokeLinecap="round" strokeWidth="3" />
      <path d="M22 34 45 47" stroke="#FFFFFF" strokeLinecap="round" strokeOpacity="0.42" strokeWidth="1.5" />
    </g>
  </svg>
);

const BedSelection = () => {
  const { roomId } = useParams();
  const [selectedBed, setSelectedBed] = useState(null);
  const { beds: liveBeds, rooms: liveRooms } = useLiveAvailability();
  const baseRoom = bookingRooms.find((item) => item.id === roomId) || bookingRooms[0];
  const liveRoom = liveRooms.find((item) => item.id === baseRoom.id);
  const roomBeds = liveBeds.filter((bed) => bed.roomId === baseRoom.id);
  const room = liveRoom
    ? {
        ...baseRoom,
        beds: liveRoom.totalBeds,
        status: liveRoom.overallAvailability,
        monthlyRent: liveRoom.monthlyRent || baseRoom.monthlyRent,
        bedList: roomBeds.length
          ? roomBeds.map((bed) => ({ id: bed.id, label: bed.bedName, status: bed.status }))
          : baseRoom.bedList
      }
    : baseRoom;
  const branch = bookingBranches.find((item) => item.id === room.branchId) || bookingBranches[0];

  return (
    <main className="bg-paper/70">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">Bed Selection</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl">Room {room.number}</h1>
          <p className="mt-4 text-lg text-secondary">{branch.name} · {room.sharingType} · {room.roomType}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-14">
        <Card className="hover:translate-y-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-ink">Select a Bed</h2>
              <p className="mt-1 text-sm text-secondary">Only available beds can be selected.</p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-semibold text-secondary">
              <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-brand" /> Available</span>
              <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-line" /> Booked</span>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {room.bedList.map((bed) => {
              const available = bed.status === "Available";
              const active = selectedBed?.id === bed.id;
              return (
                <button
                  key={bed.id}
                  type="button"
                  disabled={!available}
                  onClick={() => setSelectedBed(bed)}
                  className={`min-h-32 rounded-[18px] border p-5 text-left transition duration-200 ${active ? "border-brand bg-brand/10 shadow-[0_18px_42px_rgba(221,94,103,0.28)] ring-2 ring-brand/30" : "border-line bg-white"} ${available ? "cursor-pointer hover:-translate-y-1 hover:scale-[1.03] hover:border-brandDark hover:shadow-luxury" : "cursor-not-allowed bg-paper"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="relative grid h-[72px] w-[72px] place-items-center">
                      <PremiumBedIllustration muted={!available} />
                      {!available && <span className="absolute inset-0 rounded-xl bg-slate-300/35" />}
                    </span>
                    {active ? (
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-white shadow-[0_8px_18px_rgba(221,94,103,0.35)]">
                        <Check className="h-4 w-4" />
                      </span>
                    ) : !available ? (
                      <Lock className="h-5 w-5 text-muted" />
                    ) : (
                      <span className="h-5 w-5" />
                    )}
                  </div>
                  <p className="mt-5 text-xl font-semibold text-ink">{bed.label}</p>
                  <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${active ? "bg-brand/10 text-brand" : available ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                    {active ? "Selected" : bed.status}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="h-fit hover:translate-y-0">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">Booking Summary</p>
          <h2 className="mt-3 text-2xl font-semibold text-ink">Your Selection</h2>

          <div className="mt-6 grid gap-4 text-sm">
            {[
              ["Branch", branch.name],
              ["Room Number", `Room ${room.number}`],
              ["Sharing Type", room.sharingType],
              ["AC / Non AC", room.roomType],
              ["Selected Bed", selectedBed?.label || "Select an available bed"],
              ["Monthly Rent", formatCurrency(room.monthlyRent)],
              ["Security Deposit", formatCurrency(room.securityDeposit)],
              ["Booking Amount", formatCurrency(room.bookingAmount)]
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
                <span className="font-semibold text-secondary">{label}</span>
                <span className="text-right font-semibold text-ink">{value}</span>
              </div>
            ))}
          </div>

          {selectedBed ? (
            <Link
              to={`/booking-details?roomId=${room.id}&bedId=${selectedBed.id}`}
              state={{ roomId: room.id, bedId: selectedBed.id, selectedBed }}
              className="mt-7 block"
            >
              <Button className="w-full">Continue Booking</Button>
            </Link>
          ) : (
            <Button className="mt-7 w-full" disabled>Continue Booking</Button>
          )}
          <Link to={`/branches/${branch.id}/rooms`} className="mt-3 block">
            <Button variant="secondary" className="w-full">Back to Rooms</Button>
          </Link>
        </Card>
      </section>
    </main>
  );
};

export default BedSelection;
