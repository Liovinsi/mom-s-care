import { Download, Eye, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import BranchImage from "../../components/admin/BranchImage";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import { AREAS, loadBranches } from "../../data/adminBranches";
import { ROOM_IMAGE_LABELS, loadRoomAmenities, loadRooms, saveRoomAmenities, saveRooms } from "../../data/adminRooms";
import { summarizeRoomAvailability, useLiveAvailability } from "../../lib/liveAvailability";

const rowsPerPage = 10;
const fieldClass = "min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/25";

const emptyRoom = {
  branchId: "",
  branchName: "",
  roomNumber: "",
  floor: "",
  roomType: "AC",
  sharingType: "2 Sharing",
  monthlyRent: "",
  securityDeposit: "",
  size: "",
  description: "",
  status: "Available",
  amenities: [],
  roomAmenities: [],
  images: [],
  beds: 2,
  availableBeds: 2,
  occupiedBeds: 0
};

const Field = ({ label, required, error, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-ink">{label}{required && " *"}</span>
    {children}
    {error && <span className="mt-1 block text-xs font-semibold text-danger">{error}</span>}
  </label>
);

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
        <h2 className="text-xl font-bold text-ink">{title}</h2>
        <div className="mt-4">
          <Field label="Amenity Name" required error={error}>
            <input className={fieldClass} value={name} onChange={(event) => { setName(event.target.value); setError(""); }} autoFocus />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={submit}>Save</Button>
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

const RoomAmenitiesManager = ({ amenities, selectedAmenities, onToggle, onRename, onRemove, onAmenitiesChange }) => {
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
        <div>
          <h3 className="text-sm font-bold uppercase text-slate-500">Room Amenities</h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-brand">Default Amenities</p>
        </div>
        <Button type="button" variant="secondary" className="min-h-10 px-4 py-2" onClick={() => setNameModal({ mode: "add" })}>
          <Plus className="h-4 w-4" /> Add Room Amenity
        </Button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {amenities.map((amenity) => (
          <div key={amenity} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-ink">
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
          title={nameModal.mode === "edit" ? "Edit Room Amenity" : "Add Room Amenity"}
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

const createId = (room) => `${room.branchId}-${room.roomNumber}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const readImageFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const getBedsForSharing = (sharingType) => Number(sharingType.split(" ")[0] || 0);

const normalizeRoomCounts = (room) => {
  const beds = getBedsForSharing(room.sharingType);
  const occupiedBeds = room.status === "Occupied" ? beds : Math.min(Number(room.occupiedBeds || 0), beds);
  const availableBeds = room.status === "Maintenance" ? 0 : Math.max(beds - occupiedBeds, 0);
  return { ...room, beds, occupiedBeds, availableBeds };
};

const validateRoom = (room, rooms, editingId) => {
  const errors = {};
  if (!room.branchId) errors.branchId = "Branch is required";
  if (!room.roomNumber.trim()) errors.roomNumber = "Room number is required";
  if (!room.floor.trim()) errors.floor = "Floor is required";
  if (!Number(room.monthlyRent || 0) || Number(room.monthlyRent) <= 0) errors.monthlyRent = "Rent must be greater than zero";
  if (room.branchId && room.roomNumber && rooms.some((item) => item.branchId === room.branchId && item.roomNumber.trim().toLowerCase() === room.roomNumber.trim().toLowerCase() && item.id !== editingId)) {
    errors.roomNumber = "Duplicate room number is not allowed within the same branch";
  }
  return errors;
};

const RoomModal = ({ room, rooms, branches, roomAmenities, onRoomAmenitiesChange, onClose, onSave }) => {
  const [form, setForm] = useState(room || emptyRoom);
  const [errors, setErrors] = useState({});
  const editingId = room?.id;
  const selectedAmenities = form.roomAmenities || form.amenities || [];
  const visibleAmenities = useMemo(() => [...new Set([...roomAmenities, ...selectedAmenities])], [roomAmenities, selectedAmenities]);

  const update = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "branchId") {
        const branch = branches.find((item) => item.id === value);
        next.branchName = branch?.area || "";
      }
      if (field === "sharingType" || field === "status") return normalizeRoomCounts(next);
      return next;
    });
  };

  const toggleAmenity = (amenity) => {
    setForm((current) => {
      const currentAmenities = current.roomAmenities || current.amenities || [];
      const nextAmenities = currentAmenities.includes(amenity)
        ? currentAmenities.filter((item) => item !== amenity)
        : [...currentAmenities, amenity];
      return { ...current, amenities: nextAmenities, roomAmenities: nextAmenities };
    });
  };

  const renameAmenity = (oldName, nextName) => {
    setForm((current) => {
      const currentAmenities = current.roomAmenities || current.amenities || [];
      const nextAmenities = currentAmenities.map((amenity) => (amenity === oldName ? nextName : amenity));
      return { ...current, amenities: nextAmenities, roomAmenities: nextAmenities };
    });
  };

  const removeAmenity = (amenityName) => {
    setForm((current) => {
      const currentAmenities = current.roomAmenities || current.amenities || [];
      const nextAmenities = currentAmenities.filter((amenity) => amenity !== amenityName);
      return { ...current, amenities: nextAmenities, roomAmenities: nextAmenities };
    });
  };

  const handleImagesUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const images = await Promise.all(files.map(readImageFile));
    update("images", images.map((image, index) => ({
      label: ROOM_IMAGE_LABELS[index] || `Image ${index + 1}`,
      image
    })));
  };

  const submit = (event) => {
    event.preventDefault();
    const normalized = normalizeRoomCounts(form);
    const normalizedAmenities = normalized.roomAmenities || normalized.amenities || [];
    const nextErrors = validateRoom(normalized, rooms, editingId);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    onSave({
      ...normalized,
      amenities: normalizedAmenities,
      roomAmenities: normalizedAmenities,
      id: editingId || createId(normalized),
      monthlyRent: Number(normalized.monthlyRent),
      securityDeposit: Number(normalized.securityDeposit || 0)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40">
      <form onSubmit={submit} className="h-full w-full max-w-3xl overflow-y-auto bg-white p-5 shadow-luxury">
        <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-5 flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <div>
            <h2 className="text-xl font-bold text-ink">{editingId ? "Edit Room" : "Add Room"}</h2>
            <p className="text-sm text-slate-500">Manage room details, rent, amenities, and images.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:border-brandDark hover:text-brandDark" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Branch" required error={errors.branchId}>
            <select className={fieldClass} value={form.branchId} onChange={(event) => update("branchId", event.target.value)}>
              <option value="">Select branch</option>
              {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.area}</option>)}
            </select>
          </Field>
          <Field label="Room Number" required error={errors.roomNumber}>
            <input className={fieldClass} value={form.roomNumber} onChange={(event) => update("roomNumber", event.target.value)} />
          </Field>
          <Field label="Floor" required error={errors.floor}>
            <input className={fieldClass} placeholder="1st Floor" value={form.floor} onChange={(event) => update("floor", event.target.value)} />
          </Field>
          <Field label="Room Type" required>
            <select className={fieldClass} value={form.roomType} onChange={(event) => update("roomType", event.target.value)}>
              {["AC", "Non AC"].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Sharing Type" required>
            <select className={fieldClass} value={form.sharingType} onChange={(event) => update("sharingType", event.target.value)}>
              {["1 Sharing", "2 Sharing", "3 Sharing", "4 Sharing"].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Monthly Rent" required error={errors.monthlyRent}>
            <input type="number" min="1" className={fieldClass} value={form.monthlyRent} onChange={(event) => update("monthlyRent", event.target.value)} />
          </Field>
          <Field label="Security Deposit" required>
            <input type="number" min="0" className={fieldClass} value={form.securityDeposit} onChange={(event) => update("securityDeposit", event.target.value)} />
          </Field>
          <Field label="Room Size (sq.ft)">
            <input className={fieldClass} value={form.size} onChange={(event) => update("size", event.target.value)} />
          </Field>
          <Field label="Status">
            <select className={fieldClass} value={form.status} onChange={(event) => update("status", event.target.value)}>
              {["Available", "Occupied", "Maintenance"].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Room Images">
            <div className="space-y-3">
              <input type="file" accept="image/*" multiple className={fieldClass} onChange={handleImagesUpload} />
              <div className="grid grid-cols-2 gap-3">
                {ROOM_IMAGE_LABELS.map((label, index) => (
                  <div key={label}>
                    <BranchImage src={form.images?.[index]?.image} alt={label} className="h-24 w-full rounded-lg object-cover" fallbackClassName="h-24 w-full rounded-lg" />
                    <p className="mt-1 text-xs font-bold uppercase text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Field>
          <Field label="Description">
            <textarea className={`${fieldClass} min-h-28 py-3`} value={form.description} onChange={(event) => update("description", event.target.value)} />
          </Field>
        </div>

        <RoomAmenitiesManager
          amenities={visibleAmenities}
          selectedAmenities={selectedAmenities}
          onToggle={toggleAmenity}
          onRename={renameAmenity}
          onRemove={removeAmenity}
          onAmenitiesChange={onRoomAmenitiesChange}
        />

        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-line pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Room</Button>
        </div>
      </form>
    </div>
  );
};

const RoomViewModal = ({ room, onClose }) => (
  <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/40 px-4 py-8">
    <Card className="w-full max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-ink">Room {room.roomNumber}</h2>
          <p className="text-sm text-slate-500">{room.branchName} · {room.floor}</p>
        </div>
        <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:border-brandDark hover:text-brandDark" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {(room.images || []).map((image) => (
          <div key={image.label}>
            <BranchImage src={image.image} alt={image.label} className="h-36 w-full rounded-2xl object-cover" fallbackClassName="h-36 w-full rounded-2xl" />
            <p className="mt-2 text-xs font-bold uppercase text-slate-500">{image.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Available Beds" value={room.availableBeds} />
        <StatCard label="Occupied Beds" value={room.occupiedBeds} />
        <StatCard label="Rent" value={formatCurrency(room.monthlyRent)} />
        <StatCard label="Deposit" value={formatCurrency(room.securityDeposit)} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-bold text-ink">Room Information</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <p><span className="font-semibold text-ink">Branch:</span> {room.branchName}</p>
            <p><span className="font-semibold text-ink">Floor:</span> {room.floor}</p>
            <p><span className="font-semibold text-ink">Room Type:</span> {room.roomType}</p>
            <p><span className="font-semibold text-ink">Sharing Type:</span> {room.sharingType}</p>
            <p><span className="font-semibold text-ink">Beds:</span> {room.beds}</p>
            <p><span className="font-semibold text-ink">Status:</span> {room.status}</p>
          </div>
          {room.description && <p className="mt-4 text-sm leading-6 text-slate-500">{room.description}</p>}
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-ink">Amenities</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {(room.roomAmenities || room.amenities || []).map((amenity) => (
              <span key={amenity} className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">{amenity}</span>
            ))}
          </div>
        </Card>
      </div>
    </Card>
  </div>
);

const RoomsPage = () => {
  const branches = useMemo(loadBranches, []);
  const { beds: liveBeds } = useLiveAvailability();
  const [rooms, setRooms] = useState(loadRooms);
  const availabilityRooms = useMemo(() => rooms.map((room) => summarizeRoomAvailability(room, liveBeds)), [rooms, liveBeds]);
  const [roomAmenities, setRoomAmenities] = useState(loadRoomAmenities);
  const [modalRoom, setModalRoom] = useState(null);
  const [viewRoom, setViewRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteRoom, setDeleteRoom] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", branch: "All", sharingType: "All", roomType: "All", status: "All" });

  const persistRooms = (nextRooms) => {
    setRooms(nextRooms);
    saveRooms(nextRooms);
  };

  const persistRoomAmenities = (nextAmenities) => {
    setRoomAmenities(nextAmenities);
    saveRoomAmenities(nextAmenities);
  };

  const stats = useMemo(() => ({
    totalRooms: availabilityRooms.length,
    availableRooms: availabilityRooms.filter((room) => room.overallAvailability === "Available").length,
    occupiedRooms: availabilityRooms.filter((room) => room.occupiedBeds > 0).length,
    maintenanceRooms: availabilityRooms.filter((room) => room.maintenanceBeds > 0 && room.availableBeds === 0).length
  }), [availabilityRooms]);

  const filteredRooms = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return availabilityRooms.filter((room) => {
      const matchesSearch = !query || [room.roomNumber, room.branchName].some((value) => value.toLowerCase().includes(query));
      const matchesBranch = filters.branch === "All" || room.branchName === filters.branch;
      const matchesSharing = filters.sharingType === "All" || room.sharingType === filters.sharingType;
      const matchesRoomType = filters.roomType === "All" || room.roomType === filters.roomType;
      const matchesStatus = filters.status === "All" || room.status === filters.status;
      return matchesSearch && matchesBranch && matchesSharing && matchesRoomType && matchesStatus;
    });
  }, [availabilityRooms, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / rowsPerPage));
  const visibleRooms = filteredRooms.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
  };

  const saveRoom = (room) => {
    const nextRooms = rooms.some((item) => item.id === room.id)
      ? rooms.map((item) => (item.id === room.id ? room : item))
      : [room, ...rooms];
    persistRooms(nextRooms);
    setShowModal(false);
  };

  const resetFilters = () => {
    setFilters({ search: "", branch: "All", sharingType: "All", roomType: "All", status: "All" });
    setPage(1);
  };

  const confirmDelete = () => {
    persistRooms(rooms.filter((room) => room.id !== deleteRoom.id));
    setDeleteRoom(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Rooms</h1>
          <p className="text-sm text-slate-500">Manage all rooms across every PG branch.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => { setModalRoom(null); setShowModal(true); }}><Plus className="h-4 w-4" /> Add Room</Button>
          <Button variant="secondary" onClick={() => window.print()}><Download className="h-4 w-4" /> Export</Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Rooms" value={stats.totalRooms} />
        <StatCard label="Available Rooms" value={stats.availableRooms} />
        <StatCard label="Occupied Rooms" value={stats.occupiedRooms} />
        <StatCard label="Maintenance Rooms" value={stats.maintenanceRooms} />
      </div>

      <Card className="mt-5">
        <div className="grid gap-3 xl:grid-cols-[1.2fr_repeat(4,1fr)_auto]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input className={`${fieldClass} pl-11`} placeholder="Search by room number, branch name" value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} />
          </label>
          {[
            ["Branch", "branch", ["All", ...AREAS]],
            ["Sharing Type", "sharingType", ["All", "1 Sharing", "2 Sharing", "3 Sharing", "4 Sharing"]],
            ["Room Type", "roomType", ["All", "AC", "Non AC"]],
            ["Status", "status", ["All", "Available", "Occupied", "Maintenance"]]
          ].map(([label, field, options]) => (
            <select key={field} aria-label={label} className={fieldClass} value={filters[field]} onChange={(event) => updateFilter(field, event.target.value)}>
              {options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          ))}
          <Button type="button" variant="secondary" onClick={resetFilters}>Reset Filters</Button>
        </div>
      </Card>

      <Card className="mt-5 overflow-x-auto p-0">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-slate-500">
            <tr>
              {["Room Number", "Branch", "Floor", "Sharing Type", "Room Type", "Monthly Rent", "Total Beds", "Available Beds", "Occupied Beds", "Reserved Beds", "Maintenance Beds", "Overall Availability", "Actions"].map((heading) => (
                <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRooms.map((room) => (
              <tr key={room.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-bold text-ink">{room.roomNumber}</td>
                <td className="px-4 py-3 text-slate-600">{room.branchName}</td>
                <td className="px-4 py-3 text-slate-600">{room.floor}</td>
                <td className="px-4 py-3 text-slate-600">{room.sharingType}</td>
                <td className="px-4 py-3 text-slate-600">{room.roomType}</td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(room.monthlyRent)}</td>
                <td className="px-4 py-3 font-semibold">{room.totalBeds}</td>
                <td className="px-4 py-3 font-semibold text-success">{room.availableBeds}</td>
                <td className="px-4 py-3 font-semibold">{room.occupiedBeds}</td>
                <td className="px-4 py-3 font-semibold">{room.reservedBeds}</td>
                <td className="px-4 py-3 font-semibold">{room.maintenanceBeds}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${room.overallAvailability === "Available" ? "bg-brand/10 text-brandDark" : "bg-slate-100 text-slate-600"}`}>{room.overallAvailability}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setViewRoom(room)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="View room">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => { setModalRoom(room); setShowModal(true); }} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="Edit room">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setDeleteRoom(room)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-danger hover:border-danger hover:bg-paper" aria-label="Delete room">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!visibleRooms.length && (
              <tr><td colSpan="13" className="px-4 py-8 text-center text-slate-500">No rooms match the selected filters.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <p>Showing {visibleRooms.length} of {filteredRooms.length} rooms</p>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button>
          <span className="grid min-h-11 place-items-center rounded-xl border border-line px-4 font-semibold text-ink">{page} / {totalPages}</span>
          <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</Button>
        </div>
      </div>

      {showModal && (
        <RoomModal
          room={modalRoom}
          rooms={rooms}
          branches={branches}
          roomAmenities={roomAmenities}
          onRoomAmenitiesChange={persistRoomAmenities}
          onClose={() => setShowModal(false)}
          onSave={saveRoom}
        />
      )}
      {viewRoom && <RoomViewModal room={viewRoom} onClose={() => setViewRoom(null)} />}

      {deleteRoom && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4">
          <Card className="w-full max-w-md">
            <h2 className="text-xl font-bold text-ink">Delete this room?</h2>
            <p className="mt-2 text-sm text-slate-600">This action cannot be undone.</p>
            <p className="mt-4 rounded-xl bg-paper p-3 text-sm font-semibold text-ink">{deleteRoom.branchName} · Room {deleteRoom.roomNumber}</p>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeleteRoom(null)}>Cancel</Button>
              <Button variant="danger" onClick={confirmDelete}>Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
