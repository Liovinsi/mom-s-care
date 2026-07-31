import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Camera,
  Car,
  Check,
  ChevronRight,
  Clock,
  Droplets,
  Eye,
  Home,
  KeyRound,
  Lock,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Shirt,
  Snowflake,
  Sparkles,
  Star,
  Table2,
  Utensils,
  WashingMachine,
  Wifi,
  Zap
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

const room = {
  number: "Aurelia 204",
  branch: "Aurelia Indiranagar",
  location: "Indiranagar, Bengaluru",
  type: "Premium Ensuite Room",
  climate: "AC",
  sharing: "4 Sharing",
  floor: "2nd Floor",
  size: "420 sq ft",
  rent: "18,500",
  deposit: "37,000",
  maintenance: "1,200",
  electricity: "As per meter",
  food: "Included",
  availableFrom: "20 Jul 2026",
  rating: "4.9",
  description:
    "A calm, hotel-inspired room with generous natural light, refined finishes, individual storage, ergonomic study corners, and ensuite bathroom access. Designed for residents who want privacy, comfort, and a serviced-living experience."
};

const gallery = [
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1400&q=80"
];

const amenities = [
  ["WiFi", Wifi],
  ["Air Conditioning", Snowflake],
  ["Attached Bathroom", Bath],
  ["Hot Water", Droplets],
  ["Power Backup", Zap],
  ["RO Water", Droplets],
  ["Laundry", WashingMachine],
  ["Housekeeping", Sparkles],
  ["Parking", Car],
  ["Lift", Building2],
  ["Wardrobe", Shirt],
  ["Study Table", Table2],
  ["CCTV", Eye],
  ["24x7 Security", ShieldCheck]
];

const bedSummary = [
  ["Total Beds", "4 Beds", BedDouble],
  ["Available Beds", "2 Available", Check],
  ["Reserved Beds", "1 Reserved", Lock],
  ["Booked Beds", "1 Booked", KeyRound]
];

const houseRules = [
  ["No Smoking", "Smoking is not permitted inside rooms or corridors."],
  ["No Alcohol", "Alcohol consumption is restricted inside the property."],
  ["Visitors Allowed", "Visitors are allowed in lounge areas with prior entry approval."],
  ["Entry Time", "Daily entry closes at 10:30 PM unless pre-approved."],
  ["Quiet Hours", "Maintain quiet hours from 10:00 PM to 6:00 AM."],
  ["Notice Period", "30 days notice is required before vacating."],
  ["Refund Policy", "Deposit refund follows room inspection and dues clearance."]
];

const reviews = [
  {
    name: "Ananya Rao",
    date: "08 Jul 2026",
    rating: "5.0",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    comment: "The room feels premium and quiet. Housekeeping, meals, and security are consistently dependable."
  },
  {
    name: "Rohan Mehta",
    date: "28 Jun 2026",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    comment: "Great location and a polished setup. The study table and storage made daily living easy."
  },
  {
    name: "Nisha Kapoor",
    date: "12 Jun 2026",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    comment: "Clean bathroom, fast WiFi, and a calm floor. It feels closer to a serviced residence than a PG."
  }
];

const relatedRooms = [
  {
    number: "Aurelia 205",
    sharing: "3 Sharing",
    rent: "20,000",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80"
  },
  {
    number: "Aurelia 301",
    sharing: "2 Sharing",
    rent: "24,500",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
  },
  {
    number: "Aurelia 108",
    sharing: "4 Sharing",
    rent: "17,800",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
  }
];

