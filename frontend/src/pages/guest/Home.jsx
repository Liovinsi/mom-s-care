import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  Droplets,
  HeartHandshake,
  LockKeyhole,
  MapPin,
  Search,
  Sparkles,
  Star,
  Utensils,
  WashingMachine,
  Zap,
  Wifi
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import InlineStayCalendar from "../../components/booking/InlineStayCalendar";
import SectionHeader from "../../components/ui/SectionHeader";
import { useAuth } from "../../context/AuthContext";
import { amenities, faqs, featuredPgs, popularBranches, testimonials } from "../../data/landing";
import { adminBranchIdFromPublicBranchId, useLiveAvailability } from "../../lib/liveAvailability";

const AmenityIcon = ({ index }) => {
  const icons = [Utensils, Wifi, Camera, LockKeyhole, WashingMachine, Sparkles, Zap, Droplets];
  const Icon = icons[index % icons.length];
  return <Icon className="h-5 w-5" />;
};

const Home = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [searchBranch, setSearchBranch] = useState("virugambakkam-pg");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [activeDateField, setActiveDateField] = useState("start");
  const [guests, setGuests] = useState(1);
  const [guestSelectorOpen, setGuestSelectorOpen] = useState(false);
  const { user } = useAuth();
  const { rooms: liveRooms } = useLiveAvailability();
  const navigate = useNavigate();
  const branchRooms = liveRooms.filter((room) => room.branchId === adminBranchIdFromPublicBranchId(searchBranch));
  const maxGuests = Math.max(1, ...branchRooms.map((room) => Number(room.availableBeds) || 0));

  const searchRooms = (event) => {
    event.preventDefault();
    if (!checkIn) return;
    const query = new URLSearchParams({ branch: searchBranch, checkIn, guests: String(guests) });
    if (checkOut) query.set("checkOut", checkOut);
    navigate(`/rooms?${query.toString()}`);
  };

  return (
  <main className="overflow-hidden">
    {guestSelectorOpen && (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4" onClick={() => setGuestSelectorOpen(false)}>
        <div role="dialog" aria-modal="true" aria-label="Select guests" className="w-full rounded-t-[24px] bg-white p-6 shadow-luxury sm:max-w-md sm:rounded-[24px]" onClick={(event) => event.stopPropagation()}>
          <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-line sm:hidden" />
          <h2 className="text-xl font-semibold text-ink">Guests</h2>
          <div className="mt-6 flex items-center justify-between border-y border-line py-5">
            <div><p className="font-semibold text-ink">Adults</p><p className="mt-1 text-sm text-muted">Maximum {maxGuests} guests</p></div>
            <div className="flex items-center gap-4">
              <button type="button" disabled={guests === 1} onClick={() => setGuests((value) => Math.max(1, value - 1))} className="grid h-10 w-10 place-items-center rounded-full border border-line text-xl font-semibold text-ink disabled:opacity-40">−</button>
              <span className="w-5 text-center font-semibold text-ink">{guests}</span>
              <button type="button" disabled={guests === maxGuests} onClick={() => setGuests((value) => Math.min(maxGuests, value + 1))} className="grid h-10 w-10 place-items-center rounded-full border border-brand text-xl font-semibold text-brand disabled:opacity-40">+</button>
            </div>
          </div>
          <Button type="button" className="mt-6 w-full" onClick={() => setGuestSelectorOpen(false)}>Apply</Button>
        </div>
      </div>
    )}
    <section id="home" className="relative bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8 lg:pb-20 lg:pt-16">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">Premium PG Booking</p>
          {user && (
            <p className="mt-4 inline-flex items-center rounded-full border border-brand/20 bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
              Welcome back, {user.name || "User"}
            </p>
          )}
          <h1 className="mt-5 text-4xl font-semibold leading-[1.06] text-ink sm:text-5xl lg:text-6xl">
            Luxury PG stays curated for effortless city living.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-secondary">
            Discover refined rooms, verified branches, hotel-inspired amenities, and a calm booking experience designed for students and professionals.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/branches">
              <Button className="w-full sm:w-auto">
                Explore Residences <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#featured">
              <Button variant="secondary" className="w-full sm:w-auto">
                View Branches
              </Button>
            </a>
          </div>
          <div className="mt-10 grid max-w-md grid-cols-2 divide-x divide-line rounded-[18px] border border-line bg-white shadow-soft">
            {[
              ["2", "Prime branches"],
              ["4.8", "Guest rating"]
            ].map(([value, label]) => (
              <div key={label} className="px-4 py-5 text-center">
                <p className="text-2xl font-semibold text-ink">{value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative min-h-[430px]">
          <img
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1100&q=80"
            alt="Premium furnished PG lounge"
            className="h-[430px] w-full rounded-[28px] object-cover shadow-luxury sm:h-[560px]"
          />
          <div className="absolute bottom-5 left-5 right-5 rounded-[18px] border border-white/60 bg-white/92 p-5 shadow-luxury backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand">Signature Branch</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">Virugambakkam</h2>
                <p className="mt-1 text-sm text-secondary">Chef meals, ensuite rooms, resident lounge</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
                <Star className="h-4 w-4 fill-brand" /> 4.9
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="relative z-10 mx-auto -mt-6 max-w-6xl px-4 sm:px-6 lg:px-8">
      <Card className="p-4 hover:translate-y-0 lg:p-6">
        <form onSubmit={searchRooms}>
          <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_auto] md:items-end">
            <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted">Branch</span><select value={searchBranch} onChange={(event) => { setSearchBranch(event.target.value); setGuests(1); }} className="min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink"><option value="virugambakkam-pg">Virugambakkam</option><option value="anna-nagar-pg">Anna Nagar</option></select></label>
            <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted">Guests</span><button type="button" onClick={() => setGuestSelectorOpen(true)} className="flex min-h-12 w-full items-center rounded-xl border border-line bg-white px-4 text-left text-sm font-semibold text-ink"><span aria-hidden="true" className="mr-2">{guests === 1 ? "👤" : "👥"}</span> {guests} {guests === 1 ? "Guest" : "Guests"}</button></label>
            <Button type="submit" className="min-h-12"><Search className="h-4 w-4" /> Search</Button>
          </div>
          <div className="mt-4 border-t border-line pt-4"><InlineStayCalendar startDate={checkIn} endDate={checkOut} activeField={activeDateField} onActiveFieldChange={setActiveDateField} onStartDateChange={setCheckIn} onEndDateChange={setCheckOut} /></div>
        </form>
      </Card>
    </section>

    <section id="featured" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Branches" title="Our Chennai residences" description="Choose Virugambakkam or Anna Nagar, compare available rooms, and book your preferred bed." />
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {featuredPgs.map((pg) => (
          <Card key={pg.id} className="overflow-hidden p-0">
            <img src={pg.image} alt={pg.name} className="h-64 w-full object-cover" />
            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand">{pg.tag}</span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink"><Star className="h-4 w-4 fill-brand text-brand" /> {pg.rating}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-ink">{pg.name}</h3>
              <p className="mt-2 flex items-center gap-2 text-sm text-secondary"><MapPin className="h-4 w-4 text-brand" /> {pg.location}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {pg.amenities.map((item) => (
                  <span key={item} className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-secondary">{item}</span>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-line pt-5">
                <p><span className="text-2xl font-semibold text-ink">{pg.rent}</span><span className="text-sm text-muted"> / month</span></p>
                <Link to={`/branches/${pg.branchId}/rooms`}><Button variant="secondary">Details</Button></Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>

    <section className="bg-paper py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader align="left" eyebrow="Our Branches" title="Two prime Chennai neighborhoods" description="Mom’s Care PG House is available only at Virugambakkam and Anna Nagar." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularBranches.map((branch) => (
            <Link key={`${branch.city}-${branch.area}`} to={`/featured-branches?location=${encodeURIComponent(branch.area)}`}>
              <Card>
                <MapPin className="h-6 w-6 text-brand" />
                <h3 className="mt-5 text-xl font-semibold text-ink">{branch.area}</h3>
                <p className="mt-1 text-sm text-secondary">{branch.city}</p>
                <div className="mt-6 space-y-3 text-sm">
                  <p className="flex items-center justify-between text-secondary"><span>{branch.properties}</span><span className="font-semibold text-ink">{branch.occupancy}</span></p>
                  <div className="h-2 rounded-full bg-line"><div className="h-2 rounded-full bg-brand" style={{ width: branch.occupancy }} /></div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>

    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <SectionHeader align="left" eyebrow="WHY CHOOSE PGSTAY" title="Why Thousands Choose PGStay" description="Find verified PG accommodations across Chennai with transparent pricing, real-time bed availability, online bed blocking, and premium amenities. Whether you're a student or a working professional, PGStay helps you discover the right place with confidence." />
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["Verified PG Branches", "Every PG is verified with complete property details, amenities, room information, and genuine photos before being listed."],
          ["Live Room & Bed Availability", "Check real-time room occupancy, available beds, sharing options, and AC or Non-AC availability before booking."],
          ["Easy Bed Blocking", "Select your branch, choose a room, pick your preferred bed, complete your profile, and block the bed for manual confirmation."],
          ["Safe & Secure Stay", "Enjoy verified accommodations with CCTV, biometric access, Wi-Fi, food services, housekeeping, laundry, and dedicated wardens."]
        ].map(([title, text]) => (
          <Card key={title}>
            <Check className="h-6 w-6 text-brand" />
            <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-secondary">{text}</p>
          </Card>
        ))}
      </div>
    </section>

    <section id="amenities" className="bg-ink py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="AMENITIES" title="Everything You Need for Comfortable PG Living" description="Enjoy modern amenities designed for students and working professionals, making your stay safe, comfortable, and hassle-free." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {amenities.map((item, index) => (
            <div key={item.title} className="rounded-[18px] border border-white/10 bg-white/5 p-5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-white"><AmenityIcon index={index} /></span>
              <p className="mt-4 font-semibold">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-white/70">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Testimonials" title="Resident confidence, designed into every detail" />
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {testimonials.map((item) => (
          <Card key={item.name}>
            <HeartHandshake className="h-7 w-7 text-brand" />
            <p className="mt-5 leading-7 text-secondary">"{item.quote}"</p>
            <div className="mt-6 border-t border-line pt-5">
              <p className="font-semibold text-ink">{item.name}</p>
              <p className="text-sm text-muted">{item.role}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>

    <section id="faq" className="bg-paper py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="FAQ" title="Frequently Asked Questions" description="Find answers to the most common questions about PG booking, payments, and check-in." />
        <div className="mt-10 space-y-4">
          {faqs.map((item, index) => {
            const expanded = openFaqIndex === index;
            return (
            <Card key={item.question} className="hover:translate-y-0">
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={`faq-answer-${index}`}
                onClick={() => setOpenFaqIndex(expanded ? -1 : index)}
                className="flex w-full items-start gap-4 text-left"
              >
                <CalendarDays className="mt-1 h-5 w-5 shrink-0 text-brand" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-ink">{item.question}</h3>
                </div>
                <span className={`text-2xl font-semibold leading-none text-brand transition duration-300 ${expanded ? "rotate-180" : "rotate-0"}`}>
                  {expanded ? "−" : "+"}
                </span>
              </button>
              <div
                id={`faq-answer-${index}`}
                className={`grid transition-all duration-300 ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <p className="ml-9 mt-2 leading-7 text-secondary">{item.answer}</p>
                </div>
              </div>
            </Card>
            );
          })}
        </div>
      </div>
    </section>

    <footer className="border-t border-[rgba(221,94,103,0.20)] bg-[#1F2937]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] lg:px-8">
        <div className="transition duration-300 ease-in-out hover:-translate-y-0.5">
          <p className="text-2xl font-bold text-[#FFFFFF]">Mom’s Care PG House</p>
          <p className="mt-3 max-w-md leading-7 text-[#B8BCC8]">Mom’s Care PG House helps students and working professionals find comfortable accommodation with real-time room availability, secure booking, and premium amenities in Virugambakkam and Anna Nagar.</p>
        </div>
        <div className="transition duration-300 ease-in-out hover:-translate-y-0.5">
          <p className="font-bold text-[#FFFFFF]">Quick Links</p>
          <div className="mt-4 grid gap-3 text-sm text-[#B8BCC8]">
            <Link to="/" className="text-[#DD5E67] transition duration-300 ease-in-out hover:text-[#D12233] hover:underline">Home</Link>
            <Link to="/featured-branches" className="text-[#DD5E67] transition duration-300 ease-in-out hover:text-[#D12233] hover:underline">Branches</Link>
            <Link to="/#amenities" className="text-[#DD5E67] transition duration-300 ease-in-out hover:text-[#D12233] hover:underline">Amenities</Link>
            <Link to="/#faq" className="text-[#DD5E67] transition duration-300 ease-in-out hover:text-[#D12233] hover:underline">FAQ</Link>
            <Link to="/login" className="text-[#DD5E67] transition duration-300 ease-in-out hover:text-[#D12233] hover:underline">Login</Link>
          </div>
        </div>
        <div className="transition duration-300 ease-in-out hover:-translate-y-0.5">
          <p className="font-bold text-[#FFFFFF]">Contact Us</p>
          <div className="mt-4 grid gap-3 text-sm text-[#B8BCC8]">
            <a href="mailto:support@pgstay.com" className="text-[#DD5E67] transition duration-300 ease-in-out hover:text-[#D12233] hover:underline">support@pgstay.com</a>
            <a href="tel:+919876543210" className="text-[#DD5E67] transition duration-300 ease-in-out hover:text-[#D12233] hover:underline">+91 98765 43210</a>
            <span>PGStay Head Office<br />Anna Nagar,<br />Chennai - 600040<br />Tamil Nadu, India</span>
          </div>
        </div>
        <div className="transition duration-300 ease-in-out hover:-translate-y-0.5">
          <p className="font-bold text-[#FFFFFF]">Support</p>
          <div className="mt-4 grid gap-3 text-sm text-[#B8BCC8]">
            <Link to="/privacy-policy" className="text-[#DD5E67] transition duration-300 ease-in-out hover:text-[#D12233] hover:underline">Privacy Policy</Link>
            <Link to="/terms-and-conditions" className="text-[#DD5E67] transition duration-300 ease-in-out hover:text-[#D12233] hover:underline">Terms & Conditions</Link>
            <Link to="/cancellation-refund-policy" className="text-[#DD5E67] transition duration-300 ease-in-out hover:text-[#D12233] hover:underline">Cancellation & Refund Policy</Link>
            <Link to="/contact-support" className="text-[#DD5E67] transition duration-300 ease-in-out hover:text-[#D12233] hover:underline">Contact Support</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-[rgba(255,255,255,0.06)] bg-[#17171C] px-4 py-5 text-center text-sm text-[#AEB4C2]">© 2026 Mom’s Care PG House. All Rights Reserved.<br />Built for Smart PG Booking & Management.</div>
    </footer>
  </main>
  );
};

export default Home;
