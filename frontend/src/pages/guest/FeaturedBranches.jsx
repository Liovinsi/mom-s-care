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
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">Featured PG Branches</p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-ink sm:text-5xl">Premium Chennai PG Residences</h1>
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
              <div className="relative h-64 overflow-hidden">
                <img src={branch.image} alt={branch.name} loading="lazy" className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-[rgba(0,0,0,0)] to-[rgba(0,0,0,.75)] p-6 text-white">
                  <p className="flex items-center gap-2 text-[26px] font-bold text-[#FFFFFF]">
                    <MapPin className="h-4 w-4 text-[#E5E7EB]" /> {branch.name}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#E5E7EB] opacity-95">{getBranchLocation(branch)}</p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#DD5E67] px-3 py-1.5 text-sm font-semibold text-[#111827]">
                    <Star className="h-4 w-4 fill-[#111827]" /> {branch.rating}
                  </span>
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
