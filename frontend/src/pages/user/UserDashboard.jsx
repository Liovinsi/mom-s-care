import { BedDouble, CalendarCheck, CreditCard, UserRound } from "lucide-react";
import StatCard from "../../components/ui/StatCard";

const UserDashboard = () => {
  const actions = [
    ["My Booking", "View current PG booking details.", BedDouble],
    ["Payment Status", "Track token and rent payment updates.", CreditCard],
    ["Visit Schedule", "Review upcoming branch visits.", CalendarCheck]
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6">
        <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-gold">
          <UserRound className="h-4 w-4" />
          User Portal
        </p>
        <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">User Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary sm:text-base">
          Manage bookings, payments, and PG stay updates from one workspace.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active bookings" value="1" />
        <StatCard label="Pending payments" value="0" />
        <StatCard label="Visits scheduled" value="1" />
        <StatCard label="Support tickets" value="0" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {actions.map(([title, description, Icon]) => (
          <article key={title} className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold/10 text-gold">
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-lg font-bold text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-secondary">{description}</p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
