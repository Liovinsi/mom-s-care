import { BedDouble, ChevronRight, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import { useAuth } from "../../context/AuthContext";
import { loadWardens } from "../../data/adminWardens";
import { recordWardenActivity } from "../../data/wardenActivities";
import { createStatusUpdateRequest, loadStatusUpdateRequests } from "../../data/statusUpdateRequests";
import { useLiveAvailability } from "../../lib/liveAvailability";

const fieldClass = "min-h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/25";
const editableStatuses = ["Available", "Occupied", "Reserved", "Maintenance"];

const statusStyles = {
  Available: "bg-brand/10 text-brandDark",
  Blocked: "bg-orange-100 text-orange-700",
  Occupied: "bg-paper text-brandDark",
  Reserved: "bg-paper text-brandDark",
  Maintenance: "bg-slate-100 text-slate-600"
};

const getAssignedBranch = (user, wardens) => {
  const assignedWarden = wardens.find((warden) => (
    warden.employeeId === user?.employeeId ||
    warden.email === user?.email ||
    `${warden.firstName} ${warden.lastName}` === user?.name
  ));

  return {
    id: user?.branchId || assignedWarden?.branchId || "anna-nagar",
    name: user?.branchName || assignedWarden?.branchName || "Anna Nagar"
  };
};

const isAssignedBranchRecord = (record, assignedBranch) =>
  record.branchId ? record.branchId === assignedBranch.id : record.branchName === assignedBranch.name;

const StatusBadge = ({ status }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[status] || statusStyles.Maintenance}`}>{status}</span>
);

const roomStatusStyles = {
  Vacant: "bg-emerald-50 text-emerald-700",
  "Partially Occupied": "bg-orange-50 text-orange-700",
  Full: "bg-brand/10 text-brandDark",
  Maintenance: "bg-slate-100 text-slate-600"
};

const getRoomStatus = (roomBeds) => {
  if (!roomBeds.length || roomBeds.every((bed) => bed.status === "Available")) return "Vacant";
  if (roomBeds.every((bed) => bed.status === "Maintenance")) return "Maintenance";
  if (!roomBeds.some((bed) => bed.status === "Available")) return "Full";
  return "Partially Occupied";
};

const RoomStatusBadge = ({ status }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-bold ${roomStatusStyles[status] || roomStatusStyles.Maintenance}`}>{status}</span>
);

const requestStatusStyles = {
  "Pending Approval": "bg-orange-100 text-orange-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-50 text-red-700"
};

