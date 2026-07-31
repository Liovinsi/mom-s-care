import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bath,
  BedDouble,
  Building2,
  Car,
  ChevronDown,
  Droplets,
  Dumbbell,
  Grid2X2,
  Heart,
  Home,
  List,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Utensils,
  WashingMachine,
  Wifi,
  Zap
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

const branches = [
  {
    id: "aurelia-indiranagar",
    name: "Aurelia Indiranagar",
    location: "Indiranagar, Bengaluru",
    rating: "4.9",
    beds: 12,
    rent: "18,500",
    gender: "Co-Living",
    type: "AC",
    sharing: "2 Sharing",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1100&q=80",
    description: "Boutique PG residence with chef meals, ensuite rooms, study lounges, and concierge-style support.",
    amenities: ["WiFi", "Food", "Laundry", "Security"]
  },
  {
    id: "rose-hsr",
    name: "Rosewood HSR House",
    location: "HSR Layout, Bengaluru",
    rating: "4.8",
    beds: 8,
    rent: "15,000",
    gender: "Female",
    type: "AC",
    sharing: "3 Sharing",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1100&q=80",
    description: "Quiet women-first branch near cafes and offices with balanced meals and premium housekeeping.",
    amenities: ["WiFi", "Food", "Lift", "RO Water"]
  },
  {
    id: "sterling-gachibowli",
    name: "Sterling Gachibowli",
    location: "Gachibowli, Hyderabad",
    rating: "4.7",
    beds: 18,
    rent: "13,500",
    gender: "Male",
    type: "Non AC",
    sharing: "4 Sharing",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1100&q=80",
    description: "Well-connected PG with generous common spaces, parking, backup power, and easy commute access.",
    amenities: ["Parking", "Power Backup", "Food", "Security"]
  },
  {
    id: "elysian-koramangala",
    name: "Elysian Koramangala",
    location: "Koramangala, Bengaluru",
    rating: "4.9",
    beds: 6,
    rent: "21,000",
    gender: "Co-Living",
    type: "AC",
    sharing: "2 Sharing",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1100&q=80",
    description: "Premium coliving address with refined interiors, fast WiFi, laundry care, and 24x7 security.",
    amenities: ["WiFi", "Laundry", "Lift", "Security"]
  },
  {
    id: "ivory-pune",
    name: "Ivory Viman Nagar",
    location: "Viman Nagar, Pune",
    rating: "4.6",
    beds: 14,
    rent: "12,800",
    gender: "Female",
    type: "Non AC",
    sharing: "3 Sharing",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1100&q=80",
    description: "Fresh, practical PG living close to colleges with RO water, meals, and managed maintenance.",
    amenities: ["Food", "RO Water", "Power Backup", "WiFi"]
  },
  {
    id: "regent-nungambakkam",
    name: "Regent Nungambakkam",
    location: "Nungambakkam, Chennai",
    rating: "4.8",
    beds: 10,
    rent: "16,200",
    gender: "Male",
    type: "AC",
    sharing: "2 Sharing",
    image: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1100&q=80",
    description: "Elegant rooms, dependable meals, lift access, and secure entry in a central city neighborhood.",
    amenities: ["Lift", "Food", "Security", "Laundry"]
  }
];

const amenityIcons = {
  WiFi: Wifi,
  Food: Utensils,
  Parking: Car,
  "Power Backup": Zap,
  Laundry: WashingMachine,
  Lift: Building2,
  "RO Water": Droplets,
  Security: ShieldCheck
};

const filterGroups = [
  ["Gender", ["Male", "Female", "Co-Living"]],
  ["Room Type", ["AC", "Non AC"]],
  ["Sharing Type", ["2 Sharing", "3 Sharing", "4 Sharing"]],
  ["Amenities", ["WiFi", "Food", "Parking", "Power Backup", "Laundry", "Lift", "RO Water", "24x7 Security"]]
];

