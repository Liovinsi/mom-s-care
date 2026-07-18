import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  Circle,
  Clock,
  DoorOpen,
  Eye,
  Home,
  Image,
  Lock,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
  Window,
  X
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const room = {
  branch: "Aurelia Indiranagar",
  roomNumber: "Aurelia 204",
  climate: "AC",
  sharing: "4 Sharing",
  rent: 18500,
  deposit: 37000,
  availableBeds: 2,
  moveInDate: "20 Jul 2026",
  token: 2500,
  gst: 450,
  images: [
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=500&q=80"
  ]
};

const beds = [
  {
    id: "A1",
    status: "available",
    position: "Top",
    features: ["Window Bed", "Corner Bed", "Premium"],
    area: "window"
  },
  {
    id: "A2",
    status: "booked",
    position: "Bottom",
    features: ["Window Bed"],
    area: "window"
  },
  {
    id: "B1",
    status: "available",
    position: "Top",
    features: ["Premium"],
    area: "walkway"
  },
  {
    id: "B2",
    status: "reserved",
    position: "Bottom",
    features: ["Corner Bed"],
    area: "walkway"
  }
];

const statusStyles = {
  available: {
    label: "Available",
    dot: "bg-success",
    border: "border-success/35",
    background: "bg-success/8",
    text: "text-success",
    icon: Circle
  },
  booked: {
    label: "Booked",
    dot: "bg-danger",
    border: "border-danger/35",
    background: "bg-danger/8",
    text: "text-danger",
    icon: X
  },
  reserved: {
    label: "Reserved",
    dot: "bg-warning",
    border: "border-warning/40",
    background: "bg-warning/10",
    text: "text-warning",
    icon: Lock
  },
  selected: {
    label: "Selected",
    dot: "bg-blue-600",
    border: "border-blue-600",
    background: "bg-blue-600/10",
    text: "text-blue-600",
    icon: Check
  }
};

const formatCurrency = (value) => `₹${value.toLocaleString("en-IN")}`;

const LuxuryNavbar = () => (
  <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      <Link to="/" className="flex items-center gap-3 text-lg font-semibold text-ink">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-gold/30 bg-gold/10">
          <Building2 className="h-5 w-5 text-gold" />
        </span>
        <span>
          PGStay
          <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-muted">Luxe Living</span>
        </span>
      </Link>
      <nav className="hidden items-center gap-7 md:flex">
        {["Home", "Branches", "Rooms", "Support"].map((item) => (
          <a key={item} href={item === "Home" ? "/" : "#"} className="text-sm font-semibold text-secondary transition hover:text-gold">
            {item}
          </a>
        ))}
      </nav>
      <Link to="/login">
        <Button variant="secondary" className="min-w-24">Login</Button>
      </Link>
    </div>
  </header>
);

const Breadcrumb = () => (
  <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-5 text-sm font-semibold text-secondary sm:px-6 lg:px-8">
    <Link to="/" className="hover:text-gold">Home</Link>
    <ChevronRight className="h-4 w-4 text-muted" />
    <Link to="/branches" className="hover:text-gold">Branch</Link>
    <ChevronRight className="h-4 w-4 text-muted" />
    <Link to="/branches/aurelia-indiranagar/rooms" className="hover:text-gold">Room</Link>
    <ChevronRight className="h-4 w-4 text-muted" />
    <span className="text-ink">Select Bed</span>
  </nav>
);

