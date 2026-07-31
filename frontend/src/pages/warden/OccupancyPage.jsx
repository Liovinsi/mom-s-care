import { Save } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import { useAuth } from "../../context/AuthContext";
import { BED_STATUSES } from "../../data/adminBeds";
import { loadWardens } from "../../data/adminWardens";
import { updateBedStatus, useLiveAvailability } from "../../lib/liveAvailability";

const fieldClass = "min-h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/25";

const statusStyles = {
  Available: "bg-brand/10 text-brandDark",
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

const OccupancyPage = () => {
  const { user } = useAuth();
  const wardens = useMemo(loadWardens, []);
  const assignedBranch = useMemo(() => getAssignedBranch(user, wardens), [user, wardens]);
  const { beds, rooms } = useLiveAvailability();
  const [draftStatuses, setDraftStatuses] = useState({});
  const [draftRoomStatuses, setDraftRoomStatuses] = useState({});
  const [notice, setNotice] = useState("");

  const branchBeds = useMemo(() => beds.filter((bed) => isAssignedBranchRecord(bed, assignedBranch)), [beds, assignedBranch]);
  const branchRooms = useMemo(() => rooms.filter((room) => isAssignedBranchRecord(room, assignedBranch)), [rooms, assignedBranch]);

  const stats = useMemo(() => ({
    totalBeds: branchBeds.length,
    availableBeds: branchBeds.filter((bed) => bed.status === "Available").length,
    occupiedBeds: branchBeds.filter((bed) => bed.status === "Occupied").length,
    reservedBeds: branchBeds.filter((bed) => bed.status === "Reserved").length,
    maintenanceBeds: branchBeds.filter((bed) => bed.status === "Maintenance").length
  }), [branchBeds]);

  const saveStatus = async (bed) => {
    const nextStatus = draftStatuses[bed.id] || bed.status;
    await updateBedStatus(bed, nextStatus);
    setDraftStatuses((current) => {
      const next = { ...current };
      delete next[bed.id];
      return next;
    });
    setNotice(`${bed.roomNumber} ${bed.bedName} updated to ${nextStatus}.`);
  };

  const saveRoomStatus = async (room) => {
    const nextStatus = draftRoomStatuses[room.id];
    if (!nextStatus) return;

    const roomBeds = branchBeds.filter((bed) => bed.roomId === room.id);
    await Promise.all(roomBeds.map((bed) => updateBedStatus(bed, nextStatus)));
    setDraftRoomStatuses((current) => {
      const next = { ...current };
      delete next[room.id];
      return next;
    });
    setNotice(`Room ${room.roomNumber} updated to ${nextStatus}.`);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Occupancy</h1>
          <p className="text-sm text-slate-500">Update bed availability status for your assigned branch only.</p>
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

      <Card className="mt-5 overflow-x-auto p-0">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-slate-500">
            <tr>
              {["Room Number", "Bed", "Current Status", "Update Status", "Action"].map((heading) => (
                <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {branchBeds.map((bed) => {
              const draftStatus = draftStatuses[bed.id] || bed.status;
              return (
                <tr key={bed.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-bold text-ink">Room {bed.roomNumber}</td>
                  <td className="px-4 py-3 font-semibold text-slate-600">{bed.bedName}</td>
                  <td className="px-4 py-3"><StatusBadge status={bed.status} /></td>
                  <td className="px-4 py-3">
                    <select className={fieldClass} value={draftStatus} onChange={(event) => setDraftStatuses((current) => ({ ...current, [bed.id]: event.target.value }))}>
                      {BED_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Button type="button" className="min-h-10 px-4 py-2" disabled={draftStatus === bed.status} onClick={() => saveStatus(bed)}>
                      <Save className="h-4 w-4" /> Save
                    </Button>
                  </td>
                </tr>
              );
            })}
            {!branchBeds.length && (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">No beds are assigned to {assignedBranch.name}.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card className="mt-5 overflow-x-auto p-0">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-slate-500">
            <tr>
              {["Room Number", "Total Beds", "Available Beds", "Occupied Beds", "Reserved Beds", "Maintenance Beds", "Overall Availability", "Update Status", "Action"].map((heading) => (
                <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {branchRooms.map((room) => {
              const draftRoomStatus = draftRoomStatuses[room.id] || "";
              return (
                <tr key={room.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-bold text-ink">Room {room.roomNumber}</td>
                  <td className="px-4 py-3 font-semibold">{room.totalBeds}</td>
                  <td className="px-4 py-3 font-semibold text-success">{room.availableBeds}</td>
                  <td className="px-4 py-3 font-semibold">{room.occupiedBeds}</td>
                  <td className="px-4 py-3 font-semibold">{room.reservedBeds}</td>
                  <td className="px-4 py-3 font-semibold">{room.maintenanceBeds}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${room.overallAvailability === "Available" ? "bg-brand/10 text-brandDark" : "bg-slate-100 text-slate-600"}`}>{room.overallAvailability}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select className={fieldClass} value={draftRoomStatus} onChange={(event) => setDraftRoomStatuses((current) => ({ ...current, [room.id]: event.target.value }))}>
                      <option value="">Select status</option>
                      {BED_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Button type="button" className="min-h-10 px-4 py-2" disabled={!draftRoomStatus} onClick={() => saveRoomStatus(room)}>
                      <Save className="h-4 w-4" /> Save
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default OccupancyPage;