const sortOptions = ["Newest", "Price Low to High", "Price High to Low", "Rating", "Most Popular"];

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
        {["Home", "Branches", "Amenities", "FAQ"].map((item) => (
          <a key={item} href={item === "Branches" ? "#branches" : "/"} className="text-sm font-semibold text-secondary transition hover:text-brandDark">
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

const FilterCheckbox = ({ label }) => (
  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line px-3 py-2.5 text-sm font-semibold text-secondary transition hover:border-brandDark hover:text-ink">
    <span>{label}</span>
    <input type="checkbox" className="h-4 w-4 accent-[#DD5E67]" />
  </label>
);

const FilterSidebar = () => (
  <aside className="rounded-[18px] border border-line bg-white p-5 shadow-soft lg:sticky lg:top-24 lg:self-start">
    <div className="flex items-center justify-between border-b border-line pb-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand">Filters</p>
        <h2 className="mt-1 text-xl font-semibold text-ink">Refine Stays</h2>
      </div>
      <SlidersHorizontal className="h-5 w-5 text-brand" />
    </div>

    <div className="mt-5 space-y-6">
      <Input label="Location" placeholder="City, area, or branch" />

      {filterGroups.map(([title, options]) => (
        <div key={title}>
          <p className="mb-3 text-sm font-semibold text-ink">{title}</p>
          <div className="grid gap-2">
            {options.map((option) => <FilterCheckbox key={option} label={option} />)}
          </div>
        </div>
      ))}

      <div>
        <div className="mb-3 flex items-center justify-between text-sm font-semibold text-ink">
          <span>Price Range</span>
          <span className="text-brand">₹8k - ₹24k</span>
        </div>
        <input type="range" min="8000" max="30000" defaultValue="22000" className="w-full accent-[#DD5E67]" />
      </div>

      <Input label="Available Beds" type="number" min="1" placeholder="Minimum beds" />

      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button variant="secondary" className="w-full">Reset</Button>
        <Button className="w-full">Apply</Button>
      </div>
    </div>
  </aside>
);

const AmenityPill = ({ name }) => {
  const Icon = amenityIcons[name] || Sparkles;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-secondary">
      <Icon className="h-3.5 w-3.5 text-brand" />
      {name}
    </span>
  );
};

const BranchCard = ({ branch, view }) => (
  <Card className={`group overflow-hidden p-0 ${view === "list" ? "md:grid md:grid-cols-[280px_1fr]" : ""}`}>
    <div className="relative h-64 overflow-hidden md:h-full">
      <img src={branch.image} alt={branch.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand shadow-soft">
        {branch.gender}
      </span>
      <button className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-ink shadow-soft transition hover:text-brandDark" aria-label={`Save ${branch.name}`}>
        <Heart className="h-5 w-5" />
      </button>
    </div>
    <div className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-ink">{branch.name}</h3>
          <p className="mt-2 flex items-center gap-2 text-sm text-secondary">
            <MapPin className="h-4 w-4 text-brand" /> {branch.location}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
          <Star className="h-4 w-4 fill-brand" /> {branch.rating}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 divide-x divide-line rounded-[18px] border border-line">
        <div className="p-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">Beds</p>
          <p className="mt-1 font-semibold text-ink">{branch.beds}</p>
        </div>
        <div className="p-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">Rent</p>
          <p className="mt-1 font-semibold text-ink">₹{branch.rent}</p>
        </div>
        <div className="p-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">Room</p>
          <p className="mt-1 font-semibold text-ink">{branch.type}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-secondary">{branch.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {branch.amenities.map((amenity) => <AmenityPill key={amenity} name={amenity} />)}
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row">
        <Link to={`/branches/${branch.id}/rooms`} className="flex-1">
          <Button className="w-full">View Details</Button>
        </Link>
        <Button variant="secondary" className="sm:w-12" aria-label={`Wishlist ${branch.name}`}>
          <Heart className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </Card>
);

const SkeletonLoader = () => (
  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
    {[1, 2, 3].map((item) => (
      <div key={item} className="overflow-hidden rounded-[18px] border border-line bg-white shadow-soft">
        <div className="h-64 animate-pulse bg-paper" />
        <div className="space-y-4 p-5">
          <div className="h-5 w-2/3 animate-pulse rounded bg-paper" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-paper" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-14 animate-pulse rounded-xl bg-paper" />
            <div className="h-14 animate-pulse rounded-xl bg-paper" />
            <div className="h-14 animate-pulse rounded-xl bg-paper" />
          </div>
          <div className="h-16 animate-pulse rounded bg-paper" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = () => (
  <div className="rounded-[18px] border border-line bg-white p-10 text-center shadow-soft">
    <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-brand/10">
      <div className="relative h-16 w-16">
        <Home className="absolute left-3 top-5 h-10 w-10 text-brand" />
        <Search className="absolute right-0 top-0 h-7 w-7 text-ink" />
      </div>
    </div>
    <h3 className="mt-6 text-2xl font-semibold text-ink">No PGs Found</h3>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-secondary">
      Try clearing a few preferences or searching another prime location.
    </p>
    <Button className="mt-6">Reset Filter</Button>
  </div>
);

const BranchListingPage2 = () => {
  const [view, setView] = useState("grid");
  const [loading, setLoading] = useState(false);
  const visibleBranches = useMemo(() => branches, []);

  return (
    <div className="min-h-screen bg-white text-ink">
      <LuxuryNavbar />

      <main>
        <section className="border-b border-line bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">Branch Listing</p>
              <h1 className="mt-5 text-4xl font-semibold leading-tight text-ink sm:text-5xl">Find Your Perfect PG</h1>
              <p className="mt-5 text-lg leading-8 text-secondary">
                Browse premium PG branches with hotel-inspired amenities, transparent rent, and real availability cues.
              </p>
            </div>
            <div className="mx-auto mt-9 max-w-4xl rounded-[18px] border border-line bg-white p-3 shadow-luxury">
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <label className="relative block">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand" />
                  <input
                    type="search"
                    placeholder="Search by city, branch, landmark, or amenity"
                    className="min-h-12 w-full rounded-xl border border-line bg-white py-3 pl-12 pr-4 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-brand/25"
                  />
                </label>
                <Button className="min-h-12 px-8">Search</Button>
              </div>
            </div>
          </div>
        </section>

        <section id="branches" className="bg-paper/70 py-10 lg:py-14">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[310px_1fr] lg:px-8">
            <FilterSidebar />

            <div>
              <div className="mb-6 rounded-[18px] border border-line bg-white p-4 shadow-soft">
                <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto] lg:items-center">
                  <label className="relative block">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
                    <input
                      type="search"
                      placeholder="Search listed branches"
                      className="min-h-12 w-full rounded-xl border border-line bg-white py-3 pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-brand/25"
                    />
                  </label>
                  <label className="relative block">
                    <select className="min-h-12 w-full appearance-none rounded-xl border border-line bg-white px-4 pr-10 text-sm font-semibold text-secondary outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/25">
                      {sortOptions.map((option) => <option key={option}>{option}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
                  </label>
                  <div className="grid grid-cols-2 gap-2 rounded-xl border border-line p-1">
                    <button
                      className={`grid h-10 place-items-center rounded-lg transition ${view === "grid" ? "bg-brand text-white" : "text-secondary hover:text-brandDark"}`}
                      onClick={() => setView("grid")}
                      aria-label="Grid view"
                    >
                      <Grid2X2 className="h-4 w-4" />
                    </button>
                    <button
                      className={`grid h-10 place-items-center rounded-lg transition ${view === "list" ? "bg-brand text-white" : "text-secondary hover:text-brandDark"}`}
                      onClick={() => setView("list")}
                      aria-label="List view"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{visibleBranches.length} luxury PG branches found</p>
                  <p className="mt-1 text-sm text-secondary">Availability, rent, and amenities are ready for quick comparison.</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-secondary shadow-soft transition hover:border-brandDark hover:text-brandDark"
                  onClick={() => setLoading((value) => !value)}
                >
                  <Loader2 className={`h-4 w-4 ${loading ? "animate-spin text-brand" : ""}`} />
                  Loading State
                </button>
              </div>

              {loading ? (
                <SkeletonLoader />
              ) : visibleBranches.length ? (
                <div className={`grid gap-6 ${view === "grid" ? "md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                  {visibleBranches.map((branch) => <BranchCard key={branch.id} branch={branch} view={view} />)}
                </div>
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-secondary sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="font-semibold text-ink">PGStay Luxe</p>
          <p>Premium PG discovery for students and professionals.</p>
        </div>
      </footer>
    </div>
  );
};

export default BranchListingPage2;
