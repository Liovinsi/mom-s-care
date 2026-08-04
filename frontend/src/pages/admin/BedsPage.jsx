import { Download, Eye, ImagePlus, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BranchImage from "../../components/admin/BranchImage";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import { AREAS, loadBranches } from "../../data/adminBranches";
import { BED_STATUSES, BED_TYPES, luxuryBedImage } from "../../data/adminBeds";
import { loadRooms } from "../../data/adminRooms";
import { saveAvailabilitySnapshot, useLiveAvailability } from "../../lib/liveAvailability";
import { authenticatedFetch } from "../../services/apiClient";

const rowsPerPage = 10;
const maxImageSize = 5 * 1024 * 1024;
const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const fieldClass = "min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/25 disabled:bg-paper disabled:text-slate-500";

const emptyBed = {
  branchId: "",
  branchName: "",
  roomId: "",
  roomNumber: "",
  floor: "",
  sharingType: "",
  bedName: "",
  bedCode: "",
  bedType: "Single Cot",
  position: "Single",
  positionLabel: "",
  bedImage: luxuryBedImage,
  status: "Available",
  currentResident: "",
  bookingId: "",
  checkInDate: "",
  checkOutDate: "",
  description: ""
};

const Field = ({ label, required, error, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-ink">{label}{required && " *"}</span>
    {children}
    {error && <span className="mt-1 block text-xs font-semibold text-danger">{error}</span>}
  </label>
);

const statusStyles = {
  Available: "bg-brand/10 text-brandDark",
  Blocked: "bg-orange-100 text-orange-700",
  Occupied: "bg-paper text-brandDark",
  Reserved: "bg-paper text-brandDark",
  Maintenance: "bg-slate-100 text-slate-600"
};

const StatusBadge = ({ status }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[status] || statusStyles.Maintenance}`}>{status}</span>
);

const createId = (bed) => `${bed.branchId}-${bed.roomNumber}-${bed.bedName}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const getBunkPositionLabel = (bed) => {
  const token = bed.bedName.match(/(\d+|[A-Z])$/i)?.[1] || "1";
  const number = /^\d+$/.test(token) ? Number(token) : token.toUpperCase().charCodeAt(0) - 64;
  return `${bed.position === "Upper" ? "U" : "L"}${Math.max(1, number)}`;
};

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
  if (file.size > maxImageSize) return "Bed image must be 5 MB or smaller";
  return "";
};

const validateBed = (bed, beds, editingId) => {
  const errors = {};
  if (!bed.branchId) errors.branchId = "Branch is required";
  if (!bed.roomId) errors.roomId = "Please select a room.";
  if (!bed.bedName.trim()) errors.bedName = "Bed name is required";
  if (!bed.bedCode.trim()) errors.bedCode = "Bed code is required";
  if (bed.bedType === "Bunk Cot" && !["Upper", "Lower"].includes(bed.position)) errors.position = "Bunk position is required";
  if (bed.bedCode && beds.some((item) => item.bedCode.trim().toLowerCase() === bed.bedCode.trim().toLowerCase() && item.id !== editingId)) {
    errors.bedCode = "Duplicate bed code is not allowed";
  }
  return errors;
};

const BedImageUpload = ({ value, onChange, error, onError }) => {
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
      <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
        <BranchImage src={value} alt="Bed preview" className="h-32 w-full rounded-xl object-cover" fallbackClassName="h-32 w-full rounded-xl" />
        <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line bg-paper px-4 text-center text-sm font-semibold text-ink transition hover:border-brandDark hover:text-brandDark">
          <ImagePlus className="mb-2 h-5 w-5" />
          Upload Bed Image
          <span className="mt-1 text-xs font-medium text-slate-500">JPG, PNG, WEBP up to 5 MB</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />
        </label>
      </div>
      {error && <span className="mt-2 block text-xs font-semibold text-danger">{error}</span>}
    </div>
  );
};

