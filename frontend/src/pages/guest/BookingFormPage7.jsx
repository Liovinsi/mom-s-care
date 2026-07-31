import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  ChevronRight,
  FileText,
  GraduationCap,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  Wallet,
  XCircle
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

const booking = {
  branch: "Aurelia Indiranagar",
  room: "Aurelia 204",
  bed: "A1",
  sharing: "4 Sharing",
  rent: "18,500",
  deposit: "37,000",
  token: "2,500",
  moveInDate: "20 Jul 2026",
  availableBeds: "2 beds",
  monthlyCost: "19,700"
};

const promotionItems = [
  ["Verified Property", BadgeCheck],
  ["100% Secure Booking", ShieldCheck],
  ["Free Cancellation", XCircle],
  ["Premium Facilities", Sparkles]
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
        {["Home", "Branches", "Rooms", "Support"].map((item) => (
          <a key={item} href={item === "Home" ? "/" : "#support"} className="text-sm font-semibold text-secondary transition hover:text-brandDark">
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
    <Link to="/" className="hover:text-brandDark">Home</Link>
    <ChevronRight className="h-4 w-4 text-muted" />
    <Link to="/branches" className="hover:text-brandDark">Branch</Link>
    <ChevronRight className="h-4 w-4 text-muted" />
    <Link to="/branches/aurelia-indiranagar/rooms" className="hover:text-brandDark">Room</Link>
    <ChevronRight className="h-4 w-4 text-muted" />
    <Link to="/rooms/aurelia-204/beds" className="hover:text-brandDark">Select Bed</Link>
    <ChevronRight className="h-4 w-4 text-muted" />
    <span className="text-ink">Booking Form</span>
  </nav>
);

const SectionHeading = ({ icon: Icon, title, subtitle }) => (
  <div className="mb-6 flex items-start gap-4">
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
      <Icon className="h-5 w-5" />
    </span>
    <div>
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      {subtitle && <p className="mt-1 text-sm leading-6 text-secondary">{subtitle}</p>}
    </div>
  </div>
);

const SelectField = ({ label, options }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
    <select className="min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/25">
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  </label>
);

const UploadCard = ({ title, optional }) => (
  <div className="rounded-[20px] border border-dashed border-line bg-paper p-5 transition duration-300 hover:-translate-y-0.5 hover:border-brandDark hover:bg-white hover:shadow-soft">
    <div className="flex items-start justify-between gap-4">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand">
        <Upload className="h-5 w-5" />
      </span>
      {optional && <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest text-muted">Optional</span>}
    </div>
    <h3 className="mt-4 font-semibold text-ink">{title}</h3>
    <p className="mt-1 text-sm leading-6 text-secondary">Drag document here or browse from device.</p>
    <button className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl border border-line bg-white px-4 text-sm font-semibold text-secondary transition hover:border-brandDark hover:text-brandDark">
      Choose File
    </button>
  </div>
);

const PersonalInformation = () => (
  <Card className="rounded-[20px] p-6 hover:translate-y-0">
    <SectionHeading icon={UserRound} title="Personal Information" subtitle="Add guest details exactly as they appear on your identity document." />
    <div className="grid gap-4 md:grid-cols-2">
      <Input label="First Name" placeholder="Enter first name" />
      <Input label="Last Name" placeholder="Enter last name" />
      <Input label="Mobile Number" placeholder="+91 98765 43210" />
      <Input label="Email Address" type="email" placeholder="guest@example.com" />
      <SelectField label="Gender" options={["Male", "Female", "Other"]} />
      <Input label="Date of Birth" type="text" placeholder="DD / MM / YYYY" />
      <SelectField label="Occupation" options={["Student", "Working Professional", "Business", "Other"]} />
      <Input label="Company / College Name" placeholder="Institution or workplace" />
    </div>
  </Card>
);

const MoveInInformation = () => (
  <Card className="rounded-[20px] p-6 hover:translate-y-0">
    <SectionHeading icon={CalendarDays} title="Move-in Information" subtitle="Tell the property team when you plan to arrive." />
    <div className="grid gap-4 md:grid-cols-2">
      <Input label="Preferred Move-in Date" type="text" placeholder="20 Jul 2026" />
      <SelectField label="Expected Stay Duration" options={["3 Months", "6 Months", "12 Months", "Custom"]} />
    </div>
  </Card>
);

const EmergencyContact = () => (
  <Card className="rounded-[20px] p-6 hover:translate-y-0">
    <SectionHeading icon={Phone} title="Emergency Contact" subtitle="A trusted contact for urgent property communication." />
    <div className="grid gap-4 md:grid-cols-3">
      <Input label="Emergency Contact Name" placeholder="Contact name" />
      <Input label="Relationship" placeholder="Parent, sibling, friend" />
      <Input label="Emergency Mobile Number" placeholder="+91 98765 43210" />
    </div>
  </Card>
);

const IdentityVerification = () => (
  <Card className="rounded-[20px] p-6 hover:translate-y-0">
    <SectionHeading icon={FileText} title="Identity Verification" subtitle="Upload cards are visual only in this page." />
    <div className="grid gap-4 md:grid-cols-2">
      <UploadCard title="Upload Aadhaar Card" />
      <UploadCard title="Upload PAN Card" optional />
    </div>
  </Card>
);

const BookingSummary = () => (
  <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
    <Card className="rounded-[20px] p-6 shadow-luxury hover:translate-y-0">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand">Booking Summary</p>
      <h2 className="mt-2 text-2xl font-semibold text-ink">{booking.branch}</h2>
      <div className="mt-5 space-y-3 text-sm">
        {[
          ["Room Number", booking.room],
          ["Selected Bed", booking.bed],
          ["Sharing Type", booking.sharing],
          ["Monthly Rent", `₹${booking.rent}`],
          ["Security Deposit", `₹${booking.deposit}`],
          ["Booking Token", `₹${booking.token}`],
          ["Move-in Date", booking.moveInDate],
          ["Available Beds", booking.availableBeds],
          ["Estimated Monthly Cost", `₹${booking.monthlyCost}`]
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 border-b border-line pb-3">
            <span className="text-secondary">{label}</span>
            <span className="text-right font-semibold text-ink">{value}</span>
          </div>
        ))}
      </div>
    </Card>

    <Card className="rounded-[20px] p-6 hover:translate-y-0">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand">Premium Assurance</p>
      <div className="mt-4 grid gap-3">
        {promotionItems.map(([label, Icon]) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-line p-3">
            <Icon className="h-5 w-5 text-brand" />
            <span className="text-sm font-semibold text-secondary">{label}</span>
          </div>
        ))}
      </div>
    </Card>

    <Card id="support" className="rounded-[20px] p-6 hover:translate-y-0">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand">Need Assistance?</p>
      <div className="mt-4 grid gap-3">
        {[
          ["WhatsApp", MessageCircle],
          ["Call Warden", Phone],
          ["Email Support", Mail]
        ].map(([label, Icon]) => (
          <button key={label} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-secondary transition hover:border-brandDark hover:text-brandDark">
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>
    </Card>
  </aside>
);

const TermsAndActions = () => (
  <Card className="rounded-[20px] p-6 hover:translate-y-0">
    <div className="grid gap-3">
      {[
        "I agree to the Terms & Conditions.",
        "I agree to the Privacy Policy."
      ].map((label) => (
        <label key={label} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line p-3 text-sm font-semibold text-secondary transition hover:border-brandDark hover:text-ink">
          <input type="checkbox" className="h-4 w-4 accent-[#DD5E67]" />
          {label}
        </label>
      ))}
    </div>
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <Button className="flex-1">Continue to Review</Button>
      <Link to="/rooms/aurelia-204/beds" className="flex-1">
        <Button variant="secondary" className="w-full">Back to Bed Selection</Button>
      </Link>
    </div>
  </Card>
);

const BookingFormPage7 = () => (
  <div className="min-h-screen bg-white text-ink">
    <LuxuryNavbar />
    <Breadcrumb />

    <main className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <section className="mb-8 animate-[fadeIn_0.6s_ease-out]">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">Booking Form</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-ink">Complete Your Booking</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-secondary">
          Enter your details to reserve your selected bed.
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-6 animate-[slideUp_0.7s_ease-out]">
          <PersonalInformation />
          <MoveInInformation />
          <EmergencyContact />
          <IdentityVerification />
          <TermsAndActions />
        </section>

        <BookingSummary />
      </div>
    </main>

    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-secondary sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p className="font-semibold text-ink">PGStay Luxe</p>
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand" /> Secure form</span>
          <span className="inline-flex items-center gap-2"><GraduationCap className="h-4 w-4 text-brand" /> Student friendly</span>
        </div>
      </div>
    </footer>

    <style>{`
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideUp {
        from { opacity: 0; transform: translateY(18px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  </div>
);

export default BookingFormPage7;
