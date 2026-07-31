import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  BedDouble,
  Building2,
  Bus,
  Camera,
  Check,
  Droplets,
  GraduationCap,
  Hospital,
  KeyRound,
  Landmark,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Utensils,
  WashingMachine,
  Wifi,
  Zap
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { bookingBranches, bookingRooms, formatCurrency } from "../../data/bookingFlow";
import { adminBranchIdFromPublicBranchId, useLiveAvailability } from "../../lib/liveAvailability";

const sharingTypes = ["1 Sharing", "2 Sharing", "3 Sharing", "4 Sharing"];
const roomTypes = ["AC", "Non AC"];
const galleryFallbacks = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=80"
];
const galleryLabels = ["Building Front", "Reception", "Room", "Washroom", "Dining Hall", "Terrace"];
const quickHighlights = ["Near Metro", "Near Bus Stop", "Near College", "Near IT Park", "CCTV", "WiFi", "Food Included", "Power Backup"];
const nearbyPlaces = [
  ["Metro Station", "300m", Landmark],
  ["Bus Stand", "200m", Bus],
  ["Hospital", "800m", Hospital],
  ["Supermarket", "500m", ShoppingBag],
  ["College", "1 km", GraduationCap],
  ["IT Park", "2 km", Building2]
];
const amenityCards = [
  ["WiFi", Wifi],
  ["Healthy Food", Utensils],
  ["Laundry", WashingMachine],
  ["Housekeeping", Sparkles],
  ["RO Water", Droplets],
  ["Power Backup", Zap],
  ["Biometric Entry", KeyRound],
  ["CCTV Security", Camera]
];