const BedDrawer = ({ bed, beds, rooms, branches, onClose, onSave }) => {
  const [form, setForm] = useState(bed || emptyBed);
  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState("");
  const [branchRooms, setBranchRooms] = useState(() => bed ? rooms.filter((room) => room.branchId === bed.branchId) : []);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const editingId = bed?.id;

  useEffect(() => {
    if (!form.branchId) {
      setBranchRooms([]);
      return undefined;
    }
    if (editingId) {
      setBranchRooms(rooms.filter((room) => room.branchId === form.branchId));
      return undefined;
    }

    const controller = new AbortController();
    const selectedBranch = branches.find((item) => item.id === form.branchId);
    const fallbackRooms = rooms.filter((room) => room.branchId === form.branchId);
    setRoomsLoading(true);
    authenticatedFetch(`/admin/rooms?branch=${encodeURIComponent(selectedBranch?.area || selectedBranch?.name || "")}`, { signal: controller.signal, skipUnauthorizedEvent: true })
      .then((payload) => {
        const fetchedRooms = (payload?.data || []).map((room) => ({
          id: room._id || room.id,
          branchId: form.branchId,
          branchName: room.branch?.name || selectedBranch?.area || "",
          roomNumber: room.name || room.roomNumber,
          floor: room.floor,
          sharingType: typeof room.sharingType === "number" ? `${room.sharingType} Sharing` : room.sharingType,
          roomType: room.roomType
        }));
        setBranchRooms(fetchedRooms.length ? fetchedRooms : fallbackRooms);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setBranchRooms(fallbackRooms);
      })
      .finally(() => setRoomsLoading(false));
    return () => controller.abort();
  }, [form.branchId, editingId, rooms, branches]);

  const update = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "branchId") {
        const branch = branches.find((item) => item.id === value);
        next.branchName = branch?.area || "";
        next.roomId = "";
        next.roomNumber = "";
        next.sharingType = "";
      }
      if (field === "roomId") {
        const room = branchRooms.find((item) => item.id === value);
        next.roomNumber = room?.roomNumber || "";
        next.sharingType = room?.sharingType || "";
        next.floor = room?.floor || "";
      }
      return next;
    });
  };

  const submit = (event) => {
    event.preventDefault();
    const normalized = {
      ...form,
      bedName: form.bedName.trim().replace(/\s+/g, " "),
      bedCode: form.bedCode.trim().replace(/\s+/g, "")
    };
    const nextErrors = validateBed(normalized, beds, editingId);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || imageError) return;

    onSave({
      ...normalized,
      id: editingId || createId(normalized),
      positionLabel: normalized.bedType === "Bunk Cot" ? getBunkPositionLabel(normalized) : "",
      bedImage: normalized.bedImage || luxuryBedImage
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40">
      <form onSubmit={submit} className="h-full w-full max-w-3xl overflow-y-auto bg-white p-5 shadow-luxury">
        <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-5 flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <div>
            <h2 className="text-xl font-bold text-ink">{editingId ? "Edit Bed" : "Add Bed"}</h2>
            <p className="text-sm text-slate-500">Manage bed details, room mapping, status, and image.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:border-brandDark hover:text-brandDark" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Branch" required error={errors.branchId}>
            <select className={fieldClass} value={form.branchId} onChange={(event) => update("branchId", event.target.value)} disabled={Boolean(editingId)}>
              <option value="">Select branch</option>
              {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.area}</option>)}
            </select>
          </Field>
          <Field label="Room" required error={errors.roomId || (form.branchId && !form.roomId && !roomsLoading ? "Please select a room." : "")}>
            <select className={fieldClass} value={form.roomId} onChange={(event) => update("roomId", event.target.value)} disabled={Boolean(editingId) || !form.branchId}>
              <option value="">{roomsLoading ? "Loading rooms..." : "Select Room"}</option>
              {branchRooms.map((room) => <option key={room.id} value={room.id}>Room {room.roomNumber}</option>)}
            </select>
          </Field>
          <Field label="Bed Number" required error={errors.bedName}>
            <input className={fieldClass} placeholder="Bed A" value={form.bedName} onChange={(event) => update("bedName", event.target.value)} />
          </Field>
          <Field label="Floor">
            <input className={fieldClass} value={form.floor || ""} readOnly disabled placeholder="Selected room floor" />
          </Field>
          <Field label="Sharing Type">
            <input className={fieldClass} value={form.sharingType || ""} readOnly disabled placeholder="Selected room sharing type" />
          </Field>
          <Field label="Bed Code" required error={errors.bedCode}>
            <input className={fieldClass} placeholder="BED101A" value={form.bedCode} onChange={(event) => update("bedCode", event.target.value.toUpperCase())} disabled={Boolean(editingId)} />
          </Field>
          <Field label="Bed Type">
            <select className={fieldClass} value={form.bedType} onChange={(event) => setForm((current) => ({ ...current, bedType: event.target.value, position: event.target.value === "Bunk Cot" ? "Upper" : "Single" }))} disabled={Boolean(editingId)}>
              {BED_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>
          {form.bedType === "Bunk Cot" && (
            <Field label="Bunk Position" required error={errors.position}>
              <select className={fieldClass} value={form.position} onChange={(event) => update("position", event.target.value)}>
                <option value="Upper">Upper</option>
                <option value="Lower">Lower</option>
              </select>
            </Field>
          )}
          <Field label="Status">
            <select className={fieldClass} value={form.status} onChange={(event) => update("status", event.target.value)}>
              {BED_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Bed Image Upload">
              <BedImageUpload value={form.bedImage} onChange={(image) => update("bedImage", image)} error={imageError} onError={setImageError} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Description">
              <textarea className={`${fieldClass} min-h-28 py-3`} value={form.description} onChange={(event) => update("description", event.target.value)} />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-line pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!form.branchId || !form.roomId || !form.bedName.trim() || roomsLoading}>Save Bed</Button>
        </div>
      </form>
    </div>
  );
};

