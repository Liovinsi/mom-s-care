import { Download, Eye, ImagePlus, KeyRound, Pencil, Plus, Search, Trash2, UserX, X } from "lucide-react";
import { useMemo, useState } from "react";
import BranchImage from "../../components/admin/BranchImage";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import { loadBranches } from "../../data/adminBranches";
import { loadBeds } from "../../data/adminBeds";
import { loadResidents } from "../../data/adminResidents";
import { loadRooms } from "../../data/adminRooms";
import { WARDEN_GENDERS, WARDEN_ROLE, WARDEN_STATUSES, loadWardens, saveWardens } from "../../data/adminWardens";

const rowsPerPage = 10;
const maxImageSize = 5 * 1024 * 1024;
const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const fieldClass = "min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15 disabled:bg-paper disabled:text-slate-500";
const defaultPhoto = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=82";

const emptyWarden = {
  firstName: "",
  lastName: "",
  gender: "",
  dob: "",
  phone: "",
  email: "",
  photo: defaultPhoto,
  address: "",
  city: "",
  state: "",
  pincode: "",
  employeeId: "",
  joiningDate: "",
  experience: "",
  qualification: "",
  salary: "",
  branchId: "",
  branchName: "",
  username: "",
  password: "",
  confirmPassword: "",
  role: WARDEN_ROLE,
  status: "Active",
  forcePasswordChange: false,
  temporaryPassword: "",
  recentActivities: []
};

const statusStyles = {
  Active: "bg-emerald-50 text-emerald-700",
  Inactive: "bg-slate-100 text-slate-600",
  "On Leave": "bg-orange-50 text-orange-700"
};

