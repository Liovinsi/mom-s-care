import { Eye, Phone, PhoneCall, ShieldCheck, StickyNote, ThumbsDown, ThumbsUp, X, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import { AREAS } from "../../data/adminBranches";
import { ENQUIRY_REJECTION_REASONS, ENQUIRY_STATUSES, MAX_ENQUIRIES_PER_BED, bedEnquiryBadge, loadEnquiries, saveEnquiries } from "../../data/adminEnquiries";
import { ensureBedRecord, loadBeds } from "../../data/adminBeds";
import { saveAvailabilitySnapshot } from "../../lib/liveAvailability";

const rowsPerPage = 10;
const fieldClass = "min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/25";
const OPEN_STATUSES = ["NEW", "CONTACTED", "INTERESTED", "NOT_INTERESTED"];

const badgeToneClass = {
  assigned: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  enquiries: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  available: "bg-brand/10 text-brandDark dark:bg-brand/15"
};

const badgeToneEmoji = { assigned: "🔴", enquiries: "🟠", available: "🟢" };

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDateTime = (value) => value
  ? new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  : "-";

const bedTypeLabel = (sharingType) => (sharingType === "4 Sharing" ? "Bunk Cot (Upper/Lower)" : "Single Cot");

const DetailGrid = ({ items }) => (
  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
    {items.map(([label, value]) => (
      <p key={label}><span className="font-semibold text-ink">{label}:</span> {value || "-"}</p>
    ))}
  </div>
);

const EnquiryViewModal = ({ enquiry, onClose }) => (
  <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/40 px-4 py-8">
    <Card className="w-full max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-ink">{enquiry.id}</h2>
          <p className="text-sm text-slate-500">{enquiry.userName} · {enquiry.branchName} · Room {enquiry.roomNumber}</p>
        </div>
        <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:border-brandDark hover:text-brandDark" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-bold text-ink">User Details</h3>
          <DetailGrid items={[
            ["Full Name", enquiry.userName],
            ["Phone", enquiry.phone],
            ["Email", enquiry.email],
            ["Occupation", enquiry.occupation],
            ["Company / College", enquiry.organization]
          ]} />
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-ink">Bed Details</h3>
          <DetailGrid items={[
            ["Branch", enquiry.branchName],
            ["Room", `Room ${enquiry.roomNumber}`],
            ["Bed", enquiry.bedName],
            ["Sharing Type", enquiry.sharingType],
            ["Bed Type", bedTypeLabel(enquiry.sharingType)],
            ["Room Type", enquiry.roomType],
            ["Move-in Date", enquiry.moveInDate]
          ]} />
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-bold text-ink">Enquiry Details</h3>
          <DetailGrid items={[
            ["Enquiry Date/Time", formatDateTime(enquiry.createdAt)],
            ["Status", enquiry.status],
            ["Contacted At", formatDateTime(enquiry.contactedAt)],
            ["Confirmed At", formatDateTime(enquiry.approvedAt)],
            ["Rejected At", formatDateTime(enquiry.rejectedAt)],
            ["Token Amount", formatCurrency(enquiry.tokenAmount)],
            ["Payment Status", enquiry.paymentStatus]
          ]} />
          {enquiry.message && <p className="mt-4 rounded-xl bg-paper p-3 text-sm text-slate-600"><span className="font-semibold text-ink">Message:</span> {enquiry.message}</p>}
          {enquiry.adminNotes && <p className="mt-4 rounded-xl bg-paper p-3 text-sm text-slate-600"><span className="font-semibold text-ink">Admin Notes:</span> {enquiry.adminNotes}</p>}
        </Card>
      </div>
    </Card>
  </div>
);

const NotesDialog = ({ enquiry, onClose, onSave }) => {
  const [notes, setNotes] = useState(enquiry.adminNotes || "");
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/40 px-4">
      <Card className="w-full max-w-md">
        <h2 className="text-xl font-bold text-ink">Admin Notes</h2>
        <p className="mt-2 text-sm text-slate-600">{enquiry.userName} · {enquiry.bedName}</p>
        <textarea className={`${fieldClass} mt-4 min-h-28 py-3`} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notes from your call with the user..." />
        <div className="mt-5 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={() => onSave(enquiry, notes)}>Save Notes</Button>
        </div>
      </Card>
    </div>
  );
};

