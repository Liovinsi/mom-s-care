import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, BedDouble, Check, MapPin, Star } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { featuredPgBranches, formatCurrency } from "../../data/bookingFlow";

const getBranchLocation = (branch) => `${branch.addressLines[1].replace(",", "")}, Chennai`;

const FeaturedBranches = () => {
  const [searchParams] = useSearchParams();
  const location = searchParams.get("location")?.toLowerCase() || "";
  const visibleBranches = location
    ? featuredPgBranches.filter((branch) => branch.name.toLowerCase().includes(location))
    : featuredPgBranches;

  return (
    <main className="bg-paper/70">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">Branches</p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-ink sm:text-5xl">Mom’s Care PG House</h1>
            <p className="mt-5 text-lg leading-8 text-secondary">
              Explore high-demand branches with clear pricing, occupancy, amenities, and direct access to the booking flow.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleBranches.map((branch) => (
            <Card key={branch.id} className="overflow-hidden p-0">
              <div className="relative h-64 overflow-hidden sm:h-72 lg:h-80">
                <img src={branch.image} alt={branch.name} loading="lazy" className="h-full w-full object-cover transition duration-500 hover:scale-105" />

                <span className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/20 px-3 py-1.5 text-sm font-bold text-white shadow-lg backdrop-blur-md">
                  <Star className="h-4 w-4 fill-white text-white" /> {branch.rating}
                </span>

                <div
                  className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-5 sm:p-6"
                  style={{
                    backgroundImage:
                      "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.15) 75%, rgba(0,0,0,0) 100%)"
                  }}
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/80">Signature Branch</p>
                  <h3 className="mt-1 text-2xl font-bold leading-tight text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.5)] sm:text-3xl">
                    {branch.name}
                  </h3>
                  <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-white/90">
                    <MapPin className="h-4 w-4 shrink-0 text-white/80" /> {getBranchLocation(branch)}
                  </p>
                </div>
              </div>

              <div className="p-5">
                <h2 className="text-2xl font-semibold text-ink">{branch.name}</h2>
                <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-secondary">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span>{branch.addressLines.map((line) => <span key={line} className="block">{line}</span>)}</span>
                </p>

                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-brand">
                  <span aria-hidden="true">★★★★★</span>
                  <span>{branch.rating}</span>
                </div>

                <p className="mt-4">
                  <span className="text-2xl font-semibold text-ink">Starting {formatCurrency(branch.startingPrice)}</span>
                  <span className="text-sm text-muted"> / month</span>
                </p>

                <div className="mt-5 grid grid-cols-3 divide-x divide-line rounded-[18px] border border-line">
                  {[
                    ["Rooms", branch.occupancy.totalRooms],
                    ["Occupied", branch.occupancy.bookedRooms],
                    ["Available", branch.occupancy.availableRooms]
                  ].map(([label, value]) => (
                    <div key={label} className="p-3 text-center">
                      <p className="text-lg font-semibold text-ink">{value}</p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-muted">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {branch.facilities.map((amenity) => (
                    <span key={amenity} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-secondary">
                      <Check className="h-3.5 w-3.5 text-brand" /> {amenity}
                    </span>
                  ))}
                </div>

                <Link to={`/branches/${branch.id}/rooms`} className="mt-6 block">
                  <Button className="w-full">
                    <BedDouble className="h-4 w-4" /> Explore <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
};

export default FeaturedBranches;
