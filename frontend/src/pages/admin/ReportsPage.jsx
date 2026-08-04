import { Download, FileDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import { loadBeds } from "../../data/adminBeds";
import { loadBookings } from "../../data/adminBookings";
import { loadBranches } from "../../data/adminBranches";
import { PAYMENT_TYPES, loadPayments } from "../../data/adminPayments";
import { loadResidents } from "../../data/adminResidents";
import { loadRooms } from "../../data/adminRooms";

const rowsPerPage = 8;
const today = new Date("2026-07-18T00:00:00");
const fieldClass = "min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/25";
const tabs = ["Overview", "Revenue", "Bookings", "Occupancy", "Payments"];

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const monthLabel = (month) => new Date(`${month}-01T00:00:00`).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });

const getMonth = (value) => value?.slice(0, 7) || "";

const isInDateRange = (value, range) => {
  if (!value || range === "Custom") return true;
  const date = new Date(`${value}T00:00:00`);
  if (range === "Today") return date.toDateString() === today.toDateString();
  if (range === "This Week") {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    return date >= weekStart && date <= today;
  }
  if (range === "This Month") return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
  if (range === "This Year") return date.getFullYear() === today.getFullYear();
  return true;
};

const pct = (part, total) => (total ? Math.round((part / total) * 100) : 0);