const StatusBadge = ({ status }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[status] || statusStyles.Inactive}`}>{status}</span>
);

const Field = ({ label, required, error, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-ink">{label}{required && " *"}</span>
    {children}
    {error && <span className="mt-1 block text-xs font-semibold text-danger">{error}</span>}
  </label>
);

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const wardenName = (warden) => `${warden.firstName} ${warden.lastName}`.trim();

const readImageFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const validateImageFile = (file) => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const hasAllowedExtension = ["jpg", "jpeg", "png", "webp"].includes(extension);
  if (!imageTypes.includes(file.type) && !hasAllowedExtension) return "Upload JPG, PNG, or WEBP image only";
  if (file.size > maxImageSize) return "Photo must be 5 MB or smaller";
  return "";
};

const WardenPhotoUpload = ({ value, onChange, error, onError }) => {
  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const nextError = validateImageFile(file);
    if (nextError) {
      onError(nextError);
      event.target.value = "";
      return;
    }
    const image = await readImageFile(file);
    onError("");
    onChange(image);
  };

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
        <BranchImage src={value} alt="Warden preview" className="h-32 w-full rounded-xl object-cover" fallbackClassName="h-32 w-full rounded-xl" />
        <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line bg-paper px-4 text-center text-sm font-semibold text-ink transition hover:border-gold hover:text-gold">
          <ImagePlus className="mb-2 h-5 w-5" />
          Upload Photo
          <span className="mt-1 text-xs font-medium text-slate-500">JPG, PNG, WEBP up to 5 MB</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />
        </label>
      </div>
      {error && <span className="mt-2 block text-xs font-semibold text-danger">{error}</span>}
    </div>
  );
};

const validateWarden = (warden, wardens, editingId) => {
  const errors = {};
  if (!warden.firstName.trim()) errors.firstName = "First name is required";
  if (!warden.lastName.trim()) errors.lastName = "Last name is required";
  if (!warden.gender) errors.gender = "Gender is required";
  if (!warden.dob) errors.dob = "Date of birth is required";
  if (!warden.phone.trim()) errors.phone = "Phone is required";
  if (!warden.email.trim()) errors.email = "Email is required";
  if (!warden.employeeId.trim()) errors.employeeId = "Employee ID is required";
  if (!warden.joiningDate) errors.joiningDate = "Joining date is required";
  if (!warden.branchId) errors.branchId = "Branch is required";
  if (!warden.username.trim()) errors.username = "Username is required";

  const normalizedEmployee = warden.employeeId.trim().toLowerCase();
  const normalizedEmail = warden.email.trim().toLowerCase();
  const normalizedPhone = warden.phone.trim();
  if (wardens.some((item) => item.employeeId.trim().toLowerCase() === normalizedEmployee && item.id !== editingId)) errors.employeeId = "Employee ID must be unique";
  if (wardens.some((item) => item.email.trim().toLowerCase() === normalizedEmail && item.id !== editingId)) errors.email = "Email must be unique";
  if (wardens.some((item) => item.phone.trim() === normalizedPhone && item.id !== editingId)) errors.phone = "Phone number must be unique";

  if (!editingId) {
    if (!warden.password || warden.password.length < 8) errors.password = "Password must be at least 8 characters";
    if (warden.password !== warden.confirmPassword) errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

const getWardenMetrics = (warden, residents, rooms, beds) => {
  const branchResidents = residents.filter((resident) => resident.branchId === warden.branchId && resident.status !== "Checked Out");
  const branchRooms = rooms.filter((room) => room.branchId === warden.branchId);
  const branchBeds = beds.filter((bed) => bed.branchId === warden.branchId);
  const occupiedBeds = branchBeds.filter((bed) => bed.status === "Occupied").length;
  return {
    currentResidents: branchResidents.length,
    currentOccupancy: branchBeds.length ? `${Math.round((occupiedBeds / branchBeds.length) * 100)}%` : "0%",
    roomsManaged: branchRooms.length,
    bedsManaged: branchBeds.length
  };
};

const WardenDrawer = ({ warden, wardens, branches, onClose, onSave }) => {
  const [form, setForm] = useState(warden ? { ...warden, password: "", confirmPassword: "" } : emptyWarden);
  const [errors, setErrors] = useState({});
  const [photoError, setPhotoError] = useState("");
  const editingId = warden?.id;

  const update = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "branchId") {
        const branch = branches.find((item) => item.id === value);
        next.branchName = branch?.area || "";
      }
      return next;
    });
  };

  const submit = (event) => {
    event.preventDefault();
    const normalized = {
      ...form,
      firstName: form.firstName.trim().replace(/\s+/g, " "),
      lastName: form.lastName.trim().replace(/\s+/g, " "),
      phone: form.phone.trim(),
      email: form.email.trim(),
      employeeId: form.employeeId.trim().toUpperCase(),
      username: form.username.trim(),
      salary: Number(form.salary || 0)
    };
    const nextErrors = validateWarden(normalized, wardens, editingId);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || photoError) return;

    onSave({
      ...normalized,
      id: editingId || normalized.employeeId,
      role: WARDEN_ROLE,
      photo: normalized.photo || defaultPhoto,
      recentActivities: normalized.recentActivities?.length ? normalized.recentActivities : ["Profile created", "Branch access configured"]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40">
      <form onSubmit={submit} className="h-full w-full max-w-4xl overflow-y-auto bg-white p-5 shadow-luxury">
        <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-5 flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <div>
            <h2 className="text-xl font-bold text-ink">{editingId ? "Edit Warden" : "Add Warden"}</h2>
            <p className="text-sm text-slate-500">Manage warden details, branch access, and login credentials.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:border-gold hover:text-gold" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <section>
          <h3 className="text-sm font-bold uppercase text-slate-500">Personal Information</h3>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Field label="Photo Upload">
                <WardenPhotoUpload value={form.photo} onChange={(image) => update("photo", image)} error={photoError} onError={setPhotoError} />
              </Field>
            </div>
            <Field label="First Name" required error={errors.firstName}>
              <input className={fieldClass} value={form.firstName} onChange={(event) => update("firstName", event.target.value)} disabled={Boolean(editingId)} />
            </Field>
            <Field label="Last Name" required error={errors.lastName}>
              <input className={fieldClass} value={form.lastName} onChange={(event) => update("lastName", event.target.value)} disabled={Boolean(editingId)} />
            </Field>
            <Field label="Gender" required error={errors.gender}>
              <select className={fieldClass} value={form.gender} onChange={(event) => update("gender", event.target.value)} disabled={Boolean(editingId)}>
                <option value="">Select gender</option>
                {WARDEN_GENDERS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="Date of Birth" required error={errors.dob}>
              <input type="date" className={fieldClass} value={form.dob} onChange={(event) => update("dob", event.target.value)} disabled={Boolean(editingId)} />
            </Field>
            <Field label="Phone" required error={errors.phone}>
              <input className={fieldClass} value={form.phone} onChange={(event) => update("phone", event.target.value)} />
            </Field>
            <Field label="Email" required error={errors.email}>
              <input type="email" className={fieldClass} value={form.email} onChange={(event) => update("email", event.target.value)} />
            </Field>
            <Field label="Address">
              <input className={fieldClass} value={form.address} onChange={(event) => update("address", event.target.value)} disabled={Boolean(editingId)} />
            </Field>
            <Field label="City">
              <input className={fieldClass} value={form.city} onChange={(event) => update("city", event.target.value)} disabled={Boolean(editingId)} />
            </Field>
            <Field label="State">
              <input className={fieldClass} value={form.state} onChange={(event) => update("state", event.target.value)} disabled={Boolean(editingId)} />
            </Field>
            <Field label="Pincode">
              <input className={fieldClass} value={form.pincode} onChange={(event) => update("pincode", event.target.value)} disabled={Boolean(editingId)} />
            </Field>
          </div>
        </section>

        <section className="mt-6">
          <h3 className="text-sm font-bold uppercase text-slate-500">Employment Details</h3>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <Field label="Employee ID" required error={errors.employeeId}>
              <input className={fieldClass} value={form.employeeId} onChange={(event) => update("employeeId", event.target.value.toUpperCase())} disabled={Boolean(editingId)} />
            </Field>
            <Field label="Joining Date" required error={errors.joiningDate}>
              <input type="date" className={fieldClass} value={form.joiningDate} onChange={(event) => update("joiningDate", event.target.value)} disabled={Boolean(editingId)} />
            </Field>
            <Field label="Experience">
              <input className={fieldClass} value={form.experience} onChange={(event) => update("experience", event.target.value)} />
            </Field>
            <Field label="Qualification">
              <input className={fieldClass} value={form.qualification} onChange={(event) => update("qualification", event.target.value)} disabled={Boolean(editingId)} />
            </Field>
            <Field label="Salary">
              <input type="number" min="0" className={fieldClass} value={form.salary} onChange={(event) => update("salary", event.target.value)} />
            </Field>
            <Field label="Status">
              <select className={fieldClass} value={form.status} onChange={(event) => update("status", event.target.value)}>
                {WARDEN_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </Field>
          </div>
        </section>

        <section className="mt-6">
          <h3 className="text-sm font-bold uppercase text-slate-500">Branch Assignment</h3>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <Field label="Assign Branch" required error={errors.branchId}>
              <select className={fieldClass} value={form.branchId} onChange={(event) => update("branchId", event.target.value)}>
                <option value="">Select branch</option>
                {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.area}</option>)}
              </select>
            </Field>
          </div>
        </section>

        <section className="mt-6">
          <h3 className="text-sm font-bold uppercase text-slate-500">Login Credentials</h3>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <Field label="Username" required error={errors.username}>
              <input className={fieldClass} value={form.username} onChange={(event) => update("username", event.target.value)} disabled={Boolean(editingId)} />
            </Field>
            <Field label="Role">
              <input className={fieldClass} value={WARDEN_ROLE} disabled />
            </Field>
            {!editingId && (
              <>
                <Field label="Password" required error={errors.password}>
                  <input type="password" className={fieldClass} value={form.password} onChange={(event) => update("password", event.target.value)} />
                </Field>
                <Field label="Confirm Password" required error={errors.confirmPassword}>
                  <input type="password" className={fieldClass} value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} />
                </Field>
              </>
            )}
          </div>
        </section>

        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-line pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </div>
  );
};

const DetailGrid = ({ items }) => (
  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
    {items.map(([label, value]) => (
      <p key={label}><span className="font-semibold text-ink">{label}:</span> {value || "-"}</p>
    ))}
  </div>
);

const WardenViewModal = ({ warden, metrics, residents, onClose }) => {
  const fullName = wardenName(warden);
  const assignedResidents = residents.filter((resident) => resident.branchId === warden.branchId && resident.status !== "Checked Out");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/40 px-4 py-8">
      <Card className="w-full max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <BranchImage src={warden.photo} alt={fullName} className="h-20 w-20 rounded-2xl object-cover" fallbackClassName="h-20 w-20 rounded-2xl" />
            <div>
              <h2 className="text-2xl font-bold text-ink">{fullName}</h2>
              <p className="text-sm text-slate-500">{warden.employeeId} · {warden.branchName}</p>
              <div className="mt-2"><StatusBadge status={warden.status} /></div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:border-gold hover:text-gold" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card>
            <h3 className="text-lg font-bold text-ink">Personal Details</h3>
            <DetailGrid items={[
              ["Full Name", fullName],
              ["Gender", warden.gender],
              ["Date of Birth", formatDate(warden.dob)],
              ["Phone", warden.phone],
              ["Email", warden.email],
              ["Address", [warden.address, warden.city, warden.state, warden.pincode].filter(Boolean).join(", ")]
            ]} />
          </Card>
          <Card>
            <h3 className="text-lg font-bold text-ink">Employment Details</h3>
            <DetailGrid items={[
              ["Employee ID", warden.employeeId],
              ["Joining Date", formatDate(warden.joiningDate)],
              ["Experience", warden.experience],
              ["Qualification", warden.qualification],
              ["Salary", formatCurrency(warden.salary)],
              ["Role", warden.role]
            ]} />
          </Card>
          <Card>
            <h3 className="text-lg font-bold text-ink">Assigned Branch</h3>
            <DetailGrid items={[
              ["Primary Branch", warden.branchName],
              ["Current Residents Count", metrics.currentResidents],
              ["Current Occupancy", metrics.currentOccupancy],
              ["Rooms Managed", metrics.roomsManaged],
              ["Beds Managed", metrics.bedsManaged]
            ]} />
          </Card>
          <Card>
            <h3 className="text-lg font-bold text-ink">Branch Access Rules</h3>
            <div className="mt-4 grid gap-2 text-sm text-slate-600">
              {["Approve Check-In", "Approve Check-Out", "Allocate Beds", "Manage Residents", "Update Bed Status", "Collect Rent", "View Complaints"].map((item) => (
                <p key={item}><span className="font-semibold text-gold">Can:</span> {item}</p>
              ))}
              <p><span className="font-semibold text-danger">Cannot:</span> Add or delete branches, rooms, or beds</p>
              <p><span className="font-semibold text-danger">Cannot:</span> View other branch data</p>
            </div>
          </Card>
          <Card className="lg:col-span-2">
            <h3 className="text-lg font-bold text-ink">Recent Activities</h3>
            <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              {(warden.recentActivities || []).map((activity) => <p key={activity} className="rounded-xl bg-paper p-3">{activity}</p>)}
              {assignedResidents.slice(0, 4).map((resident) => <p key={resident.id} className="rounded-xl bg-paper p-3">Managing resident {resident.fullName} in Room {resident.roomNumber}</p>)}
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
};

const ResetPasswordDialog = ({ warden, onClose, onReset }) => {
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const generatePassword = () => {
    const password = `Temp@${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setTemporaryPassword(password);
    onReset(warden, password);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4">
      <Card className="w-full max-w-md">
        <h2 className="text-xl font-bold text-ink">Reset Password</h2>
        <p className="mt-2 text-sm text-slate-600">Generate a temporary password and force password change on first login.</p>
        <p className="mt-4 rounded-xl bg-paper p-3 text-sm font-semibold text-ink">{wardenName(warden)} · {warden.employeeId}</p>
        {temporaryPassword && <p className="mt-3 rounded-xl border border-gold/30 bg-gold/10 p-3 text-sm font-bold text-ink">Temporary Password: {temporaryPassword}</p>}
        <div className="mt-5 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={generatePassword}>Generate Password</Button>
        </div>
      </Card>
    </div>
  );
};

