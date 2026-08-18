import { Check, Eye, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import { useAuth } from "../../context/AuthContext";
import { loadBeds } from "../../data/adminBeds";
import { loadBookings, saveBookings } from "../../data/adminBookings";
import { loadResidents, saveResidents } from "../../data/adminResidents";
import { loadStatusUpdateRequests, updateStatusUpdateRequest } from "../../data/statusUpdateRequests";
import { updateStoredBedStatus } from "../../lib/liveAvailability";

const statusClass = {
  "Pending Approval": "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  Approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  Rejected: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400"
};

const StatusPill = ({ value }) => <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[value] || "bg-slate-100 text-slate-700"}`}>{value}</span>;

const StatusUpdateRequestsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState(loadStatusUpdateRequests);
  const [selected, setSelected] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const refresh = () => setRequests(loadStatusUpdateRequests());
    window.addEventListener("pg:status-update-requests-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("pg:status-update-requests-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const counts = useMemo(() => ({
    pending: requests.filter((item) => item.status === "Pending Approval").length,
    approved: requests.filter((item) => item.status === "Approved").length,
    rejected: requests.filter((item) => item.status === "Rejected").length
  }), [requests]);

  const approve = (request) => {
    const bed = loadBeds().find((item) => item.id === request.bedId);
    if (!bed || bed.status !== request.currentStatus) {
      setNotice("This request is stale because the live bed status has changed. Review and reject it before continuing.");
      return;
    }

    updateStoredBedStatus(request.bedId, request.requestedStatus);

    if (request.requestedStatus === "Available") {
      saveResidents(loadResidents().map((resident) => resident.bedId === request.bedId && resident.status !== "Checked Out" ? { ...resident, status: "Checked Out", checkedOutDate: new Date().toISOString().slice(0, 10) } : resident));
      saveBookings(loadBookings().map((booking) => booking.bedId === request.bedId && booking.bookingStatus === "Checked-In" ? { ...booking, bookingStatus: "Completed" } : booking));
    } else if (request.requestedStatus === "Occupied") {
      saveResidents(loadResidents().map((resident) => resident.bedId === request.bedId && resident.status === "Pending Check-In" ? { ...resident, status: "Active", moveInDate: new Date().toISOString().slice(0, 10) } : resident));
      saveBookings(loadBookings().map((booking) => booking.bedId === request.bedId && booking.bookingStatus === "Approved" ? { ...booking, bookingStatus: "Checked-In" } : booking));
    }

    const approvedAt = new Date().toISOString();
    updateStatusUpdateRequest(request.id, {
      status: "Approved",
      approvedBy: user?.name || "Admin",
      approvedAt,
      oldStatus: request.currentStatus,
      newStatus: request.requestedStatus
    }, { action: "Approved", by: user?.name || "Admin", at: approvedAt, oldStatus: request.currentStatus, newStatus: request.requestedStatus });
    setSelected(null);
    setNotice("Room/Bed Status Updated Successfully.");
  };

  const reject = (request) => {
    if (!rejectionReason.trim()) return;
    const rejectedAt = new Date().toISOString();
    updateStatusUpdateRequest(request.id, {
      status: "Rejected",
      rejectedBy: user?.name || "Admin",
      rejectedAt,
      rejectionReason: rejectionReason.trim()
    }, { action: "Rejected", by: user?.name || "Admin", at: rejectedAt, reason: rejectionReason.trim(), oldStatus: request.currentStatus, newStatus: request.requestedStatus });
    setSelected(null);
    setRejectionReason("");
    setNotice("Update request rejected. The original live status was retained.");
  };

  return (
    <div>
      <div><h1 className="text-2xl font-bold text-ink">Room &amp; Bed Update Requests</h1><p className="mt-1 text-sm text-slate-500">Review Warden requests before changes reach dashboards and the user portal.</p></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3"><StatCard label="Pending Requests" value={counts.pending} /><StatCard label="Approved" value={counts.approved} /><StatCard label="Rejected" value={counts.rejected} /></div>
      {notice && <div className="mt-5 flex items-center justify-between rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm font-semibold text-ink"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss"><X className="h-4 w-4" /></button></div>}

      <Card className="mt-5 overflow-hidden p-0">
        <div className="overflow-x-auto"><table className="w-full min-w-[1120px] text-left text-sm"><thead className="border-b border-line bg-slate-50 text-slate-500"><tr>{["Request ID", "Branch", "Room", "Bed", "Current", "Requested", "Warden", "Date & Time", "Status", "Action"].map((heading) => <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>)}</tr></thead><tbody>
          {requests.map((request) => <tr key={request.id} className={`border-b border-line last:border-0 ${request.status === "Pending Approval" ? "bg-orange-50/60 dark:bg-orange-500/10" : ""}`}><td className="px-4 py-4 font-bold text-ink">{request.id}</td><td className="px-4 py-4">{request.branchName}</td><td className="px-4 py-4">{request.roomNumber}</td><td className="px-4 py-4">{request.bedName}</td><td className="px-4 py-4">{request.currentStatus}</td><td className="px-4 py-4 font-bold text-brand">{request.requestedStatus}</td><td className="px-4 py-4">{request.wardenName}</td><td className="px-4 py-4 text-slate-600">{new Date(request.createdAt).toLocaleString("en-IN")}</td><td className="px-4 py-4"><StatusPill value={request.status} /></td><td className="px-4 py-4"><Button variant="secondary" className="px-3" onClick={() => { setSelected(request); setRejectionReason(""); }}><Eye className="h-4 w-4" /> Review</Button></td></tr>)}
          {!requests.length && <tr><td colSpan="10" className="px-4 py-10 text-center text-slate-500">No room or bed update requests yet.</td></tr>}
        </tbody></table></div>
      </Card>

        {selected && <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4"><Card className="w-full max-w-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-brand">{selected.id}</p><h2 className="mt-1 text-xl font-bold text-ink">Review Update Request</h2></div><button className="grid h-10 w-10 place-items-center rounded-xl border border-line" onClick={() => setSelected(null)}><X className="h-4 w-4" /></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{[["Branch", selected.branchName], ["Room / Bed", `Room ${selected.roomNumber} · ${selected.bedName}`], ["Current Status", selected.currentStatus], ["Requested Status", selected.requestedStatus], ["Warden Name", selected.wardenName], ["Date & Time", new Date(selected.createdAt).toLocaleString("en-IN")], ["Status", selected.status]].map(([label, value]) => <div key={label} className="rounded-xl bg-paper p-3"><p className="text-xs font-bold uppercase text-slate-500">{label}</p><p className="mt-1 font-semibold text-ink">{value}</p></div>)}</div>
        {selected.status === "Pending Approval" && <><label className="mt-5 block"><span className="mb-2 block text-sm font-semibold text-ink">Rejection Reason</span><textarea className="min-h-24 w-full rounded-xl border border-line p-3 outline-none focus:border-brand focus:ring-4 focus:ring-brand/20" placeholder="Required only when rejecting" value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} /></label><div className="mt-5 flex flex-wrap justify-end gap-3"><Button variant="danger" disabled={!rejectionReason.trim()} onClick={() => reject(selected)}><X className="h-4 w-4" /> Reject</Button><Button onClick={() => approve(selected)}><Check className="h-4 w-4" /> Approve</Button></div></>}
        {selected.status !== "Pending Approval" && <div className="mt-5 rounded-xl bg-paper p-4 text-sm text-slate-600">Decision by {selected.approvedBy || selected.rejectedBy}. {selected.rejectionReason || "Live status was updated after approval."}</div>}
        <div className="mt-5 border-t border-line pt-5"><h3 className="font-bold text-ink">Action History</h3><div className="mt-3 space-y-2">{(selected.actionHistory || []).map((entry, index) => <div key={`${entry.action}-${index}`} className="rounded-xl bg-paper p-3 text-sm"><div className="flex flex-wrap justify-between gap-2"><strong className="text-ink">{entry.action}</strong><span className="text-slate-500">{new Date(entry.at).toLocaleString("en-IN")}</span></div><p className="mt-1 text-slate-600">By {entry.by || "System"}{entry.oldStatus && entry.newStatus ? ` · ${entry.oldStatus} → ${entry.newStatus}` : ""}</p>{entry.reason && <p className="mt-1 text-slate-600">Reason: {entry.reason}</p>}</div>)}</div></div>
      </Card></div>}
    </div>
  );
};

export default StatusUpdateRequestsPage;