const StatusBadge = ({ status }) => {
  const style = statusStyles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${style.background} ${style.text}`}>
      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
};

const RoomSummary = () => (
  <Card className="hover:translate-y-0">
    <div className="grid gap-6 lg:grid-cols-[1fr_260px] lg:items-center">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold">Room Summary</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-ink">{room.roomNumber}</h1>
          <StatusBadge status="available" />
        </div>
        <p className="mt-3 flex items-center gap-2 text-secondary">
          <Building2 className="h-4 w-4 text-gold" /> {room.branch}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Room Type", room.climate, Sparkles],
            ["Sharing Type", room.sharing, BedDouble],
            ["Monthly Rent", formatCurrency(room.rent), Wallet],
            ["Deposit", formatCurrency(room.deposit), ShieldCheck],
            ["Available Beds", `${room.availableBeds} beds`, Check]
          ].map(([label, value, Icon]) => (
            <div key={label} className="rounded-[18px] border border-line bg-white p-4">
              <Icon className="h-5 w-5 text-gold" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted">{label}</p>
              <p className="mt-1 font-semibold text-ink">{value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
        {room.images.map((image, index) => (
          <div key={image} className="relative overflow-hidden rounded-[18px] shadow-soft">
            <img src={image} alt={`${room.roomNumber} preview ${index + 1}`} className="h-24 w-full object-cover lg:h-24" />
            {index === 0 && (
              <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[11px] font-semibold text-ink">
                <Image className="h-3 w-3 text-gold" /> Preview
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  </Card>
);

const Legend = () => (
  <Card className="hover:translate-y-0">
    <div className="flex flex-wrap items-center gap-3">
      <p className="mr-2 text-sm font-semibold text-ink">Legend</p>
      {["available", "booked", "reserved", "selected"].map((status) => (
        <StatusBadge key={status} status={status} />
      ))}
    </div>
  </Card>
);

const BedCard = ({ bed, selected, onSelect }) => {
  const state = selected ? "selected" : bed.status;
  const style = statusStyles[state];
  const Icon = style.icon;
  const disabled = bed.status !== "available";

  return (
    <button
      type="button"
      disabled={disabled}
      title={`${bed.id} is ${style.label}. ${bed.features.join(", ")}`}
      aria-label={`Bed ${bed.id}, ${style.label}, ${bed.position}, ${bed.features.join(", ")}`}
      aria-pressed={selected}
      onClick={() => onSelect(bed)}
      className={`group relative min-h-44 rounded-[18px] border-2 p-4 text-left shadow-soft outline-none transition duration-300 focus:ring-4 focus:ring-gold/20 ${
        style.border
      } ${style.background} ${
        selected ? "scale-[1.02] shadow-[0_24px_60px_rgba(37,99,235,0.25)] ring-4 ring-blue-600/15" : "hover:-translate-y-1 hover:shadow-luxury"
      } ${disabled ? "cursor-not-allowed opacity-75" : "cursor-pointer"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-muted">Bed Number</p>
          <h3 className="mt-2 text-3xl font-semibold text-ink">{bed.id}</h3>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-full bg-white ${style.text}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <StatusBadge status={state} />
        <span className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-secondary">{bed.position}</span>
        {bed.features.map((feature) => (
          <span key={feature} className="rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-secondary">
            {feature}
          </span>
        ))}
      </div>
      <div className="mt-5 h-2 rounded-full bg-white">
        <div className={`h-2 rounded-full ${style.dot} transition-all duration-300 ${selected ? "w-full" : "w-1/2 group-hover:w-3/4"}`} />
      </div>
    </button>
  );
};

