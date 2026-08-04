import { useState } from "react";
import { ArrowLeft, BadgeCheck, CheckCircle2, Facebook, Mail, ShieldCheck, XCircle } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { getDashboardPathForRole, normalizeRole, ROLES } from "../routes/roleRoutes";
import { BOOKING_INTENT_KEY } from "../hooks/useBookingAuth";

const Login = () => {
  const [form, setForm] = useState({ loginId: "", password: "" });
  const [error, setError] = useState("");
  const [popup, setPopup] = useState(null);
  const [redirectPath, setRedirectPath] = useState("");
  const [loginMode, setLoginMode] = useState("user");
  const { login, logout, socialLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const selectLoginMode = (mode) => {
    setError("");
    setForm({ loginId: "", password: "" });
    setLoginMode(mode);
  };

  const formTitle = `${loginMode.charAt(0).toUpperCase()}${loginMode.slice(1)} Login`;

  const userRedirect = () => {
    const requested = searchParams.get("redirect") || location.state?.from?.pathname;
    let storedIntent = null;
    try { storedIntent = JSON.parse(sessionStorage.getItem(BOOKING_INTENT_KEY) || "null"); } catch { sessionStorage.removeItem(BOOKING_INTENT_KEY); }
    const destination = requested || storedIntent?.redirect || "/";
    sessionStorage.removeItem(BOOKING_INTENT_KEY);
    return destination.startsWith("/") && !destination.startsWith("//") ? destination : "/";
  };

  const destinationFor = (user) => normalizeRole(user.role) === ROLES.USER ? userRedirect() : getDashboardPathForRole(user.role);

  const validateMode = (user) => {
    const expectedRole = { user: ROLES.USER, admin: ROLES.ADMIN, warden: ROLES.WARDEN }[loginMode];
    if (normalizeRole(user.role) !== expectedRole) {
      logout();
      throw new Error(`Please use ${user.role} Login for this account.`);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const user = await login(form.loginId, form.password);
      validateMode(user);
      const path = destinationFor(user);
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
      const path = destinationFor(user);
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
      <section className="mx-auto grid min-h-[calc(100vh-65px)] max-w-7xl items-start gap-8 px-4 py-5 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-10">
        <div className="relative hidden min-h-[560px] overflow-hidden rounded-[28px] border border-brand/20 bg-ink shadow-[0_30px_90px_rgba(30,30,36,0.18)] lg:block">
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

          {error && <p className="mt-5 rounded-xl border border-brand/15 bg-paper p-3 text-sm text-brandDark">{error}</p>}

          <div key={loginMode} className="mt-7 animate-[loginModeSwitch_300ms_ease-out]">
            {loginMode === "user" ? (
              <div className="grid gap-4">
                <Button type="button" variant="secondary" className="min-h-14 justify-center text-base shadow-soft" onClick={() => signInWithSocial("google")}>
                  <span className="text-lg font-bold">G</span> Continue with Google
                </Button>
                <Button type="button" variant="secondary" className="min-h-14 justify-center text-base shadow-soft" onClick={() => signInWithSocial("facebook")}>
                  <Facebook className="h-5 w-5" /> Continue with Facebook
                </Button>

                <div className="my-1 flex items-center gap-3" aria-hidden="true">
                  <span className="h-px flex-1 bg-line" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Staff access</span>
                  <span className="h-px flex-1 bg-line" />
                </div>

                <button type="button" className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[14px] border border-[#E45B63] bg-white px-5 py-3 text-base font-semibold text-[#E45B63] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#E45B63] hover:text-white hover:shadow-soft active:scale-[0.98]" onClick={() => selectLoginMode("admin")}>
                  <ShieldCheck className="h-5 w-5" /> Admin Login
                </button>
                <button type="button" className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[14px] border border-[#E45B63] bg-white px-5 py-3 text-base font-semibold text-[#E45B63] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#E45B63] hover:text-white hover:shadow-soft active:scale-[0.98]" onClick={() => selectLoginMode("warden")}>
                  <BadgeCheck className="h-5 w-5" /> Warden Login
                </button>
              </div>
            ) : (
              <div>
                <button type="button" onClick={() => selectLoginMode("user")} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#E45B63] transition-colors duration-300 hover:text-brandDark">
                  <ArrowLeft className="h-4 w-4" /> Back to User Login
                </button>
                <form onSubmit={submit} className="space-y-4 rounded-[18px] border border-line bg-white p-5 shadow-soft sm:p-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#E45B63]">Secure staff access</p>
                    <h3 className="mt-2 text-2xl font-semibold text-ink">{formTitle}</h3>
                  </div>
                  <Input label={loginMode === "admin" ? "Admin Email" : "Warden Email"} type="email" required placeholder={loginMode === "warden" ? "warden@pgstay.com" : "admin@pgstay.com"} value={form.loginId} onChange={(e) => setForm({ ...form, loginId: e.target.value })} />
                  <Input label="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  <Button className="min-h-12 w-full" type="submit"><Mail className="h-4 w-4" /> Login</Button>
                </form>
              </div>
            )}
          </div>

        </Card>
      </section>
    </main>
  );
};

export default Login;