const RejectDialog = ({ enquiry, onClose, onReject }) => {
  const [reason, setReason] = useState(ENQUIRY_REJECTION_REASONS[0]);
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/40 px-4">
      <Card className="w-full max-w-md">
        <h2 className="text-xl font-bold text-ink">Reject Enquiry</h2>
        <p className="mt-2 text-sm text-slate-600">{enquiry.userName} · {enquiry.bedName}. The bed will remain available for other enquiries.</p>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-semibold text-ink">Reason</span>
          <select className={fieldClass} value={reason} onChange={(event) => setReason(event.target.value)}>
            {ENQUIRY_REJECTION_REASONS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <div className="mt-5 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="button" variant="danger" onClick={() => onReject(enquiry, reason)}>Reject Enquiry</Button>
        </div>
      </Card>
    </div>
  );
};

const ApproveDialog = ({ enquiry, competingCount, onClose, onApprove }) => (
  <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/40 px-4">
    <Card className="w-full max-w-lg">
      <h2 className="text-xl font-bold text-ink">Confirm &amp; Assign Bed?</h2>
      <p className="mt-2 text-sm text-slate-600">
        {enquiry.bedName} in Room {enquiry.roomNumber} will move from AVAILABLE to ASSIGNED, and {enquiry.userName} will get access to make a payment.
      </p>
      {competingCount > 0 && (
        <p className="mt-3 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm font-semibold text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-400">
          {competingCount} other open {competingCount === 1 ? "enquiry" : "enquiries"} for this bed will remain in history as Not Selected — none are deleted.
        </p>
      )}
      <p className="mt-4 rounded-xl bg-paper p-3 text-sm font-semibold text-ink">{enquiry.id} · {enquiry.userName} · {enquiry.bedName}</p>
      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="button" onClick={() => onApprove(enquiry)}>Confirm &amp; Assign Bed</Button>
      </div>
    </Card>
  </div>
);