const RoomDetails = () => {
  const { branchId } = useParams();
  const [sharingType, setSharingType] = useState("");
  const [roomType, setRoomType] = useState("");
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);
  const { rooms: liveRooms } = useLiveAvailability();
  const branch = bookingBranches.find((item) => item.id === branchId) || bookingBranches[0];
  const liveBranchRooms = liveRooms.filter((room) => room.branchId === adminBranchIdFromPublicBranchId(branch.id));
  const branchOccupancy = liveBranchRooms.length
    ? {
        totalRooms: liveBranchRooms.length,
        bookedRooms: liveBranchRooms.filter((room) => room.overallAvailability !== "Available").length,
        availableRooms: liveBranchRooms.filter((room) => room.overallAvailability === "Available").length
      }
    : branch.occupancy;
  const galleryImages = galleryLabels.map((label, index) => ({
    label,
    image: branch.gallery[index] || galleryFallbacks[index]
  }));
  const selectedGallery = galleryImages[selectedGalleryIndex] || galleryImages[0];
  const occupancyRate = Math.round((branchOccupancy.bookedRooms / branchOccupancy.totalRooms) * 100);
  const mapEmbedUrl = `https://www.google.com/maps?q=${branch.latitude},${branch.longitude}&z=15&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${branch.latitude},${branch.longitude}`;

  const rooms = useMemo(
    () =>
      bookingRooms.map((room) => {
        const liveRoom = liveRooms.find((item) => item.id === room.id);
        if (!liveRoom) return room;

        return {
          ...room,
          beds: liveRoom.totalBeds,
          status: liveRoom.overallAvailability,
          monthlyRent: liveRoom.monthlyRent || room.monthlyRent
        };
      }).filter((room) => {
        const branchMatch = room.branchId === branch.id;
        const sharingMatch = !sharingType || room.sharingType === sharingType;
        const roomMatch = !roomType || room.roomType === roomType;
        return branchMatch && sharingMatch && roomMatch;
      }),
    [branch.id, liveRooms, roomType, sharingType]
  );

  return (
    <main className="bg-paper/70">
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-14">
          <div className="grid gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">Branch Gallery</p>
              <img src={selectedGallery.image} alt={`${branch.name} ${selectedGallery.label}`} className="mt-4 h-80 w-full rounded-[18px] object-cover shadow-luxury" />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {galleryImages.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setSelectedGalleryIndex(index)}
                  className={`overflow-hidden rounded-[18px] border bg-white text-left shadow-soft transition ${selectedGalleryIndex === index ? "border-brand ring-2 ring-brand/20" : "border-line hover:border-brandDark"}`}
                >
                  <img src={item.image} alt={`${branch.name} ${item.label}`} className="h-24 w-full object-cover" />
                  <span className="block px-3 py-2 text-xs font-semibold text-secondary">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">Branch Overview</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
                <span aria-hidden="true">★★★★★</span> {branch.rating}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-sm font-semibold text-secondary">
                <ShieldCheck className="h-4 w-4 text-brand" /> Verified PG
              </span>
            </div>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
              <h1 className="text-4xl font-semibold leading-tight text-ink sm:text-5xl">{branch.name}</h1>
            </div>
            <p className="mt-5 flex items-start gap-2 text-secondary">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-brand" />
              <span>{branch.addressLines.map((line) => <span key={line} className="block">{line}</span>)}</span>
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                ["Established Year", "2021"],
                ["Residents", "Boys / Girls / Unisex"],
                ["Rooms", `${branchOccupancy.totalRooms} Rooms`],
                ["Occupied", `${branchOccupancy.bookedRooms} Occupied`],
                ["Available", `${branchOccupancy.availableRooms} Available`]
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-line bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</p>
                  <p className="mt-1 font-semibold text-ink">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <Card className="hover:translate-y-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">Google Map</p>
                <div className="mt-4 h-36 overflow-hidden rounded-[18px] border border-line bg-paper">
                  <iframe
                    src={mapEmbedUrl}
                    title={`${branch.name} Google Map`}
                    className="h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
                <div className="mt-4 grid gap-3 text-sm text-secondary">
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <span>{branch.fullAddress.split("\n").map((line) => <span key={line} className="block">{line}</span>)}</span>
                  </p>
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 font-semibold text-brand transition hover:text-ink"
                  >
                    <Navigation className="h-4 w-4" /> Get Directions
                  </a>
                </div>
              </Card>
              <Card className="hover:translate-y-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">Contact Number</p>
                <p className="mt-5 flex items-center gap-2 text-xl font-semibold text-ink">
                  <Phone className="h-5 w-5 text-brand" /> {branch.contactNumber}
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Card className="hover:translate-y-0">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">Quick Highlights</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {quickHighlights.map((highlight) => (
              <span key={highlight} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-secondary">
                <Check className="h-4 w-4 text-brand" /> {highlight}
              </span>
            ))}
          </div>
        </Card>

        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {[
            ["Total Rooms", branchOccupancy.totalRooms],
            ["Occupied", branchOccupancy.bookedRooms],
            ["Available", branchOccupancy.availableRooms],
            ["Occupancy %", `${occupancyRate}%`]
          ].map(([label, value]) => (
            <Card key={label} className="hover:translate-y-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</p>
              <p className="mt-3 text-4xl font-semibold text-ink">{value}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-8 hover:translate-y-0">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">Nearby Places</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {nearbyPlaces.map(([place, distance, Icon]) => (
              <div key={place} className="flex items-center justify-between gap-4 rounded-xl border border-line bg-white px-4 py-3">
                <span className="inline-flex items-center gap-2 font-semibold text-secondary">
                  <Icon className="h-4 w-4 text-brand" /> {place}
                </span>
                <span className="font-semibold text-ink">{distance}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="mt-8 hover:translate-y-0">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">Amenities</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {amenityCards.map(([amenity, Icon]) => (
              <div key={amenity} className="rounded-[18px] border border-line bg-white p-4">
                <Icon className="h-5 w-5 text-brand" />
                <p className="mt-3 font-semibold text-ink">{amenity}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="mt-8 hover:translate-y-0">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">Room Filters</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Find Matching Rooms</h2>
            </div>
            <Button variant="secondary" onClick={() => { setSharingType(""); setRoomType(""); }}>Reset Filters</Button>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold text-ink">Sharing Type</p>
              <div className="grid gap-2 sm:grid-cols-4">
                {sharingTypes.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSharingType((current) => (current === option ? "" : option))}
                    className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold transition ${sharingType === option ? "border-brand bg-brand text-white" : "border-line bg-white text-secondary hover:border-brandDark hover:text-brandDark"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-ink">Room Type</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {roomTypes.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRoomType((current) => (current === option ? "" : option))}
                    className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold transition ${roomType === option ? "border-brand bg-brand text-white" : "border-line bg-white text-secondary hover:border-brandDark hover:text-brandDark"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-ink">Available Rooms</h2>
              <p className="mt-1 text-sm text-secondary">{rooms.length} rooms match the selected filters.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Card key={room.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted">Room {room.number}</p>
                    <h3 className="mt-2 text-2xl font-semibold text-ink">Room {room.number}</h3>
                  </div>
                  <span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">{room.status}</span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <p className="rounded-xl border border-line px-3 py-2 font-semibold text-secondary">{room.sharingType}</p>
                  <p className="rounded-xl border border-line px-3 py-2 font-semibold text-secondary">{room.roomType}</p>
                  <p className="rounded-xl border border-line px-3 py-2 font-semibold text-secondary">{room.beds} Beds</p>
                  <p className="rounded-xl border border-line px-3 py-2 font-semibold text-secondary">{formatCurrency(room.monthlyRent)}</p>
                </div>
                <Link to={`/rooms/${room.id}/beds`} className="mt-5 block">
                  <Button className="w-full">
                    <BedDouble className="h-4 w-4" /> View Beds
                  </Button>
                </Link>
              </Card>
            ))}
          </div>

          {!rooms.length && (
            <Card className="text-center hover:translate-y-0">
              <Building2 className="mx-auto h-8 w-8 text-brand" />
              <p className="mt-4 font-semibold text-ink">No rooms match this filter combination.</p>
              <p className="mt-2 text-sm text-secondary">Change sharing type or room type to view available rooms.</p>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
};

export default RoomDetails;
