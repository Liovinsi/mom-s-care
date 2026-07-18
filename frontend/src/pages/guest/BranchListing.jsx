import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Star } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { exploreBranches, formatCurrency } from "../../data/bookingFlow";

const BranchListing = () => (
  <main className="bg-paper/70">
    <section className="border-b border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-gold">Explore Residences</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-ink sm:text-5xl">Choose Your PG Branch</h1>
          <p className="mt-5 text-lg leading-8 text-secondary">
            Select a premium Chennai residence to view availability, room types, and bed-level booking details.
          </p>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="grid gap-6 md:grid-cols-2">
        {exploreBranches.map((branch) => (
          <Link key={branch.id} to={`/branches/${branch.id}/rooms`} className="group block">
            <Card className="h-full overflow-hidden p-0">
              <div className="relative h-72 overflow-hidden">
                <img src={branch.image} alt={branch.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-gold shadow-soft">
                  <Star className="h-4 w-4 fill-gold" /> {branch.rating}
                </span>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-ink">{branch.name}</h2>
                    <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-secondary">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <span>{branch.addressLines.map((line) => <span key={line} className="block">{line}</span>)}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted">Starting Price</p>
                    <p className="mt-1 text-2xl font-semibold text-ink">{formatCurrency(branch.startingPrice)}</p>
                    <p className="text-sm text-muted">/ month</p>
                  </div>
                </div>
                <div className="mt-6 border-t border-line pt-5">
                  <Button className="w-full">
                    View Branch Details <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  </main>
);

export default BranchListing;
