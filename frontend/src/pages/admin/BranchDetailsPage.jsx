import { ArrowLeft, MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import BranchImage from "../../components/admin/BranchImage";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import { loadBranches } from "../../data/adminBranches";
import { loadComplaints } from "../../data/complaints";
import { loadResidents } from "../../data/adminResidents";
import { loadWardens } from "../../data/adminWardens";
import { useLiveAvailability } from "../../lib/liveAvailability";
import { calculatePaymentAnalytics, formatCurrency, formatDate, useLivePayments } from "../../lib/livePayments";

const branchMetricOverrides = {
  "anna-nagar": {
    rooms: 50,
    beds: 200,
    availableBeds: 42,
    occupiedBeds: 148,
    reservedBeds: 6,
    maintenanceBeds: 4,
    residents: 148,
    todayCollection: 18000,
    monthlyRevenue: 1245000,
    pendingRent: 120000,
    overduePayments: 12,
    occupancy: 74,
    recentPayments: [
      { residentName: "Rahul Kumar", roomNumber: "101", amount: 18000, paymentDate: "2026-07-18", collectedBy: "Priya Raman", paymentStatus: "Paid" },
      { residentName: "Meera Nair", roomNumber: "204", amount: 16000, paymentDate: "2026-07-18", collectedBy: "S. Kavitha", paymentStatus: "Paid" },
      { residentName: "Arjun Menon", roomNumber: "118", amount: 12000, paymentDate: "2026-07-17", collectedBy: "Priya Raman", paymentStatus: "Partial" }
    ],
    recentCheckIns: [
      { residentName: "Rahul Kumar", roomNumber: "101", bedName: "Bed A", date: "2026-07-18" },
      { residentName: "Sneha R", roomNumber: "214", bedName: "Bed C", date: "2026-07-17" },
      { residentName: "Vikram S", roomNumber: "305", bedName: "Bed B", date: "2026-07-16" }
    ],
    recentCheckOuts: [
      { residentName: "Karthik S", roomNumber: "203", bedName: "Bed A", date: "2026-07-18" },
      { residentName: "Nisha P", roomNumber: "119", bedName: "Bed D", date: "2026-07-17" }
    ]
  }
};

const BranchDetailsPage = () => {
  const { branchId } = useParams();
  const branch = loadBranches().find((item) => item.id === branchId);
  const { rooms, beds } = useLiveAvailability();
  const { payments } = useLivePayments();
  const branchRooms = rooms.filter((room) => room.branchId === branchId);
  const branchBeds = beds.filter((bed) => bed.branchId === branchId);
  const branchResidents = loadResidents().filter((resident) => resident.branchId === branchId);
  const branchWardens = loadWardens().filter((warden) => warden.branchId === branchId);
  const branchPayments = payments.filter((payment) => payment.branchId === branchId);
  const branchComplaints = loadComplaints().filter((complaint) => complaint.branchId === branchId || complaint.branchName === branch?.area);
  const analytics = calculatePaymentAnalytics(branchPayments, branchResidents);
  const metrics = branchMetricOverrides[branchId];
  const occupancy = metrics?.occupancy ?? (branchBeds.length ? Math.round((branchBeds.filter((bed) => bed.status === "Occupied").length / branchBeds.length) * 100) : 0);
  const recentPayments = metrics?.recentPayments || branchPayments.slice(0, 6);
  const recentCheckIns = metrics?.recentCheckIns || branchResidents
    .filter((resident) => resident.status === "Active")
    .slice(0, 5)
    .map((resident) => ({ residentName: resident.fullName, roomNumber: resident.roomNumber, bedName: resident.bedName, date: resident.moveInDate }));
  const recentCheckOuts = metrics?.recentCheckOuts || branchResidents
    .filter((resident) => resident.status === "Checked Out" || resident.status === "Vacating")
    .slice(0, 5)
    .map((resident) => ({ residentName: resident.fullName, roomNumber: resident.roomNumber, bedName: resident.bedName, date: resident.expectedVacateDate }));

  if (!branch) {
    return (
      <div>
        <Link to="/pgbooking/admin/branches">
          <Button variant="secondary"><ArrowLeft className="h-4 w-4" /> Back</Button>
        </Link>
        <Card className="mt-5">
          <h1 className="text-xl font-bold text-ink">Branch not found</h1>
          <p className="mt-2 text-sm text-slate-500">The selected branch is unavailable.</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/pgbooking/admin/branches" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-brand">
            <ArrowLeft className="h-4 w-4" /> Branches
          </Link>
          <h1 className="text-2xl font-bold text-ink">{branch.name}</h1>
          <p className="text-sm text-slate-500">{branch.area}, {branch.city}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${branch.status === "Active" ? "bg-brand/10 text-brandDark" : "bg-slate-100 text-slate-600"}`}>{branch.status}</span>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden p-0">
          <BranchImage src={branch.image} alt={branch.name} className="h-80 w-full object-cover" fallbackClassName="h-80 w-full rounded-none" />
          <div className="p-5">
            <h2 className="text-lg font-bold text-ink">Address</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{branch.address} - {branch.pincode}</p>
            <p className="mt-2 text-sm text-slate-500">{branch.description}</p>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-ink">Google Map</h2>
          <div className="mt-4 grid min-h-64 place-items-center rounded-2xl border border-line bg-paper text-center">
            <div>
              <MapPin className="mx-auto h-8 w-8 text-brand" />
              <p className="mt-3 text-sm font-semibold text-ink">{branch.latitude}, {branch.longitude}</p>
              <a href={branch.mapLink} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-brand">Open Google Map</a>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Rooms" value={metrics?.rooms ?? (branchRooms.length || branch.rooms)} />
        <StatCard label="Total Beds" value={metrics?.beds ?? (branchBeds.length || branch.beds)} />
        <StatCard label="Available Beds" value={metrics?.availableBeds ?? (branchBeds.filter((bed) => bed.status === "Available").length || branch.availableBeds)} />
        <StatCard label="Occupied Beds" value={metrics?.occupiedBeds ?? (branchBeds.filter((bed) => bed.status === "Occupied").length || branch.occupiedBeds)} />
        <StatCard label="Reserved Beds" value={metrics?.reservedBeds ?? branchBeds.filter((bed) => bed.status === "Reserved").length} />
        <StatCard label="Maintenance Beds" value={metrics?.maintenanceBeds ?? branchBeds.filter((bed) => bed.status === "Maintenance").length} />
        <StatCard label="Available Rooms" value={branchRooms.filter((room) => room.overallAvailability === "Available").length} />
        <StatCard label="Occupancy %" value={`${occupancy}%`} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Residents" value={metrics?.residents ?? (branchResidents.length || branch.residents)} />
        <StatCard label="Wardens" value={branchWardens.length || branch.wardens.length} />
        <StatCard label="Monthly Revenue" value={formatCurrency(metrics?.monthlyRevenue ?? analytics.monthlyRevenue)} />
        <StatCard label="Today's Collection" value={formatCurrency(metrics?.todayCollection ?? analytics.todayCollection)} />
        <StatCard label="Pending Rent" value={formatCurrency(metrics?.pendingRent ?? analytics.pendingRent)} />
        <StatCard label="Overdue Payments" value={metrics?.overduePayments ? `${metrics.overduePayments} Residents` : formatCurrency(analytics.overduePayments)} />
        <StatCard label="Booked Rooms" value={branchRooms.filter((room) => room.overallAvailability === "Not Available").length} />
        <StatCard label="Complaints" value={branchComplaints.length} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h2 className="text-lg font-bold text-ink">Gallery</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {(branch.gallery || []).map((item, index) => (
              <div key={`${item.image}-${index}`}>
                <BranchImage src={item.image} alt={`${branch.name} ${item.label}`} className="h-36 w-full rounded-2xl object-cover" fallbackClassName="h-36 w-full rounded-2xl" />
                <p className="mt-2 text-xs font-bold uppercase text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-ink">Amenities</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {branch.amenities.map((amenity) => (
              <span key={amenity} className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">{amenity}</span>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card>
          <h2 className="text-lg font-bold text-ink">Rooms</h2>
          <p className="mt-3 text-3xl font-bold text-ink">{branch.rooms}</p>
          <p className="text-sm text-slate-500">Configured rooms in this branch.</p>
        </Card>
        <Card>
          <h2 className="text-lg font-bold text-ink">Wardens Assigned</h2>
          <div className="mt-3 space-y-2">
            {branch.wardens.map((warden) => (
              <p key={warden} className="rounded-xl bg-paper px-3 py-2 text-sm font-semibold text-ink">{warden}</p>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-bold text-ink">Residents</h2>
          <p className="mt-3 text-3xl font-bold text-ink">{branch.residents}</p>
          <p className="text-sm text-slate-500">Active residents mapped to this branch.</p>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card className="overflow-x-auto p-0">
          <div className="border-b border-line p-5">
            <h2 className="text-lg font-bold text-ink">Recent Payments</h2>
          </div>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line bg-slate-50 text-slate-500">
              <tr>
                {["Resident", "Room", "Amount", "Payment Date", "Collected By", "Status"].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((payment) => (
                <tr key={`${payment.residentName}-${payment.paymentDate}-${payment.amount}`} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-semibold text-ink">{payment.residentName}</td>
                  <td className="px-4 py-3 text-slate-600">Room {payment.roomNumber}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(payment.amount)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(payment.paymentDate)}</td>
                  <td className="px-4 py-3 text-slate-600">{payment.collectedBy}</td>
                  <td className="px-4 py-3 text-slate-600">{payment.paymentStatus}</td>
                </tr>
              ))}
              {!recentPayments.length && <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-500">No payments recorded for this branch.</td></tr>}
            </tbody>
          </table>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-ink">Recent Activity</h2>
          <div className="mt-4 space-y-3">
            {[
              ...branchPayments.slice(0, 3).map((payment) => `${payment.paymentType} ${payment.paymentStatus} · ${payment.residentName} · ${formatCurrency(payment.amount)}`),
              ...branchComplaints.slice(0, 3).map((complaint) => `Complaint ${complaint.status} · ${complaint.title || complaint.category}`)
            ].map((activity) => (
              <p key={activity} className="rounded-xl bg-paper p-3 text-sm font-semibold text-ink">{activity}</p>
            ))}
            {!branchPayments.length && !branchComplaints.length && <p className="rounded-xl bg-paper p-4 text-sm font-semibold text-slate-500">No recent branch activity.</p>}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold text-ink">Recent Check-Ins</h2>
          <div className="mt-4 space-y-3">
            {recentCheckIns.map((item) => (
              <p key={`${item.residentName}-${item.date}`} className="rounded-xl bg-paper p-3 text-sm font-semibold text-ink">
                {item.residentName} · Room {item.roomNumber} · {item.bedName} · {formatDate(item.date)}
              </p>
            ))}
            {!recentCheckIns.length && <p className="rounded-xl bg-paper p-4 text-sm font-semibold text-slate-500">No recent check-ins.</p>}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-ink">Recent Check-Outs</h2>
          <div className="mt-4 space-y-3">
            {recentCheckOuts.map((item) => (
              <p key={`${item.residentName}-${item.date}`} className="rounded-xl bg-paper p-3 text-sm font-semibold text-ink">
                {item.residentName} · Room {item.roomNumber} · {item.bedName} · {formatDate(item.date)}
              </p>
            ))}
            {!recentCheckOuts.length && <p className="rounded-xl bg-paper p-4 text-sm font-semibold text-slate-500">No recent check-outs.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BranchDetailsPage;