const BedLayout = ({ selectedBed, onSelect }) => (
  <Card className="overflow-hidden hover:translate-y-0">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold">Interactive Bed Layout</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Choose Your Preferred Bed</h2>
      </div>
      <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-secondary">
        <DoorOpen className="h-4 w-4 text-gold" /> Entrance
      </span>
    </div>

    <div className="rounded-[18px] border border-line bg-paper p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-gold/30 bg-white px-4 py-3 text-sm font-semibold text-ink shadow-soft">
        <Window className="h-4 w-4 text-gold" /> Window Side
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_88px_1fr] lg:items-stretch">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {beds.filter((bed) => bed.area === "window").map((bed) => (
            <BedCard key={bed.id} bed={bed} selected={selectedBed?.id === bed.id} onSelect={onSelect} />
          ))}
        </div>

        <div className="flex min-h-20 items-center justify-center rounded-[18px] border border-dashed border-gold/50 bg-white px-3 py-5 text-center text-xs font-bold uppercase tracking-[0.2em] text-gold lg:[writing-mode:vertical-rl]">
          Walkway
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {beds.filter((bed) => bed.area === "walkway").map((bed) => (
            <BedCard key={bed.id} bed={bed} selected={selectedBed?.id === bed.id} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  </Card>
);

const SelectedBedPanel = ({ selectedBed }) => (
  <Card className="hover:translate-y-0">
    <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold">Selected Bed</p>
    {selectedBed ? (
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[
          ["Selected Bed", selectedBed.id],
          ["Branch", room.branch],
          ["Room Number", room.roomNumber],
          ["Sharing Type", room.sharing],
          ["Monthly Rent", formatCurrency(room.rent)],
          ["Deposit", formatCurrency(room.deposit)],
          ["Move-in Date", room.moveInDate]
        ].map(([label, value]) => (
          <div key={label} className="rounded-[18px] border border-line p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</p>
            <p className="mt-2 font-semibold text-ink">{value}</p>
          </div>
        ))}
      </div>
    ) : (
      <div className="mt-4 rounded-[18px] border border-dashed border-line bg-paper p-6 text-sm font-semibold text-secondary">
        Select an available bed to see your booking details.
      </div>
    )}
  </Card>
);

const BookingSummary = ({ selectedBed }) => {
  const total = room.rent + room.deposit + room.token + room.gst;
  const items = [
    ["Room Rent", formatCurrency(room.rent)],
    ["Deposit", formatCurrency(room.deposit)],
    ["Booking Token", formatCurrency(room.token)],
    ["GST", formatCurrency(room.gst)],
    ["Total Amount", formatCurrency(total)]
  ];

  return (
    <Card className="hover:translate-y-0">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold">Booking Summary</p>
      <div className="mt-4 space-y-3">
        {items.map(([label, value], index) => (
          <div key={label} className={`flex items-center justify-between gap-4 rounded-xl px-4 py-3 ${index === items.length - 1 ? "bg-gold/10 text-ink" : "border border-line"}`}>
            <span className="text-sm font-semibold text-secondary">{label}</span>
            <span className="font-semibold text-ink">{value}</span>
          </div>
        ))}
      </div>
      <Button disabled={!selectedBed} className="mt-5 w-full">Continue</Button>
    </Card>
  );
};

const StickySidebar = ({ selectedBed }) => (
  <aside className="lg:sticky lg:top-24 lg:self-start">
    <Card className="hover:translate-y-0">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold">Selection</p>
      <h2 className="mt-2 text-2xl font-semibold text-ink">{selectedBed ? `Bed ${selectedBed.id}` : "No bed selected"}</h2>
      <div className="mt-5 space-y-3 text-sm">
        {[
          ["Monthly Rent", formatCurrency(room.rent)],
          ["Deposit", formatCurrency(room.deposit)],
          ["Booking Token", formatCurrency(room.token)]
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 border-b border-line pb-3">
            <span className="text-secondary">{label}</span>
            <span className="font-semibold text-ink">{value}</span>
          </div>
        ))}
      </div>
      <Button disabled={!selectedBed} className="mt-5 w-full">Continue</Button>
      <Button variant="secondary" className="mt-3 w-full">
        <MessageCircle className="h-4 w-4" /> Contact Warden
      </Button>
    </Card>
  </aside>
);

const EmptyState = () => (
  <Card className="text-center hover:translate-y-0">
    <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-gold/10">
      <BedDouble className="h-14 w-14 text-gold" />
    </div>
    <h2 className="mt-6 text-2xl font-semibold text-ink">No Beds Available</h2>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-secondary">
      This room is fully occupied or reserved. Browse similar rooms with open beds.
    </p>
    <Button className="mt-6">View Other Rooms</Button>
  </Card>
);

const SkeletonLoader = () => (
  <div className="grid gap-5">
    {[1, 2, 3].map((item) => (
      <div key={item} className="rounded-[18px] border border-line bg-white p-5 shadow-soft">
        <div className="h-5 w-1/3 animate-pulse rounded bg-paper" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="h-36 animate-pulse rounded-[18px] bg-paper" />
          <div className="h-36 animate-pulse rounded-[18px] bg-paper" />
        </div>
      </div>
    ))}
  </div>
);

const BedSelectionPage5 = () => {
  const [selectedBed, setSelectedBed] = useState(null);
  const loading = false;
  const availableBeds = useMemo(() => beds.filter((bed) => bed.status === "available"), []);

  return (
    <div className="min-h-screen bg-white text-ink">
      <LuxuryNavbar />
      <Breadcrumb />

      <main className="mx-auto grid max-w-7xl gap-8 px-4 pb-14 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8">
        <div className="space-y-6">
          <RoomSummary />
          <Legend />

          {loading ? (
            <SkeletonLoader />
          ) : availableBeds.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <BedLayout selectedBed={selectedBed} onSelect={setSelectedBed} />
              <SelectedBedPanel selectedBed={selectedBed} />
              <BookingSummary selectedBed={selectedBed} />
            </>
          )}
        </div>

        <StickySidebar selectedBed={selectedBed} />
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm text-secondary sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
          <div>
            <p className="text-lg font-semibold text-ink">PGStay Luxe</p>
            <p className="mt-2">Premium bed selection for confident PG booking.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gold" /> {room.moveInDate}</span>
            <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-gold" /> Assisted booking</span>
            <span className="inline-flex items-center gap-2"><Star className="h-4 w-4 fill-gold text-gold" /> Luxury room fit</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BedSelectionPage5;
