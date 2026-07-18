import { useState } from "react";
import { CheckCircle2, Mail, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { getDashboardPathForRole } from "../routes/roleRoutes";

const Login = () => {
  const [form, setForm] = useState({ loginId: "admin@pgstay.com", password: "Admin@123" });
  const [error, setError] = useState("");
  const [popup, setPopup] = useState(null);
  const [redirectPath, setRedirectPath] = useState("");
  const { login } = useAuth();
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
      const message = err.response?.data?.message || err.message || "Invalid login ID/email or password.";
      setError(message);
      setPopup({ type: "error", title: "Login Failed", message });
    }
  };

  return (
    <main className="mx-auto grid min-h-[calc(100vh-65px)] max-w-6xl items-center gap-8 px-4 py-10 lg:grid-cols-2">
      {popup && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/35 px-4">
          <div className={`w-full max-w-sm animate-[loginPopup_300ms_ease-out] rounded-[18px] border bg-white p-6 text-center shadow-[0_24px_70px_rgba(30,30,36,0.18)] ${popup.type === "success" ? "border-green-200" : "border-red-200"}`}>
            {popup.type === "success" ? (
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            ) : (
              <XCircle className="mx-auto h-12 w-12 text-red-600" />
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
      <section>
        <p className="text-sm font-semibold uppercase tracking-wide text-mint">Secure access</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight">Role-based PG booking operations</h1>
        <p className="mt-4 text-slate-600">Users, Wardens, and Admins use one secure login and are routed to their dedicated dashboard.</p>
      </section>
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <h2 className="text-xl font-bold">Login</h2>
          {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <Input label="Login ID / Email" type="text" required placeholder="Enter Email or Warden ID" value={form.loginId} onChange={(e) => setForm({ ...form, loginId: e.target.value })} />
          <Input label="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Button className="w-full" type="submit">
            <Mail className="h-4 w-4" /> Login
          </Button>
        </form>
      </Card>
    </main>
  );
};

export default Login;
