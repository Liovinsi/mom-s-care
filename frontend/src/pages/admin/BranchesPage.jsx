import { Download, Eye, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BranchImage from "../../components/admin/BranchImage";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import { AREAS, loadAmenities, loadBranches, saveAmenities, saveBranches } from "../../data/adminBranches";

const rowsPerPage = 10;

const emptyBranch = {
  name: "",
  code: "",
  area: "",
  address: "",
  city: "Chennai",
  state: "Tamil Nadu",
  pincode: "",
  contactNumber: "",
  email: "",
  mapLink: "",
  latitude: "",
  longitude: "",
  image: "",
  gallery: [],
  description: "",
  gender: "Unisex",
  status: "Active",
  amenities: [],
  rooms: 0,
  beds: 0,
  occupiedBeds: 0,
  availableBeds: 0,
  wardens: [],
  residents: 0
};

const fieldClass = "min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/25";
const maxImageSize = 5 * 1024 * 1024;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

const Field = ({ label, required, children, error }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-ink">{label}{required && " *"}</span>
    {children}
    {error && <span className="mt-1 block text-xs font-semibold text-danger">{error}</span>}
  </label>
);

const createId = (value) => `${value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`;

const validateImageFile = (file) => {
  if (!allowedImageTypes.includes(file.type)) return "Only JPG, PNG, and WEBP images are allowed";
  if (file.size > maxImageSize) return "Image size must be 5 MB or less";
  return "";
};

const readImageFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const validateBranch = (branch, branches, editingId) => {
  const errors = {};
  ["name", "code", "area", "address", "city", "pincode", "contactNumber"].forEach((field) => {
    if (!String(branch[field] || "").trim()) errors[field] = "Required";
  });

  if (branch.contactNumber && !/^[6-9]\d{9}$/.test(branch.contactNumber)) {
    errors.contactNumber = "Enter a valid 10 digit phone number";
  }
  if (branch.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(branch.email)) {
    errors.email = "Enter a valid email address";
  }
  if (branches.some((item) => item.code.toLowerCase() === branch.code.trim().toLowerCase() && item.id !== editingId)) {
    errors.code = "Branch code already exists";
  }

  return errors;
};

const normalizeAmenityName = (value) => value.trim().replace(/\s+/g, " ");

const AmenityNameModal = ({ title, initialValue = "", amenities, editingName, onClose, onSave }) => {
  const [name, setName] = useState(initialValue);
  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const normalized = normalizeAmenityName(name);

    if (!normalized) {
      setError("Amenity name is required");
      return;
    }
    if (amenities.some((amenity) => amenity.toLowerCase() === normalized.toLowerCase() && amenity !== editingName)) {
      setError("Duplicate amenity names are not allowed");
      return;
    }

    onSave(normalized);
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/40 px-4">
      <Card className="w-full max-w-md">
        <div>
          <h2 className="text-xl font-bold text-ink">{title}</h2>
          <div className="mt-4">
            <Field label="Amenity Name" required error={error}>
              <input className={fieldClass} placeholder="Gym" value={name} onChange={(event) => { setName(event.target.value); setError(""); }} autoFocus />
            </Field>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="button" onClick={submit}>Save</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const AmenityDeleteDialog = ({ amenity, onClose, onDelete }) => (
  <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/40 px-4">
    <Card className="w-full max-w-md">
      <h2 className="text-xl font-bold text-ink">Delete Amenity?</h2>
      <p className="mt-2 text-sm text-slate-600">This action removes the amenity from this selection list.</p>
      <p className="mt-4 rounded-xl bg-paper p-3 text-sm font-semibold text-ink">{amenity}</p>
      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="button" variant="danger" onClick={() => onDelete(amenity)}>Delete</Button>
      </div>
    </Card>
  </div>
);

const AmenitiesManager = ({ amenities, selectedAmenities, onToggle, onRename, onRemove, onAmenitiesChange }) => {
  const [nameModal, setNameModal] = useState(null);
  const [deleteAmenity, setDeleteAmenity] = useState("");

  const addAmenity = (name) => {
    onAmenitiesChange([...amenities, name]);
    setNameModal(null);
  };

  const editAmenity = (name) => {
    onRename(nameModal.amenity, name);
    onAmenitiesChange(amenities.map((amenity) => (amenity === nameModal.amenity ? name : amenity)));
    setNameModal(null);
  };

  const removeAmenity = (amenity) => {
    onRemove(amenity);
    onAmenitiesChange(amenities.filter((item) => item !== amenity));
    setDeleteAmenity("");
  };

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold uppercase text-slate-500">Amenities</h3>
        <Button type="button" variant="secondary" className="min-h-10 px-4 py-2" onClick={() => setNameModal({ mode: "add" })}>
          <Plus className="h-4 w-4" /> Add Amenity
        </Button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {amenities.map((amenity) => (
          <div key={amenity} className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2 text-sm font-semibold text-ink">
            <label className="flex min-w-0 flex-1 items-center gap-3">
              <input type="checkbox" checked={selectedAmenities.includes(amenity)} onChange={() => onToggle(amenity)} className="h-4 w-4 accent-[#DD5E67]" />
              <span className="truncate">{amenity}</span>
            </label>
            <div className="flex shrink-0 gap-1">
              <button type="button" onClick={() => setNameModal({ mode: "edit", amenity })} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-paper hover:text-brandDark" aria-label={`Edit ${amenity}`}>
                <Pencil className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setDeleteAmenity(amenity)} className="grid h-8 w-8 place-items-center rounded-lg text-danger hover:bg-paper" aria-label={`Delete ${amenity}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {nameModal && (
        <AmenityNameModal
          title={nameModal.mode === "edit" ? "Edit Amenity" : "Add Amenity"}
          initialValue={nameModal.amenity || ""}
          amenities={amenities}
          editingName={nameModal.amenity}
          onClose={() => setNameModal(null)}
          onSave={nameModal.mode === "edit" ? editAmenity : addAmenity}
        />
      )}

      {deleteAmenity && <AmenityDeleteDialog amenity={deleteAmenity} onClose={() => setDeleteAmenity("")} onDelete={removeAmenity} />}
    </section>
  );
};

const BranchModal = ({ branch, branches, amenities, onAmenitiesChange, onClose, onSave }) => {
  const [form, setForm] = useState(branch || emptyBranch);
  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState("");
  const [galleryError, setGalleryError] = useState("");
  const editingId = branch?.id;
  const visibleAmenities = useMemo(() => [...new Set([...amenities, ...form.amenities])], [amenities, form.amenities]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const updateNumber = (field, value) => {
    const nextValue = Number(value || 0);
    setForm((current) => ({ ...current, [field]: nextValue }));
  };

  const toggleAmenity = (amenity) => {
    setForm((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity]
    }));
  };

  const renameAmenity = (oldName, nextName) => {
    setForm((current) => ({
      ...current,
      amenities: current.amenities.map((amenity) => (amenity === oldName ? nextName : amenity))
    }));
  };

  const removeAmenity = (amenityName) => {
    setForm((current) => ({
      ...current,
      amenities: current.amenities.filter((amenity) => amenity !== amenityName)
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const error = validateImageFile(file);
    setImageError(error);
    if (error) return;
    update("image", await readImageFile(file));
  };

  const handleGalleryUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const invalidFile = files.find((file) => validateImageFile(file));
    if (invalidFile) {
      setGalleryError(validateImageFile(invalidFile));
      return;
    }
    setGalleryError("");
    const images = await Promise.all(files.map(readImageFile));
    update("gallery", images.map((image, index) => ({
      label: ["Building Front", "Reception", "Room", "Washroom", "Dining Area", "Terrace"][index] || `Gallery ${index + 1}`,
      image
    })));
  };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = validateBranch(form, branches, editingId);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    onSave({
      ...form,
      id: editingId || createId(form.name),
      code: form.code.trim(),
      image: form.image || "",
      gallery: form.gallery?.length ? form.gallery : [],
      availableBeds: Math.max(Number(form.beds || 0) - Number(form.occupiedBeds || 0), Number(form.availableBeds || 0)),
      residents: Number(form.occupiedBeds || 0)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40">
      <form onSubmit={submit} className="h-full w-full max-w-3xl overflow-y-auto bg-white p-5 shadow-luxury">
        <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-5 flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <div>
            <h2 className="text-xl font-bold text-ink">{editingId ? "Edit Branch" : "Add Branch"}</h2>
            <p className="text-sm text-slate-500">Maintain branch details, amenities, and statistics.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:border-brandDark hover:text-brandDark" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Branch Name" required error={errors.name}>
            <input className={fieldClass} value={form.name} onChange={(e) => update("name", e.target.value)} />
          </Field>
          <Field label="Branch Code" required error={errors.code}>
            <input className={fieldClass} value={form.code} onChange={(e) => update("code", e.target.value)} />
          </Field>
          <Field label="Area" required error={errors.area}>
            <select className={fieldClass} value={form.area} onChange={(e) => update("area", e.target.value)}>
              <option value="">Select area</option>
              {AREAS.map((area) => <option key={area} value={area}>{area}</option>)}
            </select>
          </Field>
          <Field label="City" required error={errors.city}>
            <input className={fieldClass} value={form.city} onChange={(e) => update("city", e.target.value)} />
          </Field>
          <Field label="State">
            <input className={fieldClass} value={form.state} onChange={(e) => update("state", e.target.value)} />
          </Field>
          <Field label="Pincode" required error={errors.pincode}>
            <input className={fieldClass} value={form.pincode} onChange={(e) => update("pincode", e.target.value)} />
          </Field>
          <Field label="Contact Number" required error={errors.contactNumber}>
            <input className={fieldClass} value={form.contactNumber} onChange={(e) => update("contactNumber", e.target.value)} />
          </Field>
          <Field label="Email" error={errors.email}>
            <input className={fieldClass} value={form.email} onChange={(e) => update("email", e.target.value)} />
          </Field>
          <Field label="Google Map Link">
            <input className={fieldClass} value={form.mapLink} onChange={(e) => update("mapLink", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude">
              <input className={fieldClass} value={form.latitude} onChange={(e) => update("latitude", e.target.value)} />
            </Field>
            <Field label="Longitude">
              <input className={fieldClass} value={form.longitude} onChange={(e) => update("longitude", e.target.value)} />
            </Field>
          </div>
          <Field label={editingId ? "Change Image" : "Branch Image Upload"} error={imageError}>
            <div className="space-y-3">
              <BranchImage src={form.image} alt={form.name || "Branch preview"} className="h-28 w-full rounded-lg object-cover" fallbackClassName="h-28 w-full rounded-lg" />
              <input type="file" accept=".jpg,.jpeg,.png,.webp" className={fieldClass} onChange={handleImageUpload} />
              <p className="text-xs text-slate-500">JPG, PNG, or WEBP. Maximum 5 MB.</p>
            </div>
          </Field>
          <Field label="Gallery Images Upload" error={galleryError}>
            <input type="file" accept=".jpg,.jpeg,.png,.webp" multiple className={fieldClass} onChange={handleGalleryUpload} />
          </Field>
          <Field label="Gender">
            <select className={fieldClass} value={form.gender} onChange={(e) => update("gender", e.target.value)}>
              {["Boys", "Girls", "Unisex"].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select className={fieldClass} value={form.status} onChange={(e) => update("status", e.target.value)}>
              {["Active", "Inactive"].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Full Address" required error={errors.address}>
            <textarea className={`${fieldClass} min-h-28 py-3`} value={form.address} onChange={(e) => update("address", e.target.value)} />
          </Field>
          <Field label="Description">
            <textarea className={`${fieldClass} min-h-28 py-3`} value={form.description} onChange={(e) => update("description", e.target.value)} />
          </Field>
        </div>

        <AmenitiesManager
          amenities={visibleAmenities}
          selectedAmenities={form.amenities}
          onToggle={toggleAmenity}
          onRename={renameAmenity}
          onRemove={removeAmenity}
          onAmenitiesChange={onAmenitiesChange}
        />

        <section className="mt-6">
          <h3 className="text-sm font-bold uppercase text-slate-500">Branch Statistics</h3>
          <div className="mt-3 grid gap-4 md:grid-cols-4">
            {[
              ["Total Rooms", "rooms"],
              ["Total Beds", "beds"],
              ["Occupied Beds", "occupiedBeds"],
              ["Available Beds", "availableBeds"]
            ].map(([label, field]) => (
              <Field key={field} label={label}>
                <input type="number" min="0" className={fieldClass} value={form[field]} onChange={(e) => updateNumber(field, e.target.value)} />
              </Field>
            ))}
          </div>
        </section>

        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-line pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Branch</Button>
        </div>
      </form>
    </div>
  );
};

const BranchesPage = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState(loadBranches);
  const [amenities, setAmenities] = useState(loadAmenities);
  const [modalBranch, setModalBranch] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteBranch, setDeleteBranch] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", status: "All", gender: "All", area: "All" });

  const persistBranches = (nextBranches) => {
    setBranches(nextBranches);
    saveBranches(nextBranches);
  };

  const persistAmenities = (nextAmenities) => {
    setAmenities(nextAmenities);
    saveAmenities(nextAmenities);
  };

  const stats = useMemo(() => ({
    totalBranches: branches.length,
    activeBranches: branches.filter((branch) => branch.status === "Active").length,
    inactiveBranches: branches.filter((branch) => branch.status === "Inactive").length,
    totalRooms: branches.reduce((sum, branch) => sum + Number(branch.rooms || 0), 0)
  }), [branches]);

  const filteredBranches = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return branches.filter((branch) => {
      const matchesSearch = !query || [branch.name, branch.area, branch.city].some((value) => value.toLowerCase().includes(query));
      const matchesStatus = filters.status === "All" || branch.status === filters.status;
      const matchesGender = filters.gender === "All" || branch.gender === filters.gender;
      const matchesArea = filters.area === "All" || branch.area === filters.area;
      return matchesSearch && matchesStatus && matchesGender && matchesArea;
    });
  }, [branches, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredBranches.length / rowsPerPage));
  const visibleBranches = filteredBranches.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
  };

  const openAdd = () => {
    setModalBranch(null);
    setShowModal(true);
  };

  const saveBranch = (branch) => {
    const nextBranches = branches.some((item) => item.id === branch.id)
      ? branches.map((item) => (item.id === branch.id ? branch : item))
      : [branch, ...branches];
    persistBranches(nextBranches);
    setShowModal(false);
  };

  const confirmDelete = () => {
    persistBranches(branches.filter((branch) => branch.id !== deleteBranch.id));
    setDeleteBranch(null);
  };

  const resetFilters = () => {
    setFilters({ search: "", status: "All", gender: "All", area: "All" });
    setPage(1);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Branches</h1>
          <p className="text-sm text-slate-500">Manage all PG branches across Chennai.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={openAdd}><Plus className="h-4 w-4" /> Add Branch</Button>
          <Button variant="secondary" onClick={() => window.print()}><Download className="h-4 w-4" /> Export</Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Branches" value={stats.totalBranches} />
        <StatCard label="Active Branches" value={stats.activeBranches} />
        <StatCard label="Inactive Branches" value={stats.inactiveBranches} />
        <StatCard label="Total Rooms" value={stats.totalRooms} />
      </div>

      <Card className="mt-5">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(3,1fr)_auto]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className={`${fieldClass} pl-11`}
              placeholder="Search by branch name, area, city"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
          </label>
          {[
            ["Status", "status", ["All", "Active", "Inactive"]],
            ["Gender", "gender", ["All", "Boys", "Girls", "Unisex"]],
            ["Area", "area", ["All", ...AREAS]]
          ].map(([label, field, options]) => (
            <select key={field} aria-label={label} className={fieldClass} value={filters[field]} onChange={(e) => updateFilter(field, e.target.value)}>
              {options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          ))}
          <Button type="button" variant="secondary" onClick={resetFilters}>Reset Filters</Button>
        </div>
      </Card>

      <Card className="mt-5 overflow-x-auto p-0">
        <table className="w-full min-w-[1280px] text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-slate-500">
            <tr>
              {["Branch Image", "Branch Name", "Area", "Address", "Gender", "Rooms", "Beds", "Available Beds", "Contact Number", "Status", "Actions"].map((heading) => (
                <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleBranches.map((branch) => (
              <tr key={branch.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <BranchImage src={branch.image} alt={branch.name} className="h-16 w-16 rounded-lg object-cover" fallbackClassName="h-16 w-16 rounded-lg" />
                </td>
                <td className="px-4 py-3">
                  <p className="font-bold text-ink">{branch.name}</p>
                  <p className="text-xs text-slate-500">{branch.code}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{branch.area}</td>
                <td className="max-w-xs px-4 py-3 text-slate-600">{branch.address}</td>
                <td className="px-4 py-3 text-slate-600">{branch.gender}</td>
                <td className="px-4 py-3 font-semibold">{branch.rooms}</td>
                <td className="px-4 py-3 font-semibold">{branch.beds}</td>
                <td className="px-4 py-3 font-semibold text-success">{branch.availableBeds}</td>
                <td className="px-4 py-3 text-slate-600">{branch.contactNumber}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${branch.status === "Active" ? "bg-brand/10 text-brandDark" : "bg-slate-100 text-slate-600"}`}>{branch.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => navigate(`/pgbooking/admin/branches/${branch.id}`)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="View branch">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => { setModalBranch(branch); setShowModal(true); }} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="Edit branch">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setDeleteBranch(branch)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-danger hover:border-danger hover:bg-paper" aria-label="Delete branch">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!visibleBranches.length && (
              <tr><td colSpan="11" className="px-4 py-8 text-center text-slate-500">No branches match the selected filters.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <p>Showing {visibleBranches.length} of {filteredBranches.length} branches</p>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button>
          <span className="grid min-h-11 place-items-center rounded-xl border border-line px-4 font-semibold text-ink">{page} / {totalPages}</span>
          <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</Button>
        </div>
      </div>

      {showModal && (
        <BranchModal
          branch={modalBranch}
          branches={branches}
          amenities={amenities}
          onAmenitiesChange={persistAmenities}
          onClose={() => setShowModal(false)}
          onSave={saveBranch}
        />
      )}

      {deleteBranch && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4">
          <Card className="w-full max-w-md">
            <h2 className="text-xl font-bold text-ink">Delete Branch?</h2>
            <p className="mt-2 text-sm text-slate-600">This action cannot be undone.</p>
            <p className="mt-4 rounded-xl bg-paper p-3 text-sm font-semibold text-ink">{deleteBranch.name}</p>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeleteBranch(null)}>Cancel</Button>
              <Button variant="danger" onClick={confirmDelete}>Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BranchesPage;
