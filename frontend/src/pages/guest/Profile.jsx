import { Mail, ShieldCheck, UserRound } from "lucide-react";
import Card from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  return (
    <main className="bg-paper/70">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">Profile</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl">Your Profile</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-secondary">Manage your account details and booking identity.</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="hover:translate-y-0">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-brand text-2xl font-bold text-white">
              {(user?.name || "User").slice(0, 1).toUpperCase()}
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-ink">{user?.name || "User"}</h2>
              <p className="mt-1 text-secondary">{user?.email || "user@pgstay.com"}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-ink">
                <UserRound className="h-4 w-4 text-brand" /> Name
              </p>
              <p className="mt-2 text-secondary">{user?.name || "User"}</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-ink">
                <Mail className="h-4 w-4 text-brand" /> Email
              </p>
              <p className="mt-2 text-secondary">{user?.email || "user@pgstay.com"}</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4 sm:col-span-2">
              <p className="flex items-center gap-2 text-sm font-bold text-ink">
                <ShieldCheck className="h-4 w-4 text-brand" /> Account Type
              </p>
              <p className="mt-2 text-secondary">{user?.role || "User"}</p>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
};

export default Profile;