const OccupancyPage = () => {
  const { user } = useAuth();
  const wardens = useMemo(loadWardens, []);
  const assignedBranch = useMemo(() => getAssignedBranch(user, wardens), [user, wardens]);
  const { beds, rooms } = useLiveAvailability();
  const [draftStatuses, setDraftStatuses] = useState({});
  const [expandedRooms, setExpandedRooms] = useState({});
  const [requests, setRequests] = useState(loadStatusUpdateRequests);
  const [notice, setNotice] = useState("");

  const branchBeds = useMemo(() => beds.filter((bed) => isAssignedBranchRecord(bed, assignedBranch)), [beds, assignedBranch]);
  const branchRooms = useMemo(() => rooms.filter((room) => isAssignedBranchRecord(room, assignedBranch)), [rooms, assignedBranch]);
  const branchRequests = useMemo(() => requests.filter((request) => request.branchId === assignedBranch.id), [requests, assignedBranch.id]);

  useEffect(() => {
    const refresh = () => setRequests(loadStatusUpdateRequests());
    window.addEventListener("pg:status-update-requests-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("pg:status-update-requests-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const stats = useMemo(() => ({
    totalBeds: branchBeds.length,
    availableBeds: branchBeds.filter((bed) => bed.status === "Available").length,
    occupiedBeds: branchBeds.filter((bed) => bed.status === "Occupied").length,
    reservedBeds: branchBeds.filter((bed) => bed.status === "Reserved").length,
    maintenanceBeds: branchBeds.filter((bed) => bed.status === "Maintenance").length
  }), [branchBeds]);

  const saveStatus = async (bed) => {
    const nextStatus = draftStatuses[bed.id] || bed.status;
    if (nextStatus === bed.status) {
      setNotice("Select a new status before submitting.");
      return;
    }
    if (branchRequests.some((request) => request.bedId === bed.id && request.status === "Pending Approval")) {
      setNotice("A pending approval request already exists for this bed.");
      return;
    }
    const request = createStatusUpdateRequest({
      type: "Bed Status",
      branchId: assignedBranch.id,
      branchName: assignedBranch.name,
      roomId: bed.roomId,
      roomNumber: bed.roomNumber,
      bedId: bed.id,
      bedName: bed.bedName,
      currentStatus: bed.status,
      requestedStatus: nextStatus,
      wardenId: user?.id,
      wardenName: user?.name || "Warden"
    });
    recordWardenActivity({
      branchId: assignedBranch.id,
      branchName: assignedBranch.name,
      wardenId: user?.id,
      wardenName: user?.name || "Warden",
      action: "Bed Update Requested",
      roomNumber: bed.roomNumber,
      bedName: bed.bedName,
      status: nextStatus
    });
    setDraftStatuses((current) => {
      const next = { ...current };
      delete next[bed.id];
      return next;
    });
    setNotice(`${request.id} submitted for Admin approval. Live availability has not changed.`);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Rooms &amp; Beds</h1>
          <p className="text-sm text-slate-500">Review room occupancy and update individual beds in your assigned branch.</p>
        </div>
        <div className="rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm font-semibold text-brand">
          Assigned Branch: {assignedBranch.name}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Beds" value={stats.totalBeds} />
        <StatCard label="Available Beds" value={stats.availableBeds} />
        <StatCard label="Occupied Beds" value={stats.occupiedBeds} />
        <StatCard label="Reserved Beds" value={stats.reservedBeds} />
        <StatCard label="Maintenance Beds" value={stats.maintenanceBeds} />
      </div>

      {notice && <div className="mt-5 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm font-semibold text-ink">{notice}</div>}
      {branchRequests.some((request) => request.status === "Rejected") && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">Your update request was rejected. Review the Admin reason in My Update Requests.</div>}

      <div className="mt-5 space-y-4">
        {branchRooms.map((room) => {
          const roomBeds = branchBeds.filter((bed) => bed.roomId === room.id);
          const occupiedCount = roomBeds.filter((bed) => bed.status === "Occupied").length;
          const availableCount = roomBeds.filter((bed) => bed.status === "Available").length;
          const roomStatus = getRoomStatus(roomBeds);
          const isExpanded = Boolean(expandedRooms[room.id]);

          return (
            <Card key={room.id} className="overflow-hidden p-0 shadow-soft transition-shadow duration-300 hover:shadow-luxury">
              <button
                type="button"
                className="flex w-full flex-col gap-4 p-4 text-left transition-colors duration-300 hover:bg-brand/5 sm:p-5 lg:flex-row lg:items-center lg:justify-between"
                onClick={() => setExpandedRooms((current) => ({ ...current, [room.id]: !current[room.id] }))}
                aria-expanded={isExpanded}
                aria-controls={`room-${room.id}-beds`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                    <ChevronRight className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`} />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Room</p>
                    <h2 className="text-xl font-bold text-ink">Room {room.roomNumber}</h2>
                  </div>
                </div>

                <div className="grid w-full gap-3 grid-cols-2 sm:grid-cols-4 lg:w-auto lg:min-w-[620px]">
                  <div><p className="text-xs font-semibold uppercase text-slate-400">Status</p><div className="mt-1"><RoomStatusBadge status={roomStatus} /></div></div>
                  <div><p className="text-xs font-semibold uppercase text-slate-400">Occupied</p><p className="mt-1 font-bold text-ink">{occupiedCount} / {roomBeds.length}</p></div>
                  <div><p className="text-xs font-semibold uppercase text-slate-400">Available</p><p className="mt-1 font-bold text-emerald-700">{availableCount}</p></div>
                  <div><p className="text-xs font-semibold uppercase text-slate-400">Total Beds</p><p className="mt-1 flex items-center gap-2 font-bold text-ink"><BedDouble className="h-4 w-4 text-brand" /> {roomBeds.length}</p></div>
                </div>
              </button>

              <div id={`room-${room.id}-beds`} className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <div className="overflow-x-auto border-t border-line bg-slate-50/60">
                    <table className="w-full min-w-[680px] text-left text-sm">
                      <thead className="border-b border-line text-xs uppercase tracking-wide text-slate-500">
                        <tr>{["Bed", "Current Status", "Requested Status", "Action"].map((heading) => <th key={heading} className={`px-5 py-3 font-semibold ${heading === "Action" ? "text-right" : ""}`}>{heading}</th>)}</tr>
                      </thead>
                      <tbody className="bg-white">
                        {roomBeds.map((bed) => {
                          const draftStatus = draftStatuses[bed.id] || bed.status;
                          return (
                            <tr key={bed.id} className="border-b border-line last:border-0">
                              <td className="px-5 py-4"><p className="font-bold text-ink">{bed.bedName}</p><p className="mt-1 text-xs text-slate-400">{bed.bedCode}</p></td>
                              <td className="px-5 py-4"><StatusBadge status={bed.status} /></td>
                              <td className="w-[38%] px-5 py-4"><select className={`${fieldClass} min-w-64`} value={draftStatus} onChange={(event) => setDraftStatuses((current) => ({ ...current, [bed.id]: event.target.value }))}>{!editableStatuses.includes(draftStatus) && <option value={draftStatus}>{draftStatus}</option>}{editableStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></td>
                              <td className="px-5 py-4 text-right"><Button type="button" className="ml-auto min-h-10 whitespace-nowrap px-4 py-2" disabled={draftStatus === bed.status} onClick={() => saveStatus(bed)}><Save className="h-4 w-4" /> Request Approval</Button></td>
                            </tr>
                          );
                        })}
                        {!roomBeds.length && <tr><td colSpan="4" className="px-5 py-8 text-center text-slate-500">No beds are configured for this room.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {!branchRooms.length && <Card className="py-10 text-center text-sm font-semibold text-slate-500">No rooms are assigned to {assignedBranch.name}.</Card>}
      </div>

      <Card className="mt-6 overflow-hidden p-0">
        <div className="border-b border-line p-5"><h2 className="text-lg font-bold text-ink">My Update Requests</h2><p className="mt-1 text-sm text-slate-500">Track Admin approval without changing live availability.</p></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-line bg-slate-50 text-slate-500"><tr>{["Request ID", "Room / Bed", "Old Status", "Requested Status", "Requested", "Status / Decision"].map((heading) => <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>)}</tr></thead>
            <tbody>{branchRequests.map((request) => <tr key={request.id} className="border-b border-line last:border-0"><td className="px-4 py-4 font-bold text-ink">{request.id}</td><td className="px-4 py-4">Room {request.roomNumber} · {request.bedName}</td><td className="px-4 py-4"><StatusBadge status={request.currentStatus} /></td><td className="px-4 py-4"><StatusBadge status={request.requestedStatus} /></td><td className="px-4 py-4 text-slate-600">{new Date(request.createdAt).toLocaleString("en-IN")}</td><td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${requestStatusStyles[request.status]}`}>{request.status}</span>{request.rejectionReason && <p className="mt-2 text-xs font-semibold text-red-600">{request.rejectionReason}</p>}</td></tr>)}{!branchRequests.length && <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-500">No update requests submitted yet.</td></tr>}</tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default OccupancyPage;