const BedEnquiriesModal = ({ bed, enquiries, onClose, onSelectFilter, onView, onContacted, onInterested, onNotInterested, onNotes, onApprove, onReject }) => (
  <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/40 px-4 py-8">
    <Card className="w-full max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-ink">{bed.bedName} · {bed.branchName} · Room {bed.roomNumber}</h2>
          <p className="text-sm text-slate-500">{enquiries.length} {enquiries.length === 1 ? "user has" : "users have"} enquired for this bed.</p>
        </div>
        <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:border-brandDark hover:text-brandDark" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-5 grid gap-3">
        {enquiries.map((enquiry) => (
          <Card key={enquiry.id} className="hover:translate-y-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-ink">{enquiry.userName}</p>
                <p className="text-xs text-slate-500">{enquiry.phone} · Move-in {enquiry.moveInDate || "-"} · {formatDateTime(enquiry.createdAt)}</p>
              </div>
              <Badge value={enquiry.status} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" title="View Details" onClick={() => onView(enquiry)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="View enquiry details"><Eye className="h-4 w-4" /></button>
              <a href={`tel:${enquiry.phone}`} title="Call User" className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="Call user"><Phone className="h-4 w-4" /></a>
              <button type="button" title="Mark Contacted" onClick={() => onContacted(enquiry)} disabled={enquiry.status !== "NEW"} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark disabled:cursor-not-allowed disabled:opacity-40" aria-label="Mark contacted"><PhoneCall className="h-4 w-4" /></button>
              <button type="button" title="Mark Interested" onClick={() => onInterested(enquiry)} disabled={!OPEN_STATUSES.includes(enquiry.status)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark disabled:cursor-not-allowed disabled:opacity-40" aria-label="Mark interested"><ThumbsUp className="h-4 w-4" /></button>
              <button type="button" title="Mark Not Interested" onClick={() => onNotInterested(enquiry)} disabled={!OPEN_STATUSES.includes(enquiry.status)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark disabled:cursor-not-allowed disabled:opacity-40" aria-label="Mark not interested"><ThumbsDown className="h-4 w-4" /></button>
              <button type="button" title="Admin Notes" onClick={() => onNotes(enquiry)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="Add admin notes"><StickyNote className="h-4 w-4" /></button>
              <button type="button" title="Confirm & Assign Bed" onClick={() => onApprove(enquiry)} disabled={!OPEN_STATUSES.includes(enquiry.status)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark disabled:cursor-not-allowed disabled:opacity-40" aria-label="Confirm and assign bed"><ShieldCheck className="h-4 w-4" /></button>
              <button type="button" title="Reject" onClick={() => onReject(enquiry)} disabled={!OPEN_STATUSES.includes(enquiry.status)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-danger hover:border-danger hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40" aria-label="Reject enquiry"><XCircle className="h-4 w-4" /></button>
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-500">Total Enquiries: {enquiries.length}</p>
      <div className="mt-4 flex justify-end">
        <Button type="button" variant="secondary" onClick={() => { onSelectFilter(bed.bedId); onClose(); }}>View in Full Table</Button>
      </div>
    </Card>
  </div>
);

const EnquiriesPage = () => {
  const [enquiries, setEnquiries] = useState(loadEnquiries);
  const [viewEnquiry, setViewEnquiry] = useState(null);
  const [notesEnquiry, setNotesEnquiry] = useState(null);
  const [approveEnquiry, setApproveEnquiry] = useState(null);
  const [rejectEnquiry, setRejectEnquiry] = useState(null);
  const [bedModal, setBedModal] = useState(null);
  const [workflowError, setWorkflowError] = useState("");
  const [actionToast, setActionToast] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", branch: "All Branches", status: "All", bedId: "" });

  useEffect(() => {
    const refreshEnquiries = () => setEnquiries(loadEnquiries());
    window.addEventListener("pg:enquiries-updated", refreshEnquiries);
    window.addEventListener("storage", refreshEnquiries);
    return () => {
      window.removeEventListener("pg:enquiries-updated", refreshEnquiries);
      window.removeEventListener("storage", refreshEnquiries);
    };
  }, []);

  const persistEnquiries = (nextEnquiries) => {
    setEnquiries(nextEnquiries);
    saveEnquiries(nextEnquiries);
  };

  const stats = useMemo(() => ({
    total: enquiries.length,
    new: enquiries.filter((enquiry) => enquiry.status === "NEW").length,
    contacted: enquiries.filter((enquiry) => enquiry.status === "CONTACTED").length,
    interested: enquiries.filter((enquiry) => enquiry.status === "INTERESTED").length,
    notInterested: enquiries.filter((enquiry) => enquiry.status === "NOT_INTERESTED").length,
    confirmed: enquiries.filter((enquiry) => enquiry.status === "CONFIRMED").length,
    rejected: enquiries.filter((enquiry) => enquiry.status === "REJECTED").length
  }), [enquiries]);

  const liveBeds = useMemo(loadBeds, [enquiries]);
  const bedsOverview = useMemo(() => {
    const byBed = new Map();
    enquiries.forEach((enquiry) => {
      if (!byBed.has(enquiry.bedId)) {
        byBed.set(enquiry.bedId, {
          bedId: enquiry.bedId,
          bedName: enquiry.bedName,
          roomNumber: enquiry.roomNumber,
          branchName: enquiry.branchName,
          sharingType: enquiry.sharingType
        });
      }
    });
    return [...byBed.values()].map((bed) => {
      const bedEnquiries = enquiries.filter((enquiry) => enquiry.bedId === bed.bedId);
      const openCount = bedEnquiries.filter((enquiry) => OPEN_STATUSES.includes(enquiry.status)).length;
      const liveBed = liveBeds.find((item) => item.id === bed.bedId);
      const confirmedEnquiry = bedEnquiries.find((enquiry) => enquiry.status === "CONFIRMED");
      const badge = bedEnquiryBadge(liveBed?.status || "Available", openCount);
      // A bed can show Assigned via enquiry-confirm, a walk-in booking, or a manual
      // status edit on the Beds page — none of those are enquiry records. Flag it as
      // orphaned only when it's Assigned with no confirmed enquiry AND no booking
      // reference at all, so genuine walk-in/manual holds are never touched.
      const orphaned = badge.tone === "assigned" && !confirmedEnquiry && !liveBed?.bookingId;
      return { ...bed, openCount, badge, assignedTo: confirmedEnquiry?.userName || "", orphaned };
    }).sort((first, second) => second.openCount - first.openCount);
  }, [enquiries, liveBeds]);

  // A bed can be stuck Assigned with zero enquiries ever recorded against it —
  // e.g. an enquiry was blocked before it could be created, or a leftover status
  // from earlier testing/manual edits. bedsOverview above only surfaces beds that
  // already have enquiry history, so this sweeps every bed directly for the same
  // "Assigned with no bookingId" orphan signature.
  const orphanedBedsWithoutHistory = useMemo(() => {
    const knownBedIds = new Set(bedsOverview.map((bed) => bed.bedId));
    return liveBeds.filter((bed) => ["Reserved", "Occupied"].includes(bed.status) && !bed.bookingId && !knownBedIds.has(bed.id));
  }, [liveBeds, bedsOverview]);

  const filteredEnquiries = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return enquiries.filter((enquiry) => {
      const matchesSearch = !query || [enquiry.id, enquiry.userName, enquiry.phone, enquiry.bedName].some((value) => String(value || "").toLowerCase().includes(query));
      const matchesBranch = filters.branch === "All Branches" || enquiry.branchName === filters.branch;
      const matchesStatus = filters.status === "All" || enquiry.status === filters.status;
      const matchesBed = !filters.bedId || enquiry.bedId === filters.bedId;
      return matchesSearch && matchesBranch && matchesStatus && matchesBed;
    });
  }, [enquiries, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredEnquiries.length / rowsPerPage));
  const visibleEnquiries = [...filteredEnquiries].sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt)).slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
  };

  const showToast = (message) => {
    setActionToast(message);
    window.setTimeout(() => setActionToast(""), 3000);
  };

  const setStatus = (enquiry, status, extra = {}) => {
    persistEnquiries(enquiries.map((item) => (item.id === enquiry.id ? { ...item, status, ...extra } : item)));
  };

  const markContacted = (enquiry) => {
    setStatus(enquiry, "CONTACTED", { contactedAt: new Date().toISOString() });
    showToast(`Marked ${enquiry.userName}'s enquiry as contacted.`);
  };

  const markInterested = (enquiry) => {
    setStatus(enquiry, "INTERESTED");
    showToast(`Marked ${enquiry.userName} as interested.`);
  };

  const markNotInterested = (enquiry) => {
    setStatus(enquiry, "NOT_INTERESTED");
    showToast(`Marked ${enquiry.userName} as not interested.`);
  };

  const saveNotes = (enquiry, notes) => {
    persistEnquiries(enquiries.map((item) => (item.id === enquiry.id ? { ...item, adminNotes: notes } : item)));
    setNotesEnquiry(null);
  };

  // Only ever offered for a bed flagged "orphaned" above — Assigned with no
  // confirmed enquiry and no booking reference — so a genuine walk-in or manual
  // hold (which always carries a bookingId) can never be released by mistake.
  const releaseBed = (bed) => {
    saveAvailabilitySnapshot(loadBeds().map((item) => (item.id === bed.bedId ? { ...item, status: "Available", bookingId: "", currentResident: "", checkInDate: "", checkOutDate: "" } : item)));
    showToast(`${bed.bedName} released back to Available.`);
  };

  const confirmApprove = (enquiry) => {
    // The bed may not have an admin record yet (see ensureBedRecord) — materialize
    // it as AVAILABLE first so the status check below is the real source of truth.
    const { beds, bed } = ensureBedRecord(loadBeds(), {
      id: enquiry.bedId,
      branchId: enquiry.branchId,
      branchName: enquiry.branchName,
      roomId: enquiry.roomId,
      roomNumber: enquiry.roomNumber,
      bedName: enquiry.bedName,
      sharingType: enquiry.sharingType
    });
    if (bed.status !== "Available") {
      setWorkflowError(`${enquiry.bedName} is no longer available — it may have already been assigned to another guest.`);
      setApproveEnquiry(null);
      return;
    }

    const now = new Date().toISOString();
    const nextEnquiries = enquiries.map((item) => {
      if (item.id === enquiry.id) return { ...item, status: "CONFIRMED", approvedAt: now };
      if (item.bedId === enquiry.bedId && item.id !== enquiry.id && OPEN_STATUSES.includes(item.status)) {
        return { ...item, status: "REJECTED", rejectedAt: now, adminNotes: item.adminNotes ? `${item.adminNotes}\nBed assigned to another guest.` : "Bed assigned to another guest." };
      }
      return item;
    });
    persistEnquiries(nextEnquiries);

    const nextBeds = beds.map((item) => (item.id === enquiry.bedId ? { ...item, status: "Reserved", bookingId: enquiry.id, checkInDate: enquiry.moveInDate } : item));
    saveAvailabilitySnapshot(nextBeds);

    setApproveEnquiry(null);
    showToast(`Assigned ${enquiry.bedName} to ${enquiry.userName}. Payment is now enabled for this user.`);
  };

  const confirmReject = (enquiry, reason) => {
    setStatus(enquiry, "REJECTED", { rejectedAt: new Date().toISOString(), adminNotes: reason });
    setRejectEnquiry(null);
  };

  const competingCount = (enquiry) => enquiries.filter((item) => item.bedId === enquiry.bedId && item.id !== enquiry.id && OPEN_STATUSES.includes(item.status)).length;

  const activeBedFilter = filters.bedId ? bedsOverview.find((bed) => bed.bedId === filters.bedId) : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Bed Enquiries</h1>
          <p className="text-sm text-slate-500">Every guest who sends an enquiry appears here. A bed accepts up to {MAX_ENQUIRIES_PER_BED} open enquiries — only Confirm &amp; Assign Bed changes its status.</p>
        </div>
      </div>

      {workflowError && (
        <div className="mt-4 flex items-start justify-between gap-3 rounded-2xl border border-brand/20 bg-paper p-4 text-sm font-semibold text-brandDark">
          <p>{workflowError}</p>
          <button type="button" onClick={() => setWorkflowError("")} aria-label="Dismiss workflow error"><X className="h-4 w-4" /></button>
        </div>
      )}

      {actionToast && <div role="status" className="fixed right-5 top-20 z-[80] rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-luxury">{actionToast}</div>}

      <div className="mt-5 grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Enquiries" value={stats.total} />
        <StatCard label="New" value={stats.new} />
        <StatCard label="Contacted" value={stats.contacted} />
        <StatCard label="Interested" value={stats.interested} />
        <StatCard label="Confirmed" value={stats.confirmed} />
        <StatCard label="Rejected" value={stats.rejected} />
      </div>

      {bedsOverview.length > 0 && (
        <Card className="mt-5">
          <h2 className="text-lg font-bold text-ink">Beds Overview</h2>
          <p className="mt-1 text-sm text-slate-500">Every bed that has received at least one enquiry, grouped so you can see all interested users at once.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {bedsOverview.map((bed) => (
              <div key={bed.bedId} className="rounded-2xl border border-line p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-ink">{bed.bedName}</p>
                    <p className="text-xs text-slate-500">{bed.branchName} · Room {bed.roomNumber} · {bed.sharingType}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badgeToneClass[bed.badge.tone]}`}>{badgeToneEmoji[bed.badge.tone]} {bed.badge.label}</span>
                </div>
                {bed.assignedTo && <p className="mt-2 text-xs font-semibold text-slate-600">Assigned To: {bed.assignedTo}</p>}
                {bed.orphaned && (
                  <p className="mt-2 rounded-lg bg-orange-50 p-2 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-400">
                    Shows Assigned but has no confirmed enquiry or booking on record — likely a leftover status from earlier testing or a manual edit.
                  </p>
                )}
                <Button type="button" variant="secondary" className="mt-3 w-full" onClick={() => setBedModal(bed)}>View Enquiries</Button>
                {bed.orphaned && <Button type="button" variant="danger" className="mt-2 w-full" onClick={() => releaseBed(bed)}>Release Bed Back to Available</Button>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {orphanedBedsWithoutHistory.length > 0 && (
        <Card className="mt-5">
          <h2 className="text-lg font-bold text-ink">Beds Stuck Without Any Enquiry</h2>
          <p className="mt-1 text-sm text-slate-500">These beds show Assigned/Occupied but have no confirmed enquiry or booking behind them — likely leftover from earlier testing or a manual status edit. Release them if that's not intentional.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {orphanedBedsWithoutHistory.map((bed) => (
              <div key={bed.id} className="rounded-2xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-500/30 dark:bg-orange-500/15">
                <p className="font-bold text-ink">{bed.bedName}</p>
                <p className="text-xs text-slate-500">{bed.branchName} · Room {bed.roomNumber} · Status: {bed.status}</p>
                <Button type="button" variant="danger" className="mt-3 w-full" onClick={() => releaseBed({ bedId: bed.id, bedName: bed.bedName })}>Release Bed Back to Available</Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="mt-5">
        <div className="grid gap-3 lg:grid-cols-[1.3fr_repeat(2,1fr)]">
          <input className={fieldClass} placeholder="Search by enquiry ID, user, phone, bed" value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} />
          <select aria-label="Branch" className={fieldClass} value={filters.branch} onChange={(event) => updateFilter("branch", event.target.value)}>
            {["All Branches", ...AREAS].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select aria-label="Status" className={fieldClass} value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
            {["All", ...ENQUIRY_STATUSES].map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
        {activeBedFilter && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-paper px-4 py-3 text-sm font-semibold text-ink">
            <p>Filtering: {activeBedFilter.bedName} · Room {activeBedFilter.roomNumber}</p>
            <button type="button" onClick={() => updateFilter("bedId", "")} className="text-brand hover:underline">Clear</button>
          </div>
        )}
      </Card>

      <Card className="mt-5 overflow-x-auto p-0">
        <table className="w-full min-w-[1280px] text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-slate-500">
            <tr>
              {["Enquiry ID", "User", "Branch", "Room", "Bed", "Sharing Type", "Enquiry Date/Time", "Status", "Actions"].map((heading) => (
                <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleEnquiries.map((enquiry) => (
              <tr key={enquiry.id} className={`border-b border-line last:border-0 ${enquiry.status === "NEW" ? "bg-orange-50/80 dark:bg-orange-500/10" : ""}`}>
                <td className="px-4 py-3 font-bold text-ink">{enquiry.id}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{enquiry.userName}</p>
                  <p className="text-xs text-slate-500">{enquiry.phone} · {enquiry.email || "-"}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{enquiry.branchName}</td>
                <td className="px-4 py-3 text-slate-600">Room {enquiry.roomNumber}</td>
                <td className="px-4 py-3 text-slate-600">{enquiry.bedName}</td>
                <td className="px-4 py-3 text-slate-600">{enquiry.sharingType}</td>
                <td className="px-4 py-3 text-slate-600">{formatDateTime(enquiry.createdAt)}</td>
                <td className="px-4 py-3"><Badge value={enquiry.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" title="View Details" onClick={() => setViewEnquiry(enquiry)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="View enquiry details">
                      <Eye className="h-4 w-4" />
                    </button>
                    <a href={`tel:${enquiry.phone}`} title="Call User" className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="Call user">
                      <Phone className="h-4 w-4" />
                    </a>
                    <button type="button" title="Mark Contacted" onClick={() => markContacted(enquiry)} disabled={enquiry.status !== "NEW"} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark disabled:cursor-not-allowed disabled:opacity-40" aria-label="Mark contacted">
                      <PhoneCall className="h-4 w-4" />
                    </button>
                    <button type="button" title="Mark Interested" onClick={() => markInterested(enquiry)} disabled={!OPEN_STATUSES.includes(enquiry.status)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark disabled:cursor-not-allowed disabled:opacity-40" aria-label="Mark interested">
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <button type="button" title="Mark Not Interested" onClick={() => markNotInterested(enquiry)} disabled={!OPEN_STATUSES.includes(enquiry.status)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark disabled:cursor-not-allowed disabled:opacity-40" aria-label="Mark not interested">
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                    <button type="button" title="Admin Notes" onClick={() => setNotesEnquiry(enquiry)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark" aria-label="Add admin notes">
                      <StickyNote className="h-4 w-4" />
                    </button>
                    <button type="button" title="Confirm & Assign Bed" onClick={() => setApproveEnquiry(enquiry)} disabled={!OPEN_STATUSES.includes(enquiry.status)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-600 hover:border-brandDark hover:text-brandDark disabled:cursor-not-allowed disabled:opacity-40" aria-label="Confirm and assign bed">
                      <ShieldCheck className="h-4 w-4" />
                    </button>
                    <button type="button" title="Reject" onClick={() => setRejectEnquiry(enquiry)} disabled={!OPEN_STATUSES.includes(enquiry.status)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-danger hover:border-danger hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40" aria-label="Reject enquiry">
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!visibleEnquiries.length && (
              <tr><td colSpan="9" className="px-4 py-8 text-center text-slate-500">No enquiries match the selected filters.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <p>Showing {visibleEnquiries.length} of {filteredEnquiries.length} enquiries</p>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button>
          <span className="grid min-h-11 place-items-center rounded-xl border border-line px-4 font-semibold text-ink">{page} / {totalPages}</span>
          <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</Button>
        </div>
      </div>

      {viewEnquiry && <EnquiryViewModal enquiry={viewEnquiry} onClose={() => setViewEnquiry(null)} />}
      {notesEnquiry && <NotesDialog enquiry={notesEnquiry} onClose={() => setNotesEnquiry(null)} onSave={saveNotes} />}
      {approveEnquiry && <ApproveDialog enquiry={approveEnquiry} competingCount={competingCount(approveEnquiry)} onClose={() => setApproveEnquiry(null)} onApprove={confirmApprove} />}
      {rejectEnquiry && <RejectDialog enquiry={rejectEnquiry} onClose={() => setRejectEnquiry(null)} onReject={confirmReject} />}
      {bedModal && (
        <BedEnquiriesModal
          bed={bedModal}
          enquiries={enquiries.filter((enquiry) => enquiry.bedId === bedModal.bedId).sort((first, second) => new Date(first.createdAt) - new Date(second.createdAt))}
          onClose={() => setBedModal(null)}
          onSelectFilter={(bedId) => updateFilter("bedId", bedId)}
          onView={setViewEnquiry}
          onContacted={markContacted}
          onInterested={markInterested}
          onNotInterested={markNotInterested}
          onNotes={setNotesEnquiry}
          onApprove={setApproveEnquiry}
          onReject={setRejectEnquiry}
        />
      )}
    </div>
  );
};

export default EnquiriesPage;