const DeleteDialog = ({ warden, activeResidents, onClose, onDelete }) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4">
    <Card className="w-full max-w-md">
      <h2 className="text-xl font-bold text-ink">Delete this warden?</h2>
      {activeResidents.length ? (
        <p className="mt-2 text-sm text-danger">Deletion is blocked because this warden has active residents assigned.</p>
      ) : (
        <p className="mt-2 text-sm text-slate-600">This action cannot be undone.</p>
      )}
      <p className="mt-4 rounded-xl bg-paper p-3 text-sm font-semibold text-ink">{wardenName(warden)} · {warden.employeeId}</p>
      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="button" variant="danger" disabled={Boolean(activeResidents.length)} onClick={() => onDelete(warden)}>Delete</Button>
      </div>
    </Card>
  </div>
);

const WardensPage = () => {
  const branches = useMemo(loadBranches, []);
  const rooms = useMemo(loadRooms, []);
  const beds = useMemo(loadBeds, []);
  const residents = useMemo(loadResidents, []);
  const [wardens, setWardens] = useState(loadWardens);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerWarden, setDrawerWarden] = useState(null);
  const [viewWarden, setViewWarden] = useState(null);
  const [resetWarden, setResetWarden] = useState(null);
  const [deleteWarden, setDeleteWarden] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", branch: "All Branches", status: "All" });

  const stats = useMemo(() => ({
    totalWardens: wardens.length,
    activeWardens: wardens.filter((warden) => warden.status === "Active").length,
    inactiveWardens: wardens.filter((warden) => warden.status === "Inactive").length,
    branchesAssigned: new Set(wardens.map((warden) => warden.branchId).filter(Boolean)).size
  }), [wardens]);

  const filteredWardens = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return wardens.filter((warden) => {
      const matchesSearch = !query || [wardenName(warden), warden.employeeId, warden.phone, warden.email].some((value) => value.toLowerCase().includes(query));
      const matchesBranch = filters.branch === "All Branches" || warden.branchName === filters.branch;
      const matchesStatus = filters.status === "All" || warden.status === filters.status;
      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [wardens, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredWardens.length / rowsPerPage));
  const visibleWardens = filteredWardens.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const persistWardens = (nextWardens) => {
    setWardens(nextWardens);
    saveWardens(nextWardens);
  };

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ search: "", branch: "All Branches", status: "All" });
    setPage(1);
  };

  const saveWarden = (warden) => {
    const nextWardens = wardens.some((item) => item.id === warden.id)
      ? wardens.map((item) => (item.id === warden.id ? warden : item))
      : [warden, ...wardens];
    persistWardens(nextWardens);
    setShowDrawer(false);
  };

  const resetPassword = (warden, temporaryPassword) => {
    persistWardens(wardens.map((item) => (
      item.id === warden.id ? { ...item, temporaryPassword, forcePasswordChange: true } : item
    )));
  };

  const toggleWarden = (warden) => {
    persistWardens(wardens.map((item) => (
      item.id === warden.id ? { ...item, status: item.status === "Active" ? "Inactive" : "Active" } : item
    )));
  };

  const activeAssignedResidents = (warden) =>
    residents.filter((resident) => resident.assignedWarden === wardenName(warden) && resident.status !== "Checked Out");

  const confirmDelete = (warden) => {
    persistWardens(wardens.filter((item) => item.id !== warden.id));
    setDeleteWarden(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Wardens</h1>
          <p className="text-sm text-slate-500">Manage all wardens assigned to PG branches.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => { setDrawerWarden(null); setShowDrawer(true); }}><Plus className="h-4 w-4" /> Add Warden</Button>
          <Button variant="secondary" onClick={() => window.print()}><Download className="h-4 w-4" /> Export</Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Wardens" value={stats.totalWardens} />
        <StatCard label="Active Wardens" value={stats.activeWardens} />
        <StatCard label="Inactive Wardens" value={stats.inactiveWardens} />
        <StatCard label="Branches Assigned" value={stats.branchesAssigned} />
      </div>

      <Card className="mt-5">
        <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr_1fr_auto]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input className={`${fieldClass} pl-11`} placeholder="Search by name, employee ID, phone, email" value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} />
          </label>
          <select aria-label="Branch" className={fieldClass} value={filters.branch} onChange={(event) => updateFilter("branch", event.target.value)}>
            {["All Branches", ...branches.map((branch) => branch.area)].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select aria-label="Status" className={fieldClass} value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
            {["All", ...WARDEN_STATUSES].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <Button type="button" variant="secondary" onClick={resetFilters}>Reset Filters</Button>
        </div>
      </Card>

      <Card className="mt-5 overflow-x-auto p-0">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-slate-500">
            <tr>
              {["Photo", "Employee ID", "Name", "Assigned Branch", "Phone", "Email", "Experience", "Status", "Actions"].map((heading) => (
                <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleWardens.map((warden) => (
              <tr key={warden.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <BranchImage src={warden.photo} alt={wardenName(warden)} className="h-14 w-14 rounded-xl object-cover" fallbackClassName="h-14 w-14 rounded-xl" />
                </td>
                <td className="px-4 py-3 font-bold text-ink">{warden.employeeId}</td>
                <td className="px-4 py-3 font-semibold text-ink">{wardenName(warden)}</td>
                <td className="px-4 py-3 text-slate-600">{warden.branchName}</td>
                <td className="px-4 py-3 text-slate-600">{warden.phone}</td>
                <td className="px-4 py-3 text-slate-600">{warden.email}</td>
                <td className="px-4 py-3 text-slate-600">{warden.experience || "-"}</td>
                <td className="px-4 py-3"><StatusBadge status={warden.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setViewWarden(warden)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-gold hover:text-gold" aria-label="View warden">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => { setDrawerWarden(warden); setShowDrawer(true); }} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-gold hover:text-gold" aria-label="Edit warden">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setResetWarden(warden)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-gold hover:text-gold" aria-label="Reset password">
                      <KeyRound className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => toggleWarden(warden)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-gold hover:text-gold" aria-label={warden.status === "Active" ? "Disable warden" : "Enable warden"}>
                      <UserX className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setDeleteWarden(warden)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-danger hover:border-danger hover:bg-red-50" aria-label="Delete warden">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!visibleWardens.length && (
              <tr><td colSpan="9" className="px-4 py-8 text-center text-slate-500">No wardens match the selected filters.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <p>Showing {visibleWardens.length} of {filteredWardens.length} wardens</p>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button>
          <span className="grid min-h-11 place-items-center rounded-xl border border-line px-4 font-semibold text-ink">{page} / {totalPages}</span>
          <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</Button>
        </div>
      </div>

      {showDrawer && <WardenDrawer warden={drawerWarden} wardens={wardens} branches={branches} onClose={() => setShowDrawer(false)} onSave={saveWarden} />}
      {viewWarden && <WardenViewModal warden={viewWarden} metrics={getWardenMetrics(viewWarden, residents, rooms, beds)} residents={residents} onClose={() => setViewWarden(null)} />}
      {resetWarden && <ResetPasswordDialog warden={resetWarden} onClose={() => setResetWarden(null)} onReset={resetPassword} />}
      {deleteWarden && <DeleteDialog warden={deleteWarden} activeResidents={activeAssignedResidents(deleteWarden)} onClose={() => setDeleteWarden(null)} onDelete={confirmDelete} />}
    </div>
  );
};

export default WardensPage;
