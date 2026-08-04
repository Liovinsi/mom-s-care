import { Download, Eye, Pencil, Printer, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import BranchImage from "../../components/admin/BranchImage";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import { AREAS } from "../../data/adminBranches";
import { loadBeds, saveBeds } from "../../data/adminBeds";
import { loadBookings, saveBookings } from "../../data/adminBookings";
import { RESIDENT_GENDERS, RESIDENT_STATUSES, loadResidents, saveResidents } from "../../data/adminResidents";
import { loadRooms } from "../../data/adminRooms";
import { saveAvailabilitySnapshot } from "../../lib/liveAvailability";
import { digitsOnly, mobileInputProps, MOBILE_NUMBER_ERROR, MOBILE_NUMBER_REGEX } from "../../lib/mobileNumber";

const rowsPerPage = 10;
const fieldClass = "min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/25";

const statusStyles = {
  "Pending Check-In": "bg-brand/10 text-brandDark",
  Active: "bg-brand/10 text-brandDark",
  Vacating: "bg-paper text-brandDark",
  "Checked Out": "bg-slate-100 text-slate-600"
};

const StatusBadge = ({ status }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[status] || statusStyles["Checked Out"]}`}>{status}</span>
);

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const DetailGrid = ({ items }) => (
  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
    {items.map(([label, value]) => (
      <p key={label}><span className="font-semibold text-ink">{label}:</span> {value || "-"}</p>
    ))}
  </div>
);

const Field = ({ label, error, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
    {children}
    {error && <span className="mt-1 block text-xs font-semibold text-danger">{error}</span>}
  </label>
);

const DocumentPreview = ({ label, src }) => (
  <div>
    <BranchImage src={src} alt={label} className="h-40 w-full rounded-2xl border border-line object-cover" fallbackClassName="h-40 w-full rounded-2xl" />
    <div className="mt-2 flex items-center justify-between gap-2">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <a href={src} download className="text-xs font-bold text-brand hover:underline">Download</a>
    </div>
  </div>
);

const qrDataUrl = (resident) => {
  const seed = `${resident.id}${resident.fullName}${resident.phone}`;
  const cells = Array.from({ length: 49 }, (_, index) => (seed.charCodeAt(index % seed.length) + index) % 3 === 0);
  const squares = cells.map((filled, index) => {
    if (!filled) return "";
    const x = (index % 7) * 10;
    const y = Math.floor(index / 7) * 10;
    return `<rect x="${x}" y="${y}" width="8" height="8" fill="#1F2937"/>`;
  }).join("");
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 70 70"><rect width="70" height="70" fill="#fff"/>${squares}</svg>`)}`;
};

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

const ResidentViewModal = ({ resident, onClose }) => (
  <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/40 px-4 py-8">
    <Card className="w-full max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <BranchImage src={resident.photo} alt={resident.fullName} className="h-20 w-20 rounded-2xl object-cover" fallbackClassName="h-20 w-20 rounded-2xl" />
          <div>
            <h2 className="text-2xl font-bold text-ink">{resident.fullName}</h2>
            <p className="text-sm text-slate-500">{resident.id} · {resident.branchName} · Room {resident.roomNumber}</p>
            <div className="mt-2"><StatusBadge status={resident.status} /></div>
          </div>
        </div>
        <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:border-brandDark hover:text-brandDark" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-bold text-ink">Personal Details</h3>
          <DetailGrid items={[
            ["Resident ID", resident.id],
            ["Full Name", resident.fullName],
            ["Gender", resident.gender],
            ["DOB", formatDate(resident.dob)],
            ["Blood Group", resident.bloodGroup],
            ["Phone", resident.phone],
            ["Email", resident.email]
          ]} />
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-ink">Emergency Contact</h3>
          <DetailGrid items={[
            ["Parent / Guardian Name", resident.parentName],
            ["Relationship", resident.relationship],
            ["Phone Number", resident.emergencyPhone],
            ["Address", resident.emergencyAddress]
          ]} />
        </Card>
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-ink">Identity</h3>
            <a href={resident.aadhaarFront} download className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-brandDark hover:text-brandDark">
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
          <h3 className="text-lg font-bold text-ink">Accommodation</h3>
          <DetailGrid items={[
            ["Branch", resident.branchName],
            ["Room", `Room ${resident.roomNumber}`],
            ["Bed", resident.bedName],
            ["Sharing Type", resident.sharingType],
            ["Room Type", resident.roomType],
            ["Move-In Date", formatDate(resident.moveInDate)],
            ["Expected Vacate Date", formatDate(resident.expectedVacateDate)]
          ]} />
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-ink">Financial</h3>
          <DetailGrid items={[
            ["Monthly Rent", formatCurrency(resident.monthlyRent)],
            ["Security Deposit", formatCurrency(resident.securityDeposit)],
            ["Token Paid", formatCurrency(resident.tokenPaid)],
            ["Pending Amount", formatCurrency(resident.pendingAmount)],
            ["Last Payment Date", formatDate(resident.lastPaymentDate)]
          ]} />
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-ink">Booking Information</h3>
          <DetailGrid items={[
            ["Booking ID", resident.bookingId],
            ["Booking Date", formatDate(resident.bookingDate)],
            ["Assigned Warden", resident.assignedWarden]
          ]} />
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-bold text-ink">Medical Information</h3>
          <DetailGrid items={[
            ["Allergies", resident.allergies],
            ["Medical Notes", resident.medicalNotes],
            ["Emergency Notes", resident.emergencyNotes]
          ]} />
        </Card>
      </div>
    </Card>
  </div>
);

const ResidentEditModal = ({ resident, onClose, onSave }) => {
  const [form, setForm] = useState(resident);
  const [errors, setErrors] = useState({});
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const nextErrors = {};
          if (!MOBILE_NUMBER_REGEX.test(form.phone)) nextErrors.phone = MOBILE_NUMBER_ERROR;
          if (!MOBILE_NUMBER_REGEX.test(form.emergencyPhone)) nextErrors.emergencyPhone = MOBILE_NUMBER_ERROR;
          setErrors(nextErrors);
          if (Object.keys(nextErrors).length) return;
          onSave(form);
        }}
        className="h-full w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-luxury"
      >
        <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-5 flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <div>
            <h2 className="text-xl font-bold text-ink">Edit Resident</h2>
            <p className="text-sm text-slate-500">{resident.fullName} · {resident.id}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:border-brandDark hover:text-brandDark" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Phone" error={errors.phone}>
            <input className={fieldClass} {...mobileInputProps} value={form.phone} onChange={(event) => update("phone", digitsOnly(event.target.value))} />
          </Field>
          <Field label="Email">
            <input type="email" className={fieldClass} value={form.email} onChange={(event) => update("email", event.target.value)} />
          </Field>
          <Field label="Expected Vacate Date">
            <input type="date" className={fieldClass} value={form.expectedVacateDate} onChange={(event) => update("expectedVacateDate", event.target.value)} />
          </Field>
          <Field label="Parent / Guardian Name">
            <input className={fieldClass} value={form.parentName} onChange={(event) => update("parentName", event.target.value)} />
          </Field>
          <Field label="Relationship">
            <input className={fieldClass} value={form.relationship} onChange={(event) => update("relationship", event.target.value)} />
          </Field>
          <Field label="Emergency Phone" error={errors.emergencyPhone}>
            <input className={fieldClass} {...mobileInputProps} value={form.emergencyPhone} onChange={(event) => update("emergencyPhone", digitsOnly(event.target.value))} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Emergency Address">
              <textarea className={`${fieldClass} min-h-24 py-3`} value={form.emergencyAddress} onChange={(event) => update("emergencyAddress", event.target.value)} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Medical Notes">
              <textarea className={`${fieldClass} min-h-24 py-3`} value={form.medicalNotes} onChange={(event) => update("medicalNotes", event.target.value)} />
            </Field>
          </div>
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
      <h2 className="text-xl font-bold text-ink">Check-Out Resident?</h2>
      <p className="mt-2 text-sm text-slate-600">This action will mark resident as Checked Out, release the assigned bed, update bed status to Available, and close the active stay.</p>
      <p className="mt-4 rounded-xl bg-paper p-3 text-sm font-semibold text-ink">{resident.fullName} · {resident.branchName} · Room {resident.roomNumber} · {resident.bedName}</p>
      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="button" variant="danger" onClick={() => onConfirm(resident)}>Confirm Check-Out</Button>
      </div>
    </Card>
  </div>
);

const printIdCard = (resident) => {
  const card = window.open("", "_blank", "width=520,height=720");
  if (!card) return;
  card.document.write(`
    <html>
      <head>
        <title>Resident ID Card ${resident.id}</title>
        <style>
          body { font-family: Arial, sans-serif; background: #FFF4F6; color: #1F2937; padding: 28px; }
          .card { width: 360px; margin: 0 auto; border: 1px solid #E5E5E5; border-radius: 18px; background: #fff; padding: 22px; box-shadow: 0 18px 45px rgba(30,30,36,.12); }
          .brand { color: #DD5E67; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; font-size: 12px; }
          .photo { width: 92px; height: 92px; border-radius: 18px; object-fit: cover; border: 3px solid #DD5E67; }
          h1 { font-size: 22px; margin: 14px 0 4px; }
          p { margin: 8px 0; font-size: 14px; }
          .qr { width: 86px; height: 86px; border: 1px solid #E5E5E5; padding: 8px; border-radius: 12px; }
          .row { display: flex; justify-content: space-between; gap: 16px; align-items: end; margin-top: 18px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="brand">PGStay Resident ID</div>
          <img class="photo" src="${resident.photo}" alt="${resident.fullName}" />
          <h1>${resident.fullName}</h1>
          <p><strong>Resident ID:</strong> ${resident.id}</p>
          <p><strong>Branch:</strong> ${resident.branchName}</p>
          <p><strong>Room:</strong> ${resident.roomNumber}</p>
          <p><strong>Bed:</strong> ${resident.bedName}</p>
          <p><strong>Emergency:</strong> ${resident.emergencyPhone}</p>
          <div class="row">
            <p><strong>Status:</strong><br/>${resident.status}</p>
            <img class="qr" src="${qrDataUrl(resident)}" alt="QR Code" />
          </div>
        </div>
      </body>
    </html>
  `);
  card.document.close();
  card.focus();
  card.print();
};

const ResidentsPage = () => {
  const rooms = useMemo(loadRooms, []);
  const [residents, setResidents] = useState(loadResidents);
  const [beds, setBeds] = useState(loadBeds);
  const [bookings, setBookings] = useState(loadBookings);
  const [viewResident, setViewResident] = useState(null);
  const [editResident, setEditResident] = useState(null);
  const [checkOutResident, setCheckOutResident] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", branch: "All", roomId: "All", bedId: "All", gender: "All", status: "All" });

  useEffect(() => {
    const syncedBeds = syncBedsWithResidents(loadBeds(), residents);
    setBeds(syncedBeds);
    saveBeds(syncedBeds);
  }, [residents]);

  const roomOptions = useMemo(() => (
    filters.branch === "All" ? rooms : rooms.filter((room) => room.branchName === filters.branch)
  ), [rooms, filters.branch]);

  const bedOptions = useMemo(() => {
    if (filters.roomId !== "All") return beds.filter((bed) => bed.roomId === filters.roomId);
    if (filters.branch !== "All") return beds.filter((bed) => bed.branchName === filters.branch);
    return beds;
  }, [beds, filters.branch, filters.roomId]);

  const stats = useMemo(() => ({
    totalResidents: residents.length,
    activeResidents: residents.filter((resident) => resident.status === "Active").length,
    vacatingSoon: residents.filter((resident) => resident.status === "Vacating").length,
    checkedOut: residents.filter((resident) => resident.status === "Checked Out").length,
    pendingCheckIn: residents.filter((resident) => resident.status === "Pending Check-In").length
  }), [residents]);

  const filteredResidents = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return residents.filter((resident) => {
      const matchesSearch = !query || [resident.fullName, resident.id, resident.phone, resident.aadhaarNumber].some((value) => value.toLowerCase().includes(query));
      const matchesBranch = filters.branch === "All" || resident.branchName === filters.branch;
      const matchesRoom = filters.roomId === "All" || resident.roomId === filters.roomId;
      const matchesBed = filters.bedId === "All" || resident.bedId === filters.bedId;
      const matchesGender = filters.gender === "All" || resident.gender === filters.gender;
      const matchesStatus = filters.status === "All" || resident.status === filters.status;
      return matchesSearch && matchesBranch && matchesRoom && matchesBed && matchesGender && matchesStatus;
    });
  }, [residents, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredResidents.length / rowsPerPage));
  const visibleResidents = filteredResidents.slice((page - 1) * rowsPerPage, page * rowsPerPage);

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

  const updateFilter = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
      ...(field === "branch" ? { roomId: "All", bedId: "All" } : {}),
      ...(field === "roomId" ? { bedId: "All" } : {})
    }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ search: "", branch: "All", roomId: "All", bedId: "All", gender: "All", status: "All" });
    setPage(1);
  };

  const saveResident = (resident) => {
    persistResidents(residents.map((item) => (item.id === resident.id ? resident : item)));
    setEditResident(null);
  };

  const confirmCheckOut = (resident) => {
    const nextResident = { ...resident, status: "Checked Out", pendingAmount: 0 };
    persistResidents(residents.map((item) => (item.id === resident.id ? nextResident : item)));
    persistBeds(beds.map((bed) => (
      bed.id === resident.bedId
        ? { ...bed, status: "Available", currentResident: "", bookingId: "", checkInDate: "", checkOutDate: "" }
        : bed
    )));
    persistBookings(bookings.map((booking) => (
      booking.id === resident.bookingId ? { ...booking, bookingStatus: "Completed" } : booking
    )));
    setCheckOutResident(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Residents</h1>
          <p className="text-sm text-slate-500">Manage all residents staying across every PG branch.</p>
        </div>
        <Button variant="secondary" onClick={() => window.print()}><Download className="h-4 w-4" /> Export Residents</Button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Residents" value={stats.totalResidents} />
        <StatCard label="Active Residents" value={stats.activeResidents} />
        <StatCard label="Vacating Soon" value={stats.vacatingSoon} />
        <StatCard label="Checked Out" value={stats.checkedOut} />
        <StatCard label="Pending Check-In" value={stats.pendingCheckIn} />
      </div>

      <Card className="mt-5">
        <div className="grid gap-3 xl:grid-cols-[1.2fr_repeat(5,1fr)_auto]">
          <label className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input className={`${fieldClass} pl-11`} placeholder="Search by resident name, ID, phone, Aadhaar" value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} />
          </label>
          <select aria-label="Branch" className={fieldClass} value={filters.branch} onChange={(event) => updateFilter("branch", event.target.value)}>
            {["All", ...AREAS].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select aria-label="Room" className={fieldClass} value={filters.roomId} onChange={(event) => updateFilter("roomId", event.target.value)}>
            <option value="All">All Rooms</option>
            {roomOptions.map((room) => <option key={room.id} value={room.id}>Room {room.roomNumber}</option>)}
          </select>
          <select aria-label="Bed" className={fieldClass} value={filters.bedId} onChange={(event) => updateFilter("bedId", event.target.value)}>
            <option value="All">All Beds</option>
            {bedOptions.map((bed) => <option key={bed.id} value={bed.id}>{bed.bedName}</option>)}
          </select>
          <select aria-label="Gender" className={fieldClass} value={filters.gender} onChange={(event) => updateFilter("gender", event.target.value)}>
            {["All", ...RESIDENT_GENDERS].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select aria-label="Status" className={fieldClass} value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
            {["All", ...RESIDENT_STATUSES].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <Button type="button" variant="secondary" onClick={resetFilters}>Reset Filters</Button>
        </div>
      </Card>

      <Card className="mt-5 overflow-x-auto p-0">
        <table className="w-full min-w-[1220px] text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-slate-500">
            <tr>
              {["Photo", "Resident ID", "Name", "Branch", "Room", "Bed", "Phone", "Move-In Date", "Rent", "Status", "Actions"].map((heading) => (
                <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleResidents.map((resident) => (
              <tr key={resident.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <BranchImage src={resident.photo} alt={resident.fullName} className="h-14 w-14 rounded-xl object-cover" fallbackClassName="h-14 w-14 rounded-xl" />
                </td>
                <td className="px-4 py-3 font-bold text-ink">{resident.id}</td>
                <td className="px-4 py-3 font-semibold text-ink">{resident.fullName}</td>
                <td className="px-4 py-3 text-slate-600">{resident.branchName}</td>
                <td className="px-4 py-3 text-slate-600">Room {resident.roomNumber}</td>
                <td className="px-4 py-3 text-slate-600">{resident.bedName}</td>
                <td className="px-4 py-3 text-slate-600">{resident.phone}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(resident.moveInDate)}</td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(resident.monthlyRent)}</td>
                <td className="px-4 py-3"><StatusBadge status={resident.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setViewResident(resident)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="View resident">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setEditResident(resident)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="Edit resident">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setCheckOutResident(resident)} disabled={resident.status === "Checked Out"} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-danger hover:border-danger hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40" aria-label="Check-out resident">
                      <X className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => printIdCard(resident)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="Print resident ID card">
                      <Printer className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!visibleResidents.length && (
              <tr><td colSpan="11" className="px-4 py-8 text-center text-slate-500">No residents match the selected filters.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <p>Showing {visibleResidents.length} of {filteredResidents.length} residents</p>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button>
          <span className="grid min-h-11 place-items-center rounded-xl border border-line px-4 font-semibold text-ink">{page} / {totalPages}</span>
          <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</Button>
        </div>
      </div>

      {viewResident && <ResidentViewModal resident={viewResident} onClose={() => setViewResident(null)} />}
      {editResident && <ResidentEditModal resident={editResident} onClose={() => setEditResident(null)} onSave={saveResident} />}
      {checkOutResident && <CheckOutDialog resident={checkOutResident} onClose={() => setCheckOutResident(null)} onConfirm={confirmCheckOut} />}
    </div>
  );
};

export default ResidentsPage;