const LuxuryNavbar = () => (
  <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      <Link to="/" className="flex items-center gap-3 text-lg font-semibold text-ink">
        <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-brand/20 bg-white shadow-soft"><img src="/logo.jpeg" alt="PG Stay logo" className="h-full w-full object-cover" /></span>
        <span>
          PGStay
          <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-muted">Luxe Living</span>
        </span>
      </Link>
      <nav className="hidden items-center gap-7 md:flex">
        {["Home", "Branches", "Amenities", "Reviews"].map((item) => (
          <a key={item} href={item === "Home" ? "/" : `#${item.toLowerCase()}`} className="text-sm font-semibold text-secondary transition hover:text-brandDark">
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
  <nav className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-5 text-sm font-semibold text-secondary sm:px-6 lg:px-8">
    <Link to="/" className="hover:text-brandDark">Home</Link>
    <ChevronRight className="h-4 w-4 text-muted" />
    <Link to="/branches" className="hover:text-brandDark">Branch</Link>
    <ChevronRight className="h-4 w-4 text-muted" />
    <span className="text-ink">Room Details</span>
  </nav>
);

const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand">
    {children}
  </span>
);

const ImageGallery = () => {
  const [active, setActive] = useState(0);
  const previous = () => setActive((index) => (index === 0 ? gallery.length - 1 : index - 1));
  const next = () => setActive((index) => (index === gallery.length - 1 ? 0 : index + 1));

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[18px] shadow-luxury">
        <img src={gallery[active]} alt={`${room.number} gallery ${active + 1}`} className="h-[360px] w-full object-cover sm:h-[520px]" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-ink/65 to-transparent p-4 sm:p-6">
          <div className="text-white">
            <p className="text-sm font-semibold">Photo {active + 1} of {gallery.length}</p>
            <h1 className="mt-1 text-2xl font-semibold sm:text-4xl">{room.number}</h1>
          </div>
          <Button variant="secondary" className="border-white/40 bg-white/95">
            <Camera className="h-4 w-4" /> View All Photos
          </Button>
        </div>
        <button onClick={previous} className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-ink shadow-soft transition hover:text-brandDark" aria-label="Previous image">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button onClick={next} className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-ink shadow-soft transition hover:text-brandDark" aria-label="Next image">
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-3">
        {gallery.map((image, index) => (
          <button
            key={image}
            onClick={() => setActive(index)}
            className={`overflow-hidden rounded-[18px] border-2 transition ${active === index ? "border-brand shadow-soft" : "border-transparent opacity-75 hover:opacity-100"}`}
          >
            <img src={image} alt={`${room.number} thumbnail ${index + 1}`} className="h-20 w-full object-cover sm:h-28" />
          </button>
        ))}
      </div>
    </section>
  );
};

const SectionTitle = ({ eyebrow, title }) => (
  <div className="mb-6">
    {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand">{eyebrow}</p>}
    <h2 className="mt-2 text-2xl font-semibold text-ink">{title}</h2>
  </div>
);

const PricingCard = () => {
  const items = [
    ["Monthly Rent", `₹${room.rent}`],
    ["Security Deposit", `₹${room.deposit}`],
    ["Maintenance Charges", `₹${room.maintenance}`],
    ["Electricity Charges", room.electricity],
    ["Food Charges", room.food],
    ["Available From", room.availableFrom]
  ];

  return (
    <Card className="hover:translate-y-0">
      <SectionTitle eyebrow="Pricing" title="Transparent Room Charges" />
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-[18px] border border-line bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</p>
            <p className="mt-2 text-lg font-semibold text-ink">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Input label="Move-in Date" type="text" placeholder="Select preferred date" />
      </div>
    </Card>
  );
};

const AmenitiesGrid = () => (
  <section id="amenities">
    <SectionTitle eyebrow="Amenities" title="Facilities Included" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {amenities.map(([name, Icon]) => (
        <div key={name} className="rounded-[18px] border border-line bg-white p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-luxury">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
            <Icon className="h-5 w-5" />
          </span>
          <p className="mt-4 font-semibold text-ink">{name}</p>
        </div>
      ))}
    </div>
  </section>
);

const BedSummary = () => (
  <Card className="hover:translate-y-0">
    <SectionTitle eyebrow="Beds" title="Available Beds Summary" />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {bedSummary.map(([label, value, Icon]) => (
        <div key={label} className="rounded-[18px] border border-line p-4">
          <Icon className="h-5 w-5 text-brand" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted">{label}</p>
          <p className="mt-1 text-lg font-semibold text-ink">{value}</p>
        </div>
      ))}
    </div>
    <Link to="/rooms/aurelia-204/beds" className="mt-5 inline-block">
      <Button>Select Your Bed</Button>
    </Link>
  </Card>
);

const HouseRules = () => (
  <section>
    <SectionTitle eyebrow="House Rules" title="Resident Guidelines" />
    <div className="grid gap-3 md:grid-cols-2">
      {houseRules.map(([title, detail]) => (
        <div key={title} className="rounded-[18px] border border-line bg-white p-5 shadow-soft">
          <div className="flex items-start gap-3">
            <Check className="mt-1 h-5 w-5 shrink-0 text-brand" />
            <div>
              <h3 className="font-semibold text-ink">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-secondary">{detail}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const Reviews = () => (
  <section id="reviews">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <SectionTitle eyebrow="Reviews" title="Resident Feedback" />
      <div className="rounded-[18px] border border-line bg-white px-5 py-4 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Overall Rating</p>
        <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-ink">
          <Star className="h-5 w-5 fill-brand text-brand" /> {room.rating}
        </p>
      </div>
    </div>
    <div className="grid gap-4 lg:grid-cols-3">
      {reviews.map((review) => (
        <Card key={review.name}>
          <div className="flex items-center gap-3">
            <img src={review.image} alt={review.name} className="h-12 w-12 rounded-full object-cover" />
            <div>
              <h3 className="font-semibold text-ink">{review.name}</h3>
              <p className="text-xs font-semibold text-muted">{review.date}</p>
            </div>
          </div>
          <p className="mt-4 flex items-center gap-1 text-sm font-semibold text-brand">
            <Star className="h-4 w-4 fill-brand" /> {review.rating}
          </p>
          <p className="mt-3 text-sm leading-6 text-secondary">{review.comment}</p>
        </Card>
      ))}
    </div>
    <Button variant="secondary" className="mt-5">View All Reviews</Button>
  </section>
);

const BookingSidebar = () => (
  <aside className="lg:sticky lg:top-24 lg:self-start">
    <Card className="hover:translate-y-0">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand">Booking Summary</p>
      <h2 className="mt-2 text-2xl font-semibold text-ink">₹{room.rent}<span className="text-sm font-medium text-muted"> / month</span></h2>
      <div className="mt-5 space-y-3 text-sm">
        {[
          ["Deposit", `₹${room.deposit}`],
          ["Available Beds", "2 beds"],
          ["Selected Room", room.number],
          ["Move-in Date", "20 Jul 2026"]
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 border-b border-line pb-3">
            <span className="text-secondary">{label}</span>
            <span className="font-semibold text-ink">{value}</span>
          </div>
        ))}
      </div>
      <Link to="/rooms/aurelia-204/beds" className="mt-5 block">
        <Button className="w-full">Select Bed</Button>
      </Link>
      <Button variant="secondary" className="mt-3 w-full">
        <MessageCircle className="h-4 w-4" /> Contact Warden
      </Button>
    </Card>
  </aside>
);

const RelatedRooms = () => (
  <section className="bg-paper py-16">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionTitle eyebrow="Related Rooms" title="Similar Rooms You May Like" />
      <div className="grid gap-6 md:grid-cols-3">
        {relatedRooms.map((item) => (
          <Card key={item.number} className="overflow-hidden p-0">
            <img src={item.image} alt={item.number} className="h-52 w-full object-cover" />
            <div className="p-5">
              <h3 className="text-xl font-semibold text-ink">{item.number}</h3>
              <p className="mt-2 text-sm text-secondary">{item.sharing}</p>
              <p className="mt-4 text-2xl font-semibold text-ink">₹{item.rent}<span className="text-sm font-medium text-muted"> / month</span></p>
              <Button variant="secondary" className="mt-5 w-full">View Details</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

const RoomDetailsPage4 = () => (
  <div className="min-h-screen bg-white text-ink">
    <LuxuryNavbar />
    <Breadcrumb />
    <ImageGallery />

    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8">
      <div className="space-y-12">
        <section>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge>{room.climate}</Badge>
                <Badge>{room.sharing}</Badge>
              </div>
              <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink">{room.number}</h1>
              <p className="mt-3 flex items-center gap-2 text-secondary">
                <MapPin className="h-4 w-4 text-brand" /> {room.branch}, {room.location}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
              <Star className="h-4 w-4 fill-brand" /> {room.rating}
            </span>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Room Type", room.type, Home],
              ["Floor Number", room.floor, Building2],
              ["Room Size", room.size, Sparkles],
              ["Sharing Type", room.sharing, BedDouble]
            ].map(([label, value, Icon]) => (
              <div key={label} className="rounded-[18px] border border-line bg-white p-5 shadow-soft">
                <Icon className="h-5 w-5 text-brand" />
                <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted">{label}</p>
                <p className="mt-1 font-semibold text-ink">{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-base leading-8 text-secondary">{room.description}</p>
        </section>

        <PricingCard />
        <AmenitiesGrid />
        <BedSummary />
        <HouseRules />
        <Reviews />
      </div>

      <BookingSidebar />
    </main>

    <RelatedRooms />

    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm text-secondary sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
        <div>
          <p className="text-lg font-semibold text-ink">PGStay Luxe</p>
          <p className="mt-2">Premium PG discovery with hotel-inspired room detail experiences.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-brand" /> Move-in ready</span>
          <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-brand" /> 24x7 support</span>
        </div>
      </div>
    </footer>
  </div>
);

export default RoomDetailsPage4;
