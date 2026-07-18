import { Check, Download, Eye, LogOut, Pencil, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BranchImage from "../../components/admin/BranchImage";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import { useAuth } from "../../context/AuthContext";
import { loadBeds, saveBeds } from "../../data/adminBeds";
import { loadBookings, saveBookings } from "../../data/adminBookings";
import { RESIDENT_STATUSES, loadResidents, saveResidents } from "../../data/adminResidents";
import { loadRooms } from "../../data/adminRooms";
import { loadWardens } from "../../data/adminWardens";
import { saveAvailabilitySnapshot, useLiveAvailability } from "../../lib/liveAvailability";

const today = "2026-07-18";
const rowsPerPage = 8;
const sharingTypes = ["1 Sharing", "2 Sharing", "3 Sharing", "4 Sharing"];
const fieldClass = "min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15";

const wardenBranchByUser = {
  "dummy-warden": "Anna Nagar"
};

const statusStyles = {
  "Pending Check-In": "bg-amber-50 text-amber-700",
  Active: "bg-emerald-50 text-emerald-700",
  Vacating: "bg-orange-50 text-orange-700",
  "Checked Out": "bg-slate-100 text-slate-600"
};

const bookingStatusStyles = {
  Pending: "bg-amber-50 text-amber-700",
  Approved: "bg-emerald-50 text-emerald-700",
  "Assigned to Warden": "bg-purple-50 text-purple-700",
  "Checked-In": "bg-blue-50 text-blue-700",
  "Checked In": "bg-blue-50 text-blue-700",
  Completed: "bg-slate-100 text-slate-600",
  Rejected: "bg-red-50 text-red-700",
  Cancelled: "bg-slate-100 text-slate-600"
};

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const statusText = (status) => (status === "Checked In" ? "Checked-In" : status);

const StatusBadge = ({ status, type = "resident" }) => {
  const styles = type === "booking" ? bookingStatusStyles : statusStyles;
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles[status] || "bg-slate-100 text-slate-700"}`}>{statusText(status)}</span>;
};

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
    {children}
  </label>
);

const DetailGrid = ({ items }) => (
  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
    {items.map(([label, value]) => (
      <p key={label}><span className="font-semibold text-ink">{label}:</span> {value || "-"}</p>
    ))}
  </div>
);

const DocumentPreview = ({ label, src }) => (
  <div>
    <BranchImage src={src} alt={label} className="h-40 w-full rounded-2xl border border-line object-cover" fallbackClassName="h-40 w-full rounded-2xl" />
    <div className="mt-2 flex items-center justify-between gap-2">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <a href={src} download className="text-xs font-bold text-gold hover:underline">Download</a>
    </div>
  </div>
);

const getAssignedBranch = (user, wardens) => {
  const assignedWarden = wardens.find((warden) => (
    warden.employeeId === user?.employeeId ||
    warden.email === user?.email ||
    `${warden.firstName} ${warden.lastName}` === user?.name
  ));

  return {
    id: user?.branchId || assignedWarden?.branchId || "anna-nagar",
    name: user?.branchName || wardenBranchByUser[user?.id] || assignedWarden?.branchName || "Anna Nagar"
  };
};

const isAssignedBranchRecord = (record, assignedBranch) =>
  record.branchId ? record.branchId === assignedBranch.id : record.branchName === assignedBranch.name;

const syncBedsWithResidents = (beds, residents) =>
  beds.map((bed) => {
    const resident = residents.find((item) => item.bedId === bed.id && item.status !== "Checked Out");
    if (!resident) return bed;

    return {
      ...bed,
      status: resident.status === "Pending Check-In" ? "Reserved" : "Occupied",
      currentResident: resident.status === "Pending Check-In" ? "" : resident.fullName,
      bookingId: resident.bookingId,
      checkInDate: resident.moveInDate,
      checkOutDate: resident.expectedVacateDate
    };
  });

const ResidentViewModal = ({ resident, booking, onClose }) => (
  <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/40 px-4 py-8">
    <Card className="w-full max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <BranchImage src={resident.photo} alt={resident.fullName} className="h-20 w-20 rounded-2xl object-cover" fallbackClassName="h-20 w-20 rounded-2xl" />
          <div>
            <h2 className="text-2xl font-bold text-ink">{resident.fullName}</h2>
            <p className="text-sm text-slate-500">{resident.id} · {resident.branchName} · Room {resident.roomNumber} · {resident.bedName}</p>
            <div className="mt-2"><StatusBadge status={resident.status} /></div>
          </div>
        </div>
        <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:border-gold hover:text-gold" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-bold text-ink">Personal Information</h3>
          <DetailGrid items={[
            ["Resident Photo", "Uploaded"],
            ["Resident ID", resident.id],
            ["Full Name", resident.fullName],
            ["Gender", resident.gender],
            ["Date of Birth", formatDate(resident.dob)],
            ["Phone Number", resident.phone],
            ["Email", resident.email],
            ["Emergency Contact", `${resident.parentName || "-"} · ${resident.emergencyPhone || "-"}`]
          ]} />
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-ink">Accommodation</h3>
          <DetailGrid items={[
            ["Branch", resident.branchName],
            ["Room Number", resident.roomNumber],
            ["Bed Number", resident.bedName],
            ["Sharing Type", resident.sharingType],
            ["Room Type", resident.roomType],
            ["Move-In Date", formatDate(resident.moveInDate)],
            ["Expected Check-Out Date", formatDate(resident.expectedVacateDate)]
          ]} />
        </Card>
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-ink">Documents</h3>
            <a href={resident.aadhaarFront} download className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-gold hover:text-gold">
              <Download className="h-4 w-4" /> Download Documents
            </a>
          </div>
          <p className="mt-4 text-sm text-slate-600"><span className="font-semibold text-ink">Aadhaar Number:</span> {resident.aadhaarNumber}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <DocumentPreview label="Aadhaar Front" src={resident.aadhaarFront} />
            <DocumentPreview label="Aadhaar Back" src={resident.aadhaarBack} />
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-ink">Payment Summary</h3>
          <DetailGrid items={[
            ["Booking Token", formatCurrency(resident.tokenPaid)],
            ["Security Deposit", formatCurrency(resident.securityDeposit)],
            ["Current Month Rent", formatCurrency(resident.monthlyRent)],
            ["Pending Amount", formatCurrency(resident.pendingAmount)],
            ["Last Payment Date", formatDate(resident.lastPaymentDate)]
          ]} />
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-bold text-ink">Booking Information</h3>
          <DetailGrid items={[
            ["Booking ID", resident.bookingId],
            ["Booking Date", formatDate(resident.bookingDate)],
            ["Booking Status", booking ? statusText(booking.bookingStatus) : "-"]
          ]} />
        </Card>
      </div>
    </Card>
  </div>
);

const ResidentEditModal = ({ resident, onClose, onSave }) => {
  const [form, setForm] = useState({
    phone: resident.phone || "",
    email: resident.email || "",
    emergencyPhone: resident.emergencyPhone || "",
    expectedVacateDate: resident.expectedVacateDate || "",
    remarks: resident.remarks || ""
  });

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave({ ...resident, ...form });
        }}
        className="h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-luxury"
      >
        <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-5 flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <div>
            <h2 className="text-xl font-bold text-ink">Edit Resident</h2>
            <p className="text-sm text-slate-500">{resident.fullName} · {resident.id}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:border-gold hover:text-gold" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-4">
          <Field label="Phone Number">
            <input className={fieldClass} value={form.phone} onChange={(event) => update("phone", event.target.value)} />
          </Field>
          <Field label="Email">
            <input type="email" className={fieldClass} value={form.email} onChange={(event) => update("email", event.target.value)} />
          </Field>
          <Field label="Emergency Contact">
            <input className={fieldClass} value={form.emergencyPhone} onChange={(event) => update("emergencyPhone", event.target.value)} />
          </Field>
          <Field label="Expected Check-Out Date">
            <input type="date" className={fieldClass} value={form.expectedVacateDate} onChange={(event) => update("expectedVacateDate", event.target.value)} />
          </Field>
          <Field label="Remarks">
            <textarea className={`${fieldClass} min-h-28 py-3`} value={form.remarks} onChange={(event) => update("remarks", event.target.value)} />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-line pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Resident</Button>
        </div>
      </form>
    </div>
  );
};

const CheckOutDialog = ({ resident, onClose, onConfirm }) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4">
    <Card className="w-full max-w-md">
      <h2 className="text-xl font-bold text-ink">Check-Out Resident</h2>
      <p className="mt-2 text-sm text-slate-600">Are you sure you want to check out this resident?</p>
      <p className="mt-4 rounded-xl bg-paper p-3 text-sm font-semibold text-ink">{resident.fullName} · Room {resident.roomNumber} · {resident.bedName}</p>
      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="button" variant="danger" onClick={() => onConfirm(resident)}>Check-Out</Button>
      </div>
    </Card>
  </div>
);

const WardenResidentsPage = () => {
  const { user } = useAuth();
  const rooms = useMemo(loadRooms, []);
  const wardens = useMemo(loadWardens, []);
  const { beds: liveBeds } = useLiveAvailability();
  const assignedBranch = useMemo(() => getAssignedBranch(user, wardens), [user, wardens]);
  const [residents, setResidents] = useState(loadResidents);
  const [beds, setBeds] = useState(loadBeds);
  const [bookings, setBookings] = useState(loadBookings);
  const [viewResident, setViewResident] = useState(null);
  const [editResident, setEditResident] = useState(null);
  const [checkOutResident, setCheckOutResident] = useState(null);
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", roomId: "All", status: "All", sharingType: "All" });

  const branchResidents = useMemo(() => (
    residents.filter((resident) => isAssignedBranchRecord(resident, assignedBranch))
  ), [residents, assignedBranch]);

  const branchBeds = useMemo(() => (
    beds.filter((bed) => isAssignedBranchRecord(bed, assignedBranch))
  ), [beds, assignedBranch]);

  const branchBookings = useMemo(() => (
    bookings.filter((booking) => isAssignedBranchRecord(booking, assignedBranch))
  ), [bookings, assignedBranch]);

  const branchRooms = useMemo(() => (
    rooms.filter((room) => isAssignedBranchRecord(room, assignedBranch))
  ), [rooms, assignedBranch]);

  useEffect(() => {
    const syncedBeds = syncBedsWithResidents(loadBeds(), loadResidents());
    setBeds(syncedBeds);
    saveBeds(syncedBeds);
  }, []);

  useEffect(() => {
    setBeds(liveBeds);
  }, [liveBeds]);

  const stats = useMemo(() => ({
    totalResidents: branchResidents.length,
    activeResidents: branchResidents.filter((resident) => resident.status === "Active").length,
    pendingCheckIn: branchResidents.filter((resident) => resident.status === "Pending Check-In").length,
    vacatingSoon: branchResidents.filter((resident) => resident.status === "Vacating").length,
    checkedOutToday: branchResidents.filter((resident) => resident.status === "Checked Out" && resident.checkedOutDate === today).length,
    availableBeds: branchBeds.filter((bed) => bed.status === "Available").length
  }), [branchResidents, branchBeds]);

  const filteredResidents = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return branchResidents.filter((resident) => {
      const matchesSearch = !query || [
        resident.fullName,
        resident.id,
        resident.phone,
        resident.roomNumber,
        resident.bedName
      ].some((value) => String(value || "").toLowerCase().includes(query));
      const matchesRoom = filters.roomId === "All" || resident.roomId === filters.roomId;
      const matchesStatus = filters.status === "All" || resident.status === filters.status;
      const matchesSharingType = filters.sharingType === "All" || resident.sharingType === filters.sharingType;
      return matchesSearch && matchesRoom && matchesStatus && matchesSharingType;
    });
  }, [branchResidents, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredResidents.length / rowsPerPage));
  const visibleResidents = filteredResidents.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ search: "", roomId: "All", status: "All", sharingType: "All" });
    setPage(1);
  };

  const bookingFor = (resident) => branchBookings.find((booking) => booking.id === resident.bookingId);
  const bedFor = (resident) => branchBeds.find((bed) => bed.id === resident.bedId);

  const persistResidents = (nextResidents) => {
    setResidents(nextResidents);
    saveResidents(nextResidents);
  };

  const persistBeds = (nextBeds) => {
    setBeds(nextBeds);
    saveAvailabilitySnapshot(nextBeds, rooms);
  };

  const persistBookings = (nextBookings) => {
    setBookings(nextBookings);
    saveBookings(nextBookings);
  };

  const guardBranchAccess = (resident) => isAssignedBranchRecord(resident, assignedBranch);

  const saveResident = (resident) => {
    if (!guardBranchAccess(resident)) return;
    persistResidents(residents.map((item) => (item.id === resident.id ? resident : item)));
    setEditResident(null);
    setNotice(`${resident.fullName} was updated.`);
  };

  const checkInResident = (resident) => {
    if (!guardBranchAccess(resident)) return;

    const booking = bookingFor(resident);
    const bed = bedFor(resident);
    const isAllowed = booking?.bookingStatus === "Approved" && bed?.status === "Reserved";

    if (!isAllowed) {
      setNotice("Check-in is allowed only when booking status is Approved and bed status is Reserved.");
      return;
    }

    persistResidents(residents.map((item) => (
      item.id === resident.id ? { ...item, status: "Active", moveInDate: today } : item
    )));
    persistBeds(beds.map((item) => (
      item.id === resident.bedId
        ? { ...item, status: "Occupied", currentResident: resident.fullName, bookingId: resident.bookingId, checkInDate: today, checkOutDate: resident.expectedVacateDate }
        : item
    )));
    persistBookings(bookings.map((item) => (
      item.id === resident.bookingId ? { ...item, bookingStatus: "Checked-In" } : item
    )));
    setNotice(`${resident.fullName} checked in successfully.`);
  };

  const confirmCheckOut = (resident) => {
    if (!guardBranchAccess(resident)) return;

    persistResidents(residents.map((item) => (
      item.id === resident.id ? { ...item, status: "Checked Out", checkedOutDate: today } : item
    )));
    persistBeds(beds.map((item) => (
      item.id === resident.bedId
        ? { ...item, status: "Available", currentResident: "", bookingId: "", checkInDate: "", checkOutDate: "" }
        : item
    )));
    persistBookings(bookings.map((item) => (
      item.id === resident.bookingId ? { ...item, bookingStatus: "Completed" } : item
    )));
    setCheckOutResident(null);
    setNotice(`${resident.fullName} checked out successfully.`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Residents</h1>
          <p className="text-sm text-slate-500">Manage residents staying in your assigned branch.</p>
        </div>
        <div className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm font-semibold text-gold">
          Assigned Branch: {assignedBranch.name}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Total Residents" value={stats.totalResidents} />
        <StatCard label="Active Residents" value={stats.activeResidents} />
        <StatCard label="Pending Check-In" value={stats.pendingCheckIn} />
        <StatCard label="Vacating Soon" value={stats.vacatingSoon} />
        <StatCard label="Checked-Out Today" value={stats.checkedOutToday} />
        <StatCard label="Available Beds" value={stats.availableBeds} />
      </div>

      {notice && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm font-semibold text-ink">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} className="grid h-8 w-8 place-items-center rounded-lg border border-gold/30 text-gold" aria-label="Dismiss notice">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Card>
        <div className="grid gap-3 xl:grid-cols-[1.4fr_repeat(3,1fr)_auto]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input className={`${fieldClass} pl-11`} placeholder="Search Resident Name, Resident ID, Phone Number, Room Number, Bed Number" value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} />
          </label>
          <select aria-label="Room" className={fieldClass} value={filters.roomId} onChange={(event) => updateFilter("roomId", event.target.value)}>
            <option value="All">All Rooms</option>
            {branchRooms.map((room) => <option key={room.id} value={room.id}>Room {room.roomNumber}</option>)}
          </select>
          <select aria-label="Status" className={fieldClass} value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
            <option value="All">All Statuses</option>
            {RESIDENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <select aria-label="Sharing Type" className={fieldClass} value={filters.sharingType} onChange={(event) => updateFilter("sharingType", event.target.value)}>
            <option value="All">All Sharing Types</option>
            {sharingTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <Button type="button" variant="secondary" onClick={resetFilters}>Reset Filters</Button>
        </div>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-slate-500">
            <tr>
              {["Photo", "Resident ID", "Resident Name", "Room", "Bed", "Phone Number", "Move-In Date", "Rent", "Status", "Actions"].map((heading) => (
                <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleResidents.map((resident) => {
              const booking = bookingFor(resident);
              const bed = bedFor(resident);
              const canCheckIn = booking?.bookingStatus === "Approved" && bed?.status === "Reserved";
              const canCheckOut = ["Active", "Vacating"].includes(resident.status);

              return (
                <tr key={resident.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <BranchImage src={resident.photo} alt={resident.fullName} className="h-14 w-14 rounded-xl object-cover" fallbackClassName="h-14 w-14 rounded-xl" />
                  </td>
                  <td className="px-4 py-3 font-bold text-ink">{resident.id}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{resident.fullName}</td>
                  <td className="px-4 py-3 text-slate-600">Room {resident.roomNumber}</td>
                  <td className="px-4 py-3 text-slate-600">{resident.bedName}</td>
                  <td className="px-4 py-3 text-slate-600">{resident.phone}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(resident.moveInDate)}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{formatCurrency(resident.monthlyRent)}</td>
                  <td className="px-4 py-3"><StatusBadge status={resident.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setViewResident(resident)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-gold hover:text-gold" aria-label="View resident" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => setEditResident(resident)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-gold hover:text-gold" aria-label="Edit resident" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => checkInResident(resident)} disabled={!canCheckIn} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-emerald-700 hover:border-emerald-500 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Check-in resident" title="Check-In">
                        <Check className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => setCheckOutResident(resident)} disabled={!canCheckOut} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-danger hover:border-danger hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Check-out resident" title="Check-Out">
                        <LogOut className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!visibleResidents.length && (
              <tr><td colSpan="10" className="px-4 py-8 text-center text-slate-500">No residents match the selected filters for {assignedBranch.name}.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <p>Showing {visibleResidents.length} of {filteredResidents.length} residents from {assignedBranch.name}</p>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button>
          <span className="grid min-h-11 place-items-center rounded-xl border border-line px-4 font-semibold text-ink">{page} / {totalPages}</span>
          <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</Button>
        </div>
      </div>

      {viewResident && (
        <ResidentViewModal resident={viewResident} booking={bookingFor(viewResident)} onClose={() => setViewResident(null)} />
      )}
      {editResident && <ResidentEditModal resident={editResident} onClose={() => setEditResident(null)} onSave={saveResident} />}
      {checkOutResident && <CheckOutDialog resident={checkOutResident} onClose={() => setCheckOutResident(null)} onConfirm={confirmCheckOut} />}
    </div>
  );
};

export default WardenResidentsPage;