const BedViewModal = ({ bed, onClose }) => (
  <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/40 px-4 py-8">
    <Card className="w-full max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-ink">{bed.bedName}</h2>
          <p className="text-sm text-slate-500">{bed.bedCode} · {bed.branchName} · Room {bed.roomNumber}</p>
        </div>
        <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:border-brandDark hover:text-brandDark" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <BranchImage src={bed.bedImage} alt={bed.bedName} className="h-80 w-full rounded-2xl object-cover" fallbackClassName="h-80 w-full rounded-2xl" />
        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-paper p-4">
            <StatusBadge status={bed.status} />
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              {[
                ["Bed Name", bed.bedName],
                ["Bed Code", bed.bedCode],
                ["Branch", bed.branchName],
                ["Room", `Room ${bed.roomNumber}`],
                ["Sharing Type", bed.sharingType],
                ["Bed Type", bed.bedType],
                ...(bed.bedType === "Bunk Cot" ? [["Bunk Position", `${bed.position} ${bed.positionLabel || ""}`.trim()]] : [])
              ].map(([label, value]) => (
                <p key={label}><span className="font-semibold text-ink">{label}:</span> {value}</p>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-white p-4">
            <h3 className="text-lg font-bold text-ink">Resident Details</h3>
            <div className="mt-3 grid gap-3 text-sm text-slate-600">
              {[
                ["Current Resident", bed.status === "Occupied" ? bed.currentResident || "-" : "-"],
                ["Booking ID", bed.bookingId || "-"],
                ["Check-In Date", bed.checkInDate || "-"],
                ["Check-Out Date", bed.checkOutDate || "-"]
              ].map(([label, value]) => (
                <p key={label}><span className="font-semibold text-ink">{label}:</span> {value}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
      {bed.description && <p className="mt-5 rounded-2xl bg-paper p-4 text-sm leading-6 text-slate-600">{bed.description}</p>}
    </Card>
  </div>
);

const BedsPage = () => {
  const branches = useMemo(loadBranches, []);
  const rooms = useMemo(loadRooms, []);
  const { beds: liveBeds } = useLiveAvailability();
  const [beds, setBeds] = useState(liveBeds);
  const [drawerBed, setDrawerBed] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [viewBed, setViewBed] = useState(null);
  const [deleteBed, setDeleteBed] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", branch: "All", roomId: "All", sharingType: "All", status: "All" });

  useEffect(() => {
    setBeds(liveBeds);
  }, [liveBeds]);

  const roomFilterOptions = useMemo(() => {
    if (filters.branch === "All") return rooms;
    return rooms.filter((room) => room.branchName === filters.branch);
  }, [rooms, filters.branch]);

  const stats = useMemo(() => ({
    totalBeds: beds.length,
    availableBeds: beds.filter((bed) => bed.status === "Available").length,
    occupiedBeds: beds.filter((bed) => bed.status === "Occupied").length,
    reservedBeds: beds.filter((bed) => bed.status === "Reserved").length,
    blockedBeds: beds.filter((bed) => bed.status === "Blocked").length,
    maintenanceBeds: beds.filter((bed) => bed.status === "Maintenance").length
  }), [beds]);

  const filteredBeds = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return beds.filter((bed) => {
      const matchesSearch = !query || [bed.bedName, bed.bedCode, bed.roomNumber].some((value) => value.toLowerCase().includes(query));
      const matchesBranch = filters.branch === "All" || bed.branchName === filters.branch;
      const matchesRoom = filters.roomId === "All" || bed.roomId === filters.roomId;
      const matchesSharing = filters.sharingType === "All" || bed.sharingType === filters.sharingType;
      const matchesStatus = filters.status === "All" || bed.status === filters.status;
      return matchesSearch && matchesBranch && matchesRoom && matchesSharing && matchesStatus;
    });
  }, [beds, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredBeds.length / rowsPerPage));
  const visibleBeds = filteredBeds.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const persistBeds = (nextBeds) => {
    setBeds(nextBeds);
    saveAvailabilitySnapshot(nextBeds, rooms);
  };

  const updateFilter = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
      ...(field === "branch" ? { roomId: "All" } : {})
    }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ search: "", branch: "All", roomId: "All", sharingType: "All", status: "All" });
    setPage(1);
  };

  const saveBed = (bed) => {
    const nextBeds = beds.some((item) => item.id === bed.id)
      ? beds.map((item) => (item.id === bed.id ? bed : item))
      : [bed, ...beds];
    persistBeds(nextBeds);
    setShowDrawer(false);
  };

  const confirmDelete = () => {
    persistBeds(beds.filter((bed) => bed.id !== deleteBed.id));
    setDeleteBed(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Beds</h1>
          <p className="text-sm text-slate-500">Manage all beds across every room and branch.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => { setDrawerBed(null); setShowDrawer(true); }}><Plus className="h-4 w-4" /> Add Bed</Button>
          <Button variant="secondary" onClick={() => window.print()}><Download className="h-4 w-4" /> Export</Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Total Beds" value={stats.totalBeds} />
        <StatCard label="Available Beds" value={stats.availableBeds} />
        <StatCard label="Occupied Beds" value={stats.occupiedBeds} />
        <StatCard label="Blocked Beds" value={stats.blockedBeds} />
        <StatCard label="Reserved Beds" value={stats.reservedBeds} />
        <StatCard label="Maintenance Beds" value={stats.maintenanceBeds} />
      </div>

      <Card className="mt-5">
        <div className="grid gap-3 xl:grid-cols-[1.2fr_repeat(4,1fr)_auto]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input className={`${fieldClass} pl-11`} placeholder="Search by bed name, bed code, room number" value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} />
          </label>
          <select aria-label="Branch" className={fieldClass} value={filters.branch} onChange={(event) => updateFilter("branch", event.target.value)}>
            {["All", ...AREAS].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select aria-label="Room" className={fieldClass} value={filters.roomId} onChange={(event) => updateFilter("roomId", event.target.value)}>
            <option value="All">All Rooms</option>
            {roomFilterOptions.map((room) => <option key={room.id} value={room.id}>Room {room.roomNumber}</option>)}
          </select>
          <select aria-label="Sharing" className={fieldClass} value={filters.sharingType} onChange={(event) => updateFilter("sharingType", event.target.value)}>
            {["All", "1 Sharing", "2 Sharing", "3 Sharing", "4 Sharing"].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select aria-label="Status" className={fieldClass} value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
            {["All", ...BED_STATUSES].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <Button type="button" variant="secondary" onClick={resetFilters}>Reset Filters</Button>
        </div>
      </Card>

      <Card className="mt-5 overflow-x-auto p-0">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-slate-500">
            <tr>
              {["Bed Image", "Bed Name", "Bed Code", "Branch", "Room Number", "Sharing Type", "Current Resident", "Status", "Actions"].map((heading) => (
                <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleBeds.map((bed) => (
              <tr key={bed.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <BranchImage src={bed.bedImage} alt={bed.bedName} className="h-14 w-20 rounded-xl object-cover" fallbackClassName="h-14 w-20 rounded-xl" />
                </td>
                <td className="px-4 py-3 font-bold text-ink">{bed.bedName}</td>
                <td className="px-4 py-3 font-semibold text-slate-600">{bed.bedCode}</td>
                <td className="px-4 py-3 text-slate-600">{bed.branchName}</td>
                <td className="px-4 py-3 text-slate-600">Room {bed.roomNumber}</td>
                <td className="px-4 py-3 text-slate-600">{bed.sharingType}</td>
                <td className="px-4 py-3 text-slate-600">{bed.currentResident || "-"}</td>
                <td className="px-4 py-3"><StatusBadge status={bed.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setViewBed(bed)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="View bed">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => { setDrawerBed(bed); setShowDrawer(true); }} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="Edit bed">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setDeleteBed(bed)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-danger hover:border-danger hover:bg-paper" aria-label="Delete bed">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!visibleBeds.length && (
              <tr><td colSpan="9" className="px-4 py-8 text-center text-slate-500">No beds match the selected filters.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <p>Showing {visibleBeds.length} of {filteredBeds.length} beds</p>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button>
          <span className="grid min-h-11 place-items-center rounded-xl border border-line px-4 font-semibold text-ink">{page} / {totalPages}</span>
          <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</Button>
        </div>
      </div>

      {showDrawer && <BedDrawer bed={drawerBed} beds={beds} rooms={rooms} branches={branches} onClose={() => setShowDrawer(false)} onSave={saveBed} />}
      {viewBed && <BedViewModal bed={viewBed} onClose={() => setViewBed(null)} />}

      {deleteBed && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4">
          <Card className="w-full max-w-md">
            <h2 className="text-xl font-bold text-ink">Delete this Bed?</h2>
            <p className="mt-2 text-sm text-slate-600">This action cannot be undone.</p>
            <p className="mt-4 rounded-xl bg-paper p-3 text-sm font-semibold text-ink">{deleteBed.branchName} · Room {deleteBed.roomNumber} · {deleteBed.bedName}</p>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeleteBed(null)}>Cancel</Button>
              <Button variant="danger" onClick={confirmDelete}>Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BedsPage;
