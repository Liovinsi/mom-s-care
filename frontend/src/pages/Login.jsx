import { useState } from "react";
import { CheckCircle2, Facebook, Mail, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { getDashboardPathForRole } from "../routes/roleRoutes";

const Login = () => {
  const [form, setForm] = useState({ loginId: "", password: "" });
  const [error, setError] = useState("");
  const [popup, setPopup] = useState(null);
  const [redirectPath, setRedirectPath] = useState("");
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const { login, socialLogin } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const user = await login(form.loginId, form.password);
      const path = getDashboardPathForRole(user.role);
      setRedirectPath(path);
      setPopup({ type: "success", title: "✔ Login Successful", message: "Welcome back!" });
      window.setTimeout(() => {
        setPopup(null);
        navigate(path);
      }, 2000);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Invalid email or password.";
      setError(message);
      setPopup({ type: "error", title: "Login Failed", message });
    }
  };

  const signInWithSocial = async (provider) => {
    setError("");
    try {
      const user = await socialLogin(provider);
      const path = getDashboardPathForRole(user.role);
      navigate(path);
    } catch (err) {
      const message = err.message || "Unable to continue with social login.";
      setError(message);
      setPopup({ type: "error", title: "Login Failed", message });
    }
  };

  return (
    <main className="bg-paper/70">
      {popup && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/35 px-4">
          <div className={`w-full max-w-sm animate-[loginPopup_300ms_ease-out] rounded-[18px] border bg-white p-6 text-center shadow-[0_24px_70px_rgba(30,30,36,0.18)] ${popup.type === "success" ? "border-brand/30" : "border-brand/30"}`}>
            {popup.type === "success" ? (
              <CheckCircle2 className="mx-auto h-12 w-12 text-brandDark" />
            ) : (
              <XCircle className="mx-auto h-12 w-12 text-brandDark" />
            )}
            <h2 className="mt-4 text-xl font-bold text-ink">{popup.title}</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{popup.message}</p>
            {popup.type === "success" ? (
              <Button className="mt-5 w-full" onClick={() => navigate(redirectPath || "/")}>Continue</Button>
            ) : (
              <Button variant="secondary" className="mt-5 w-full" onClick={() => setPopup(null)}>Try Again</Button>
            )}
          </div>
        </div>
      )}
      <section className="mx-auto grid min-h-[calc(100vh-65px)] max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="relative min-h-[560px] overflow-hidden rounded-[28px] border border-brand/20 bg-ink shadow-[0_30px_90px_rgba(30,30,36,0.18)]">
          <img
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1100&q=80"
            alt="Premium furnished PG lounge"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/15" />
          <div className="relative flex h-full min-h-[560px] flex-col justify-end p-7 text-white sm:p-10">
            <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] backdrop-blur">
              <img src="/logo.jpeg" alt="PG Stay logo" className="h-6 w-6 rounded-full object-cover" />
              Luxury PG Stay
            </div>
            <h1 className="max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">Welcome to PG Stay</h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/80">Comfortable rooms, thoughtful amenities, and a seamless stay experience.</p>
          </div>
        </div>

        <Card className="hover:translate-y-0">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-brand">
              <img src="/logo.jpeg" alt="PG Stay logo" className="h-7 w-7 rounded-full object-cover" />
              PG Stay
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-ink">Sign in to continue</h2>
            <p className="mt-2 text-sm leading-6 text-secondary">Access your bookings and profile.</p>
          </div>

          {error && <p className="rounded-md bg-paper p-3 text-sm text-brandDark">{error}</p>}

          <div className="mt-8 grid gap-4">
            <Button type="button" variant="secondary" className="min-h-14 justify-center text-base" onClick={() => signInWithSocial("google")}>
              <span className="text-lg font-bold">G</span> Continue with Google
            </Button>
            <Button type="button" variant="secondary" className="min-h-14 justify-center text-base" onClick={() => signInWithSocial("facebook")}>
              <Facebook className="h-5 w-5" /> Continue with Facebook
            </Button>
          </div>

          <button
            type="button"
            className="mt-7 w-full text-center text-sm font-bold text-brand transition hover:text-brandDark"
            onClick={() => {
              setError("");
              setShowStaffLogin((value) => !value);
            }}
          >
            Warden Login
          </button>

          {showStaffLogin && (
            <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-line bg-white p-5 shadow-soft">
              <Input
                label="Email"
                type="email"
                required
                placeholder="name@pgstay.com"
                value={form.loginId}
                onChange={(e) => setForm({ ...form, loginId: e.target.value })}
              />
              <Input
                label="Password"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <Button className="w-full" type="submit">
                <Mail className="h-4 w-4" /> Login
              </Button>
            </form>
          )}
        </Card>
      </section>
    </main>
  );
};

export default Login;