const BarChart = ({ title, data, valueFormatter = (value) => value }) => {
  const max = Math.max(...data.map((item) => Number(item.value || 0)), 1);
  return (
    <Card>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      <div className="mt-5 flex h-64 items-end gap-3 overflow-x-auto pb-2">
        {data.map((item) => (
          <div key={item.label} className="flex min-w-16 flex-1 flex-col items-center gap-2">
            <div className="flex h-44 w-full items-end rounded-xl bg-paper px-2">
              <div
                className="w-full rounded-t-xl bg-brand shadow-[0_12px_24px_rgba(221,94,103,0.22)]"
                style={{ height: `${Math.max((Number(item.value || 0) / max) * 100, item.value ? 8 : 0)}%` }}
                title={`${item.label}: ${valueFormatter(item.value)}`}
              />
            </div>
            <p className="text-center text-xs font-bold text-slate-500">{item.label}</p>
            <p className="text-center text-xs font-semibold text-ink">{valueFormatter(item.value)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

const DataTable = ({ columns, rows, search, onSearch, page, setPage }) => {
  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const visibleRows = rows.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-line p-4">
        <label className="relative block max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input className={`${fieldClass} pl-11`} placeholder="Search reports" value={search} onChange={(event) => { onSearch(event.target.value); setPage(1); }} />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-line bg-slate-50 text-slate-500">
            <tr>
              {columns.map((column) => <th key={column} className="px-4 py-3 font-semibold">{column}</th>)}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => (
              <tr key={`${row.join("-")}-${index}`} className="border-b border-line last:border-0">
                {row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`} className="px-4 py-3 text-slate-600 first:font-semibold first:text-ink">{cell}</td>)}
              </tr>
            ))}
            {!visibleRows.length && <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">No report rows match the selected filters.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4 text-sm text-slate-500">
        <p>Showing {visibleRows.length} of {rows.length} records</p>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button>
          <span className="grid min-h-11 place-items-center rounded-xl border border-line px-4 font-semibold text-ink">{page} / {totalPages}</span>
          <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</Button>
        </div>
      </div>
    </Card>
  );
};

const downloadCsv = (filename, columns, rows) => {
  const csv = [columns, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const ReportsPage = () => {
  const branches = useMemo(loadBranches, []);
  const rooms = useMemo(loadRooms, []);
  const beds = useMemo(loadBeds, []);
  const bookings = useMemo(loadBookings, []);
  const residents = useMemo(loadResidents, []);
  const payments = useMemo(loadPayments, []);
  const [activeTab, setActiveTab] = useState("Overview");
  const [filters, setFilters] = useState({ dateRange: "This Month", branch: "All Branches", paymentType: "All", bookingStatus: "All" });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredPayments = useMemo(() => payments.filter((payment) => {
    const matchesDate = isInDateRange(payment.paymentDate, filters.dateRange);
    const matchesBranch = filters.branch === "All Branches" || payment.branchName === filters.branch;
    const matchesType = filters.paymentType === "All" || payment.paymentType === filters.paymentType;
    return matchesDate && matchesBranch && matchesType;
  }), [payments, filters]);

  const filteredBookings = useMemo(() => bookings.filter((booking) => {
    const matchesDate = isInDateRange(booking.bookingDate, filters.dateRange);
    const matchesBranch = filters.branch === "All Branches" || booking.branchName === filters.branch;
    const matchesStatus = filters.bookingStatus === "All" || booking.bookingStatus === filters.bookingStatus;
    return matchesDate && matchesBranch && matchesStatus;
  }), [bookings, filters]);

  const filteredBeds = useMemo(() => (
    filters.branch === "All Branches" ? beds : beds.filter((bed) => bed.branchName === filters.branch)
  ), [beds, filters.branch]);

  const filteredResidents = useMemo(() => (
    filters.branch === "All Branches" ? residents : residents.filter((resident) => resident.branchName === filters.branch)
  ), [residents, filters.branch]);

  const paidPayments = filteredPayments.filter((payment) => payment.paymentStatus === "Paid");
  const occupiedBeds = filteredBeds.filter((bed) => bed.status === "Occupied").length;
  const availableBeds = filteredBeds.filter((bed) => bed.status === "Available").length;
  const pendingPayments = filteredPayments.filter((payment) => ["Pending", "Overdue"].includes(payment.paymentStatus)).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const dashboard = {
    totalRevenue: paidPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    totalBookings: filteredBookings.length,
    activeResidents: filteredResidents.filter((resident) => resident.status === "Active").length,
    occupancyRate: `${pct(occupiedBeds, filteredBeds.length)}%`,
    availableBeds,
    pendingPayments
  };

  const monthlyRevenue = useMemo(() => {
    const values = {};
    paidPayments.forEach((payment) => {
      const month = getMonth(payment.paymentDate);
      values[month] = (values[month] || 0) + Number(payment.amount || 0);
    });
    return Object.entries(values).sort(([a], [b]) => a.localeCompare(b)).map(([month, value]) => ({ label: monthLabel(month), value }));
  }, [paidPayments]);

  const monthlyBookings = useMemo(() => {
    const values = {};
    filteredBookings.forEach((booking) => {
      const month = getMonth(booking.bookingDate);
      values[month] = (values[month] || 0) + 1;
    });
    return Object.entries(values).sort(([a], [b]) => a.localeCompare(b)).map(([month, value]) => ({ label: monthLabel(month), value }));
  }, [filteredBookings]);

  const branchOccupancy = branches
    .filter((branch) => filters.branch === "All Branches" || branch.area === filters.branch)
    .map((branch) => {
      const branchBeds = beds.filter((bed) => bed.branchName === branch.area);
      const occupied = branchBeds.filter((bed) => bed.status === "Occupied").length;
      const total = branchBeds.length || Number(branch.beds || 0);
      return { branch: branch.area, total, occupied, available: Math.max(total - occupied, 0), occupancy: pct(occupied, total) };
    });

  const queryRows = (rows) => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) => row.some((cell) => String(cell).toLowerCase().includes(query)));
  };

  const recentActivityRows = queryRows([
    ...filteredBookings.slice(0, 6).map((booking) => [formatDate(booking.bookingDate), "Booking", booking.customerName, booking.branchName, booking.bookingStatus]),
    ...filteredPayments.slice(0, 6).map((payment) => [formatDate(payment.paymentDate), "Payment", payment.residentName, payment.branchName, payment.paymentStatus])
  ]);

  const revenueRows = queryRows(filteredPayments.map((payment) => [formatDate(payment.paymentDate), payment.residentName, payment.paymentType, formatCurrency(payment.amount), payment.paymentStatus]));
  const bookingRows = queryRows(filteredBookings.map((booking) => [booking.id, booking.customerName, booking.branchName, booking.bookingStatus, formatDate(booking.bookingDate)]));
  const occupancyRows = queryRows(branchOccupancy.map((item) => [item.branch, item.total, item.occupied, item.available, `${item.occupancy}%`]));
  const paymentRows = queryRows(filteredPayments.map((payment) => [payment.receiptNo, payment.residentName, formatCurrency(payment.amount), payment.paymentMethod, payment.paymentStatus, formatDate(payment.paymentDate)]));

  const resetFilters = () => {
    setFilters({ dateRange: "This Month", branch: "All Branches", paymentType: "All", bookingStatus: "All" });
    setSearch("");
    setPage(1);
  };

  const exportRows = () => {
    const map = {
      Overview: { columns: ["Date", "Type", "Name", "Branch", "Status"], rows: recentActivityRows },
      Revenue: { columns: ["Date", "Resident", "Payment Type", "Amount", "Status"], rows: revenueRows },
      Bookings: { columns: ["Booking ID", "Resident", "Branch", "Status", "Booking Date"], rows: bookingRows },
      Occupancy: { columns: ["Branch", "Total Beds", "Occupied", "Available", "Occupancy %"], rows: occupancyRows },
      Payments: { columns: ["Receipt No", "Resident", "Amount", "Method", "Status", "Date"], rows: paymentRows }
    };
    return map[activeTab];
  };

  const renderTab = () => {
    if (activeTab === "Overview") {
      return (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <StatCard label="Total Branches" value={branches.length} />
            <StatCard label="Total Rooms" value={rooms.length} />
            <StatCard label="Total Beds" value={beds.length} />
            <StatCard label="Occupied Beds" value={occupiedBeds} />
            <StatCard label="Available Beds" value={availableBeds} />
            <StatCard label="Total Residents" value={filteredResidents.length} />
          </div>
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <BarChart title="Monthly Revenue" data={monthlyRevenue} valueFormatter={formatCurrency} />
            <BarChart title="Monthly Bookings" data={monthlyBookings} />
          </div>
          <div className="mt-5">
            <DataTable columns={["Date", "Type", "Name", "Branch", "Status"]} rows={recentActivityRows} search={search} onSearch={setSearch} page={page} setPage={setPage} />
          </div>
        </>
      );
    }

    if (activeTab === "Revenue") {
      const todayRevenue = paidPayments.filter((payment) => payment.paymentDate === "2026-07-18").reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      const monthly = paidPayments.filter((payment) => getMonth(payment.paymentDate) === "2026-07").reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      const yearly = paidPayments.filter((payment) => payment.paymentDate?.startsWith("2026")).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      return (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Today's Revenue" value={formatCurrency(todayRevenue)} />
            <StatCard label="Monthly Revenue" value={formatCurrency(monthly)} />
            <StatCard label="Yearly Revenue" value={formatCurrency(yearly)} />
          </div>
          <div className="mt-5"><BarChart title="Monthly Revenue Trend" data={monthlyRevenue} valueFormatter={formatCurrency} /></div>
          <div className="mt-5"><DataTable columns={["Date", "Resident", "Payment Type", "Amount", "Status"]} rows={revenueRows} search={search} onSearch={setSearch} page={page} setPage={setPage} /></div>
        </>
      );
    }

    if (activeTab === "Bookings") {
      return (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Total Bookings" value={filteredBookings.length} />
            <StatCard label="Pending Approval" value={filteredBookings.filter((item) => item.bookingStatus === "Pending Approval").length} />
            <StatCard label="Approved" value={filteredBookings.filter((item) => ["Approved", "Assigned to Warden"].includes(item.bookingStatus)).length} />
            <StatCard label="Rejected" value={filteredBookings.filter((item) => item.bookingStatus === "Rejected").length} />
            <StatCard label="Cancelled" value={filteredBookings.filter((item) => item.bookingStatus === "Cancelled").length} />
          </div>
          <div className="mt-5"><BarChart title="Monthly Bookings" data={monthlyBookings} /></div>
          <div className="mt-5"><DataTable columns={["Booking ID", "Resident", "Branch", "Status", "Booking Date"]} rows={bookingRows} search={search} onSearch={setSearch} page={page} setPage={setPage} /></div>
        </>
      );
    }

    if (activeTab === "Occupancy") {
      return (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Occupancy %" value={`${pct(occupiedBeds, filteredBeds.length)}%`} />
            <StatCard label="Available Beds" value={availableBeds} />
            <StatCard label="Occupied Beds" value={occupiedBeds} />
          </div>
          <div className="mt-5"><BarChart title="Branch Wise Occupancy" data={branchOccupancy.map((item) => ({ label: item.branch, value: item.occupancy }))} valueFormatter={(value) => `${value}%`} /></div>
          <div className="mt-5"><DataTable columns={["Branch", "Total Beds", "Occupied", "Available", "Occupancy %"]} rows={occupancyRows} search={search} onSearch={setSearch} page={page} setPage={setPage} /></div>
        </>
      );
    }

    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Paid Payments" value={filteredPayments.filter((payment) => payment.paymentStatus === "Paid").length} />
          <StatCard label="Pending Payments" value={filteredPayments.filter((payment) => payment.paymentStatus === "Pending").length} />
          <StatCard label="Refunds" value={filteredPayments.filter((payment) => payment.paymentStatus === "Refunded" || payment.paymentType === "Refund").length} />
          <StatCard label="Overdue" value={filteredPayments.filter((payment) => payment.paymentStatus === "Overdue").length} />
        </div>
        <div className="mt-5"><BarChart title="Payment Collection" data={monthlyRevenue} valueFormatter={formatCurrency} /></div>
        <div className="mt-5"><DataTable columns={["Receipt No", "Resident", "Amount", "Method", "Status", "Date"]} rows={paymentRows} search={search} onSearch={setSearch} page={page} setPage={setPage} /></div>
      </>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Reports & Analytics</h1>
          <p className="text-sm text-slate-500">View business performance, occupancy, revenue and booking insights.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => window.print()}><Download className="h-4 w-4" /> Export PDF</Button>
          <Button variant="secondary" onClick={() => downloadCsv(`pgstay-${activeTab.toLowerCase()}-report.xls`, exportRows().columns, exportRows().rows)}><FileDown className="h-4 w-4" /> Export Excel</Button>
          <Button variant="secondary" onClick={() => downloadCsv(`pgstay-${activeTab.toLowerCase()}-report.csv`, exportRows().columns, exportRows().rows)}><FileDown className="h-4 w-4" /> Export CSV</Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Total Revenue" value={formatCurrency(dashboard.totalRevenue)} />
        <StatCard label="Total Bookings" value={dashboard.totalBookings} />
        <StatCard label="Active Residents" value={dashboard.activeResidents} />
        <StatCard label="Occupancy Rate" value={dashboard.occupancyRate} />
        <StatCard label="Available Beds" value={dashboard.availableBeds} />
        <StatCard label="Pending Payments" value={formatCurrency(dashboard.pendingPayments)} />
      </div>

      <Card className="mt-5">
        <div className="grid gap-3 xl:grid-cols-[repeat(4,1fr)_auto]">
          <select aria-label="Date Range" className={fieldClass} value={filters.dateRange} onChange={(event) => { setFilters({ ...filters, dateRange: event.target.value }); setPage(1); }}>
            {["Today", "This Week", "This Month", "This Year", "Custom"].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select aria-label="Branch" className={fieldClass} value={filters.branch} onChange={(event) => { setFilters({ ...filters, branch: event.target.value }); setPage(1); }}>
            {["All Branches", ...branches.map((branch) => branch.area)].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select aria-label="Payment Type" className={fieldClass} value={filters.paymentType} onChange={(event) => { setFilters({ ...filters, paymentType: event.target.value }); setPage(1); }}>
            {["All", ...PAYMENT_TYPES].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select aria-label="Booking Status" className={fieldClass} value={filters.bookingStatus} onChange={(event) => { setFilters({ ...filters, bookingStatus: event.target.value }); setPage(1); }}>
            {["All", "Pending Approval", "Approved", "Assigned to Warden", "Rejected", "Cancelled", "Checked In", "Completed"].map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <Button type="button" variant="secondary" onClick={resetFilters}>Reset Filters</Button>
        </div>
      </Card>

      <div className="mt-5 flex gap-2 overflow-x-auto rounded-2xl border border-line bg-white p-2 shadow-soft">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => { setActiveTab(tab); setSearch(""); setPage(1); }}
            className={`min-h-10 shrink-0 rounded-xl px-4 text-sm font-bold transition ${activeTab === tab ? "bg-brand text-white shadow-[0_12px_24px_rgba(221,94,103,0.25)]" : "text-slate-600 hover:bg-paper hover:text-brandDark"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-5">{renderTab()}</div>
    </div>
  );
};

export default ReportsPage;
