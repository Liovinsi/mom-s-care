import { Link } from "react-router-dom";
import {
  Bell,
  BookOpen,
  Building2,
  CalendarCheck,
  Check,
  ChevronRight,
  Facebook,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Wallet,
  Wifi
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const highlights = [
  "Verified PGs",
  "Secure Booking",
  "Live Bed Availability",
  "Instant Booking Updates",
  "Premium Facilities"
];

const benefits = [
  ["Save Bookings", CalendarCheck],
  ["Booking History", BookOpen],
  ["Faster Checkout", Wallet],
  ["Receive Notifications", Bell]
];

const GoogleIcon = () => (
  <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-sm font-bold text-ink">
    G
  </span>
);

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
      <Button variant="secondary" className="min-w-24">Login</Button>
    </div>
  </header>
);

const WelcomeIllustration = () => (
  <div className="relative min-h-[360px] overflow-hidden rounded-[28px] bg-ink p-6 text-white shadow-luxury sm:min-h-[480px]">
    <img
      src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"
      alt="Premium PG lounge"
      className="absolute inset-0 h-full w-full object-cover opacity-70"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent" />
    <div className="relative flex h-full min-h-[312px] flex-col justify-end sm:min-h-[432px]">
      <span className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-brand text-white shadow-soft">
        <Sparkles className="h-6 w-6" />
      </span>
      <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">Guest Access</p>
      <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
        Welcome to Premium PG Booking
      </h1>
      <p className="mt-4 max-w-lg text-base leading-7 text-white/85">
        Find and book your perfect stay in minutes.
      </p>
    </div>
  </div>
);

const HighlightList = () => (
  <div className="mt-6 grid gap-3 sm:grid-cols-2">
    {highlights.map((item) => (
      <div key={item} className="flex items-center gap-3 rounded-[18px] border border-line bg-white p-4 shadow-soft">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand/10 text-brand">
          <Check className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold text-ink">{item}</span>
      </div>
    ))}
  </div>
);

const LoginCard = () => (
  <Card className="rounded-[20px] p-6 shadow-luxury hover:translate-y-0 sm:p-8">
    <div className="text-center">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand">Guest Login</p>
      <h2 className="mt-3 text-3xl font-semibold text-ink">Sign In</h2>
      <p className="mt-2 text-sm leading-6 text-secondary">Continue to book your preferred bed.</p>
    </div>

    <div className="mt-8 space-y-3">
      <button className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold text-ink shadow-soft transition duration-300 hover:-translate-y-0.5 hover:border-brandDark hover:shadow-luxury">
        <GoogleIcon /> Continue with Google
      </button>
      <button className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#DD5E67] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(221,94,103,0.24)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#D12233] hover:shadow-luxury">
        <Facebook className="h-5 w-5" /> Continue with Facebook
      </button>
    </div>

    <div className="my-7 flex items-center gap-4">
      <span className="h-px flex-1 bg-line" />
      <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted">OR</span>
      <span className="h-px flex-1 bg-line" />
    </div>

    <div className="rounded-[18px] border border-dashed border-line bg-paper p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-ink">Continue with Mobile Number</p>
          <p className="mt-1 text-sm text-secondary">OTP login is being prepared.</p>
        </div>
        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand">Coming Soon</span>
      </div>
      <Button disabled className="mt-4 w-full">Mobile Login</Button>
    </div>
  </Card>
);

const WhyLoginCard = () => (
  <Card className="hover:translate-y-0">
    <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand">Why Login</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {benefits.map(([label, Icon]) => (
        <div key={label} className="flex items-center gap-3 rounded-xl border border-line p-3">
          <Icon className="h-5 w-5 text-brand" />
          <span className="text-sm font-semibold text-secondary">{label}</span>
        </div>
      ))}
    </div>
  </Card>
);

const SecurityCard = () => (
  <Card className="hover:translate-y-0">
    <div className="flex items-start gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
        <Lock className="h-5 w-5" />
      </span>
      <div>
        <h3 className="font-semibold text-ink">Secure Login</h3>
        <p className="mt-1 text-sm leading-6 text-secondary">We never share your personal information.</p>
      </div>
    </div>
  </Card>
);

const HelpSection = () => (
  <Card id="support" className="hover:translate-y-0">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand">Need Help?</p>
        <h3 className="mt-2 text-xl font-semibold text-ink">Contact Support</h3>
      </div>
      <ShieldCheck className="h-6 w-6 text-brand" />
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      {[
        ["WhatsApp", MessageCircle],
        ["Call Us", Phone],
        ["Email", Mail]
      ].map(([label, Icon]) => (
        <button key={label} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-secondary transition hover:border-brandDark hover:text-brandDark">
          <Icon className="h-4 w-4" /> {label}
        </button>
      ))}
    </div>
  </Card>
);

const GuestLoginPage6 = () => (
  <div className="min-h-screen bg-white text-ink">
    <LuxuryNavbar />

    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
      <section className="animate-[fadeIn_0.7s_ease-out]">
        <WelcomeIllustration />
        <HighlightList />
      </section>

      <section className="space-y-5 animate-[slideUp_0.7s_ease-out]">
        <LoginCard />
        <WhyLoginCard />
        <SecurityCard />
        <HelpSection />
      </section>
    </main>

    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-secondary sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p className="font-semibold text-ink">PGStay Luxe</p>
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-2"><Wifi className="h-4 w-4 text-brand" /> Verified stays</span>
          <span className="inline-flex items-center gap-2"><ChevronRight className="h-4 w-4 text-brand" /> Quick booking flow</span>
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

export default GuestLoginPage6;
