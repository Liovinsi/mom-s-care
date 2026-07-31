import { useEffect, useState } from "react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { loadBeds } from "../../data/adminBeds";
import { loadBranches } from "../../data/adminBranches";
import { loadPayments } from "../../data/adminPayments";
import { loadResidents } from "../../data/adminResidents";
import { loadRooms } from "../../data/adminRooms";
import { loadWardens } from "../../data/adminWardens";

const labels = {
  branches: ["name", "city", "state"],
  rooms: ["name", "floor", "monthlyRent"],
  beds: ["label", "status"],
  residents: ["status"],
  wardens: ["name", "email"],
  payments: ["amount", "status", "method"]
};

const ManagementPage = ({ title, endpoint }) => {
  const [rows, setRows] = useState([]);
  const fields = labels[endpoint] || ["name", "status"];

  const load = () => {
    const loaders = {
      branches: loadBranches,
      rooms: loadRooms,
      beds: loadBeds,
      residents: loadResidents,
      wardens: loadWardens,
      payments: loadPayments
    };
    setRows(loaders[endpoint]?.() || []);
  };

  useEffect(load, [endpoint]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-slate-500">Manage {title.toLowerCase()} from local demo data.</p>
        </div>
        {!["payments", "residents"].includes(endpoint) && <Button>Add new</Button>}
      </div>
      <Card className="mt-5 overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-500">
            <tr>
              {fields.map((field) => <th key={field} className="px-4 py-3 font-semibold capitalize">{field}</th>)}
              <th className="px-4 py-3 font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td className="px-4 py-5 text-slate-500" colSpan={fields.length + 1}>No records yet.</td></tr>}
            {rows.map((row) => (
              <tr key={row.id || row._id} className="border-b last:border-0">
                {fields.map((field) => (
                  <td key={field} className="px-4 py-3">
                    {field === "status" ? <Badge value={row[field]} /> : String(row[field] ?? row[field]?._id ?? "-")}
                  </td>
                ))}
                <td className="px-4 py-3 text-slate-500">{row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default ManagementPage;
