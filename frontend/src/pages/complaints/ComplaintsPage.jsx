import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileDown,
  ImagePlus,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  Send,
  ShieldAlert,
  Star,
  Trash2,
  UserCheck,
  X
} from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import { useAuth } from "../../context/AuthContext";
import { loadBranches } from "../../data/adminBranches";
import { loadResidents } from "../../data/adminResidents";
import { loadWardens } from "../../data/adminWardens";
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITIES,
  COMPLAINT_STATUSES,
  createComplaintId,
  loadComplaints,
  saveComplaints
} from "../../data/complaints";
import { ROLES } from "../../routes/roleRoutes";

const rowsPerPage = 10;
const today = "2026-07-18";
const fieldClass = "min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/25 disabled:bg-paper disabled:text-slate-500";
const textareaClass = `${fieldClass} min-h-28 py-3`;

const statusStyles = {
  Open: "bg-brand/10 text-brandDark",
  New: "bg-brand/10 text-brandDark",
  Assigned: "bg-purple-50 text-purple-700",
  "In Progress": "bg-brand/10 text-brandDark",
  "Waiting for Resident": "bg-paper text-brandDark",
  Resolved: "bg-brand/10 text-brandDark",
  Closed: "bg-slate-100 text-slate-700",
  Escalated: "bg-paper text-brandDark"
};

const ADMIN_CATEGORIES = ["Maintenance", "Electrical", "Plumbing", "Cleaning", "Water", "WiFi", "Food", "Laundry", "Security", "Housekeeping", "AC", "Fan", "Other"];
const ADMIN_STATUSES = ["Open", "Assigned", "In Progress", "Waiting for Resident", "Resolved", "Closed", "Escalated"];

const categoryAliases = {
  Cleaning: "Room Cleaning",
  Water: "Water Supply",
  AC: "Air Conditioner"
};

const statusAliases = {
  Open: "New"
};

const priorityStyles = {
  Low: "bg-slate-100 text-slate-700",
  Medium: "bg-brand/10 text-brandDark",
  High: "bg-paper text-brandDark",
  Emergency: "bg-paper text-brandDark"
};

const currentResidentByUser = {
  "dev-user": "RES0001",
  "demo-google-guest": "RES0001",
  "demo-facebook-guest": "RES0001"
};

const wardenBranchByUser = {
  "dev-warden-wd001": "Anna Nagar"
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const displayStatus = (status) => status === "New" ? "Open" : status;

const displayCategory = (category) => {
  if (category === "Room Cleaning") return "Cleaning";
  if (category === "Water Supply") return "Water";
  if (category === "Air Conditioner") return "AC";
  return category;
};

const normalizeCategory = (category) => categoryAliases[category] || category;
const normalizeStatus = (status) => statusAliases[status] || status;

const isInDateRange = (value, range) => {
  if (!value || range === "All" || range === "Custom") return true;
  const date = new Date(`${value}T00:00:00`);
  const current = new Date(`${today}T00:00:00`);
  if (range === "Today") return date.toDateString() === current.toDateString();
  if (range === "This Week") {
    const weekStart = new Date(current);
    weekStart.setDate(current.getDate() - current.getDay());
    return date >= weekStart && date <= current;
  }
  if (range === "This Month") return date.getFullYear() === current.getFullYear() && date.getMonth() === current.getMonth();
  if (range === "This Year") return date.getFullYear() === current.getFullYear();
  return true;
};

const nowStamp = () => "2026-07-18 10:30";

const Pill = ({ value, type = "status" }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-bold ${type === "priority" ? priorityStyles[value] : statusStyles[value]}`}>
    {displayStatus(value)}
  </span>
);

const downloadCsv = (filename, columns, rows) => {
  const csv = [columns, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const Field = ({ label, required, error, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-ink">{label}{required && " *"}</span>
    {children}
    {error && <span className="mt-1 block text-xs font-semibold text-danger">{error}</span>}
  </label>
);

const Modal = ({ title, children, onClose, wide = false }) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
    <div className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white p-5 shadow-luxury ${wide ? "max-w-5xl" : "max-w-xl"}`}>
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-line pb-4">
        <h2 className="text-xl font-bold text-ink">{title}</h2>
        <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink hover:border-brandDark hover:text-brandDark">
          <X className="h-4 w-4" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const ImageUploader = ({ images, onChange, error }) => {
  const handleFiles = (event) => {
    const files = Array.from(event.target.files || []).slice(0, Math.max(0, 5 - images.length));
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => onChange((current) => [...current, reader.result].slice(0, 5));
      reader.readAsDataURL(file);
    });
    event.target.value = "";
  };

  return (
    <div>
      <span className="mb-2 block text-sm font-semibold text-ink">Upload Images</span>
      <div className="grid gap-3 sm:grid-cols-[repeat(5,minmax(0,1fr))]">
        {images.map((image, index) => (
          <div key={`${image}-${index}`} className="relative h-24 overflow-hidden rounded-xl border border-line bg-paper">
            <img src={image} alt={`Complaint upload ${index + 1}`} className="h-full w-full object-cover" />
            <button type="button" onClick={() => onChange((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-white text-danger shadow">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {images.length < 5 && (
          <label className="grid h-24 cursor-pointer place-items-center rounded-xl border border-dashed border-line bg-white text-center text-sm font-semibold text-ink hover:border-brandDark hover:text-brandDark">
            <span>
              <ImagePlus className="mx-auto mb-1 h-5 w-5" />
              Add Image
            </span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
          </label>
        )}
      </div>
      <p className="mt-2 text-xs font-medium text-slate-500">Maximum 5 images</p>
      {error && <span className="mt-1 block text-xs font-semibold text-danger">{error}</span>}
    </div>
  );
};

const RaiseComplaintModal = ({ resident, complaints, userId, onClose, onSave }) => {
  const [form, setForm] = useState({ category: "Maintenance", priority: "Medium", title: "", description: "", images: [] });
  const [errors, setErrors] = useState({});

  const submit = () => {
    const nextErrors = {};
    if (!form.category) nextErrors.category = "Complaint category is required";
    if (!form.priority) nextErrors.priority = "Priority is required";
    if (!form.title.trim()) nextErrors.title = "Title is required";
    if (!form.description.trim()) nextErrors.description = "Description is required";
    if (form.images.length > 5) nextErrors.images = "Upload up to 5 images only";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const complaint = {
      id: createComplaintId(complaints),
      userId,
      residentId: resident.id,
      residentName: resident.fullName,
      phone: resident.phone,
      branchId: resident.branchId,
      branchName: resident.branchName,
      roomNumber: resident.roomNumber,
      bedName: resident.bedName,
      category: form.category,
      priority: form.priority,
      title: form.title.trim(),
      description: form.description.trim(),
      status: "New",
      assignedWarden: resident.assignedWarden || "Unassigned",
      assignedWardenId: "",
      createdDate: today,
      images: form.images,
      comments: [],
      timeline: [
        { label: "Complaint Created", note: "Resident raised complaint", date: nowStamp() },
        { label: "Assigned to Warden", note: `Notification sent to ${resident.assignedWarden || "branch warden"}`, date: nowStamp() }
      ],
      statusHistory: ["New"],
      resolutionNotes: "",
      escalationReason: "",
      escalationDescription: "",
      residentRating: ""
    };
    onSave(complaint);
  };

  return (
    <Modal title="Raise Complaint" onClose={onClose}>
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Complaint Category" required error={errors.category}>
            <select className={fieldClass} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
              {COMPLAINT_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Priority" required error={errors.priority}>
            <select className={fieldClass} value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
              {COMPLAINT_PRIORITIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Title" required error={errors.title}>
          <input className={fieldClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        </Field>
        <Field label="Description" required error={errors.description}>
          <textarea className={textareaClass} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Room Number">
            <input className={fieldClass} value={resident.roomNumber} disabled />
          </Field>
          <Field label="Bed Number">
            <input className={fieldClass} value={resident.bedName} disabled />
          </Field>
        </div>
        <ImageUploader images={form.images} onChange={(updater) => setForm((current) => ({ ...current, images: updater(current.images) }))} error={errors.images} />
        <div className="flex justify-end gap-3 border-t border-line pt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}><Send className="h-4 w-4" /> Submit</Button>
        </div>
      </div>
    </Modal>
  );
};

const ComplaintDetails = ({ complaint, role, wardens, onClose, onComment, onStatus, onAssign, onEscalate, onRate }) => {
  const [comment, setComment] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState(complaint.resolutionNotes || "");
  const [rating, setRating] = useState(complaint.residentRating || "");
  const [assignment, setAssignment] = useState(complaint.assignedWardenId || "");
  const [escalation, setEscalation] = useState({ reason: "", description: "" });

  const branchWardens = wardens.filter((warden) => warden.branchName === complaint.branchName);
  const assignedWarden = wardens.find((warden) => warden.id === complaint.assignedWardenId || `${warden.firstName} ${warden.lastName}` === complaint.assignedWarden);
  const canWork = role === ROLES.WARDEN || role === ROLES.ADMIN;

  const submitComment = () => {
    if (!comment.trim()) return;
    onComment(complaint.id, comment.trim());
    setComment("");
  };

  return (
    <Modal title={complaint.id} onClose={onClose} wide>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">Complaint Information</p>
                <p className="mt-1 text-sm font-bold text-brand">{complaint.id}</p>
                <h3 className="mt-1 text-xl font-bold text-ink">{complaint.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{complaint.description}</p>
              </div>
              <div className="flex gap-2"><Pill value={complaint.priority} type="priority" /><Pill value={complaint.status} /></div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Created Date", formatDate(complaint.createdDate)],
                ["Branch", complaint.branchName],
                ["Room", complaint.roomNumber],
                ["Bed", complaint.bedName],
                ["Category", displayCategory(complaint.category)],
                ["Priority", complaint.priority]
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-paper p-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
                  <p className="mt-1 font-bold text-ink">{value}</p>
                </div>
              ))}
            </div>
          </Card>

          {role === ROLES.ADMIN && (
            <Card>
              <h3 className="text-lg font-bold text-ink">Resident Details</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ["Resident Name", complaint.residentName],
                  ["Resident ID", complaint.residentId],
                  ["Phone Number", complaint.phone],
                  ["Branch", complaint.branchName],
                  ["Room", complaint.roomNumber],
                  ["Bed", complaint.bedName]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-paper p-3">
                    <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
                    <p className="mt-1 font-bold text-ink">{value || "-"}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <h3 className="text-lg font-bold text-ink">Complaint Images</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {complaint.images.length ? complaint.images.map((image, index) => (
                <div key={`${image}-${index}`} className="overflow-hidden rounded-xl border border-line">
                  <img src={image} alt={`Complaint ${index + 1}`} className="h-32 w-full object-cover" />
                  <a href={image} download={`${complaint.id}-image-${index + 1}.jpg`} className="flex min-h-10 items-center justify-center gap-2 text-sm font-bold text-ink hover:text-brandDark">
                    <Download className="h-4 w-4" /> Download
                  </a>
                </div>
              )) : <p className="text-sm text-slate-500">No images uploaded.</p>}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-ink">Comments</h3>
            <div className="mt-4 space-y-3">
              {complaint.comments.map((item) => (
                <div key={item.id} className="rounded-xl bg-paper p-3">
                  <div className="flex flex-wrap justify-between gap-2 text-xs font-semibold text-slate-500">
                    <span>{item.author} · {item.role}</span>
                    <span>{item.createdAt}</span>
                  </div>
                  <p className="mt-2 text-sm text-ink">{item.message}</p>
                </div>
              ))}
              {!complaint.comments.length && <p className="text-sm text-slate-500">No comments yet.</p>}
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input className={fieldClass} placeholder="Add comment" value={comment} onChange={(event) => setComment(event.target.value)} />
                <Button onClick={submitComment}><MessageSquare className="h-4 w-4" /> Add Comments</Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <h3 className="text-lg font-bold text-ink">Timeline</h3>
            <div className="mt-4 space-y-4">
              {complaint.timeline.map((item, index) => (
                <div key={`${item.label}-${index}`} className="flex gap-3">
                  <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-bold text-ink">{item.label}</p>
                    <p className="text-sm text-slate-600">{item.note}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">{item.date} · Updated By {item.updatedBy || item.author || "System"}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-ink">Status History</h3>
            <div className="mt-3 flex flex-wrap gap-2">{complaint.statusHistory.map((item) => <Pill key={item} value={item} />)}</div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-lg font-bold text-ink">Resolution Notes</h3>
            <textarea className={textareaClass} value={resolutionNotes} disabled={!canWork} onChange={(event) => setResolutionNotes(event.target.value)} />
            {role === ROLES.USER && complaint.status === "Resolved" && (
              <div className="space-y-3">
                <Field label="Resident Rating">
                  <select className={fieldClass} value={rating} onChange={(event) => setRating(event.target.value)}>
                    <option value="">Select rating</option>
                    {[1, 2, 3, 4, 5].map((item) => <option key={item} value={item}>{item} Star{item > 1 ? "s" : ""}</option>)}
                  </select>
                </Field>
                <Button onClick={() => onRate(complaint.id, rating)} disabled={!rating}><Star className="h-4 w-4" /> Rate Resolution & Close</Button>
              </div>
            )}
            {complaint.residentRating && <p className="text-sm font-bold text-brand">Resident Rating: {complaint.residentRating} / 5</p>}
          </Card>

          {role === ROLES.ADMIN && (
            <>
              <Card>
                <h3 className="text-lg font-bold text-ink">Assigned Warden</h3>
                <div className="mt-4 flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-xl bg-paper">
                    {assignedWarden?.photo ? <img src={assignedWarden.photo} alt={complaint.assignedWarden} className="h-full w-full object-cover" /> : <UserCheck className="m-5 h-6 w-6 text-muted" />}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-ink">{complaint.assignedWarden || "Unassigned"}</p>
                    <p className="text-sm text-slate-500">{assignedWarden?.phone || "No phone available"}</p>
                    <p className="mt-1 text-sm font-semibold text-brand">{assignedWarden?.status || "Unassigned"}</p>
                  </div>
                </div>
              </Card>

              <Card className="space-y-3">
                <h3 className="text-lg font-bold text-ink">Internal Notes</h3>
                <Field label="Admin Notes"><textarea className={textareaClass} value={resolutionNotes} onChange={(event) => setResolutionNotes(event.target.value)} /></Field>
                <Field label="Warden Notes"><textarea className={textareaClass} value={complaint.comments.filter((item) => item.role === "WARDEN").map((item) => item.message).join("\n")} disabled /></Field>
                <Field label="Private Notes"><textarea className={textareaClass} placeholder="Private admin notes" /></Field>
              </Card>

              {complaint.status === "Escalated" && (
                <Card className="border-brand/20 bg-paper">
                  <h3 className="text-lg font-bold text-ink">Escalated Complaint</h3>
                  <div className="mt-4 grid gap-3">
                    <p className="text-sm"><span className="font-bold text-ink">Escalation Reason:</span> {complaint.escalationReason || "-"}</p>
                    <p className="text-sm"><span className="font-bold text-ink">Escalated By:</span> {complaint.assignedWarden || "Warden"}</p>
                    <p className="text-sm"><span className="font-bold text-ink">Escalation Date:</span> {complaint.timeline.find((item) => item.label.includes("Escalated"))?.date || "-"}</p>
                    <p className="text-sm"><span className="font-bold text-ink">Admin Action Required:</span> {complaint.escalationDescription || "Review and update status."}</p>
                  </div>
                </Card>
              )}
            </>
          )}

          {(role === ROLES.ADMIN || role === ROLES.WARDEN) && (
            <Card className="space-y-4">
              <h3 className="text-lg font-bold text-ink">Actions</h3>
              {role === ROLES.ADMIN && (
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <select className={fieldClass} value={assignment} onChange={(event) => setAssignment(event.target.value)}>
                    <option value="">Select Warden</option>
                    {branchWardens.map((warden) => <option key={warden.id} value={warden.id}>{warden.firstName} {warden.lastName}</option>)}
                  </select>
                  <Button onClick={() => onAssign(complaint.id, assignment)} disabled={!assignment}><UserCheck className="h-4 w-4" /> Assign</Button>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => onStatus(complaint.id, "In Progress", "Work started", resolutionNotes)} disabled={complaint.status === "Closed"}>Start Work</Button>
                <Button onClick={() => onStatus(complaint.id, "Resolved", resolutionNotes || "Complaint resolved", resolutionNotes)} disabled={complaint.status === "Closed"}>Mark Resolved</Button>
                {role === ROLES.ADMIN && <Button variant="secondary" onClick={() => onStatus(complaint.id, "Closed", "Closed by admin", resolutionNotes)}>Close</Button>}
              </div>
              {role === ROLES.WARDEN && (
                <div className="space-y-3 border-t border-line pt-4">
                  <Field label="Escalation Reason" required>
                    <input className={fieldClass} value={escalation.reason} onChange={(event) => setEscalation({ ...escalation, reason: event.target.value })} />
                  </Field>
                  <Field label="Description" required>
                    <textarea className={textareaClass} value={escalation.description} onChange={(event) => setEscalation({ ...escalation, description: event.target.value })} />
                  </Field>
                  <Button variant="danger" onClick={() => onEscalate(complaint.id, escalation)} disabled={!escalation.reason.trim() || !escalation.description.trim()}>
                    <ShieldAlert className="h-4 w-4" /> Escalate to Admin
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </Modal>
  );
};

const AdminActionModal = ({ action, complaint, wardens, onClose, onAssign, onStatus, onDelete }) => {
  const branchWardens = wardens.filter((warden) => warden.branchName === complaint.branchName);
  const [wardenId, setWardenId] = useState(complaint.assignedWardenId || branchWardens[0]?.id || "");
  const [status, setStatus] = useState(displayStatus(complaint.status));
  const [note, setNote] = useState("");

  if (action === "assign" || action === "reassign") {
    return (
      <Modal title={action === "assign" ? "Assign Warden" : "Reassign Warden"} onClose={onClose}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {action === "reassign" ? "Select another warden to transfer this complaint and notify both wardens." : "Only wardens from the selected branch are listed."}
          </p>
          <Field label="Select Warden" required>
            <select className={fieldClass} value={wardenId} onChange={(event) => setWardenId(event.target.value)}>
              <option value="">Select Warden</option>
              {branchWardens.map((warden) => <option key={warden.id} value={warden.id}>{warden.firstName} {warden.lastName}</option>)}
            </select>
          </Field>
          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button disabled={!wardenId} onClick={() => onAssign(complaint.id, wardenId, action === "reassign")}>
              <UserCheck className="h-4 w-4" /> {action === "reassign" ? "Reassign" : "Assign"}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  if (action === "status") {
    return (
      <Modal title="Change Status" onClose={onClose}>
        <div className="space-y-4">
          <Field label="Status" required>
            <select className={fieldClass} value={status} onChange={(event) => setStatus(event.target.value)}>
              {ADMIN_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Admin Notes">
            <textarea className={textareaClass} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add internal status notes" />
          </Field>
          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={() => onStatus(complaint.id, normalizeStatus(status), note || `Status updated to ${status}`, note)}>
              <Pencil className="h-4 w-4" /> Change Status
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  if (action === "close") {
    return (
      <Modal title="Close Complaint" onClose={onClose}>
        <div className="space-y-4">
          <p className="rounded-xl bg-paper p-4 text-sm font-semibold text-ink">Are you sure you want to close this complaint?</p>
          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={() => onStatus(complaint.id, "Closed", "Closed by admin", note)}>Close Complaint</Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Delete Complaint" onClose={onClose}>
      <div className="space-y-4">
        <p className="rounded-xl bg-paper p-4 text-sm font-semibold text-ink">
          {complaint.status === "Closed" ? "This closed complaint will be permanently deleted." : "Only closed complaints can be deleted."}
        </p>
        <div className="flex justify-end gap-3 border-t border-line pt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" disabled={complaint.status !== "Closed"} onClick={() => onDelete(complaint.id)}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const ComplaintsPage = ({ role }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState(loadComplaints);
  const residents = useMemo(loadResidents, []);
  const wardens = useMemo(loadWardens, []);
  const branches = useMemo(loadBranches, []);
  const [filters, setFilters] = useState({ search: "", branch: "All", warden: "All", category: "All", priority: "All", status: "All", dateRange: "All" });
  const [page, setPage] = useState(1);
  const [raiseOpen, setRaiseOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [adminAction, setAdminAction] = useState(null);

  const currentResident = residents.find((resident) => resident.id === currentResidentByUser[user?.id]) || residents[0];
  const wardenBranch = wardenBranchByUser[user?.id] || wardens.find((warden) => warden.email === user?.email)?.branchName || "Anna Nagar";

  const scopedComplaints = useMemo(() => {
    if (role === ROLES.USER) return complaints.filter((complaint) => complaint.userId === user?.id);
    if (role === ROLES.WARDEN) return complaints.filter((complaint) => complaint.branchName === wardenBranch);
    return complaints;
  }, [complaints, role, user?.id, wardenBranch]);

  const filteredComplaints = scopedComplaints.filter((complaint) => {
    const query = filters.search.trim().toLowerCase();
    const matchesSearch = !query || [complaint.id, complaint.residentName, complaint.phone, complaint.roomNumber, complaint.category, complaint.title].some((value) => String(value).toLowerCase().includes(query));
    const matchesBranch = filters.branch === "All" || complaint.branchName === filters.branch;
    const matchesWarden = filters.warden === "All" || complaint.assignedWarden === filters.warden;
    const matchesCategory = filters.category === "All" || complaint.category === normalizeCategory(filters.category);
    const matchesPriority = filters.priority === "All" || complaint.priority === filters.priority;
    const matchesStatus = filters.status === "All" || complaint.status === normalizeStatus(filters.status);
    const matchesDate = isInDateRange(complaint.createdDate, filters.dateRange);
    return matchesSearch && matchesBranch && matchesWarden && matchesCategory && matchesPriority && matchesStatus && matchesDate;
  });

  const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / rowsPerPage));
  const visibleRows = filteredComplaints.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const persist = (next) => {
    setComplaints(next);
    saveComplaints(next);
    if (selected) setSelected(next.find((item) => item.id === selected.id) || null);
  };

  const appendTimeline = (complaint, label, note) => ({
    ...complaint,
    timeline: [...complaint.timeline, { label, note, date: nowStamp() }],
    statusHistory: complaint.statusHistory.includes(label) ? complaint.statusHistory : [...complaint.statusHistory, label]
  });

  const createComplaint = (complaint) => {
    persist([complaint, ...complaints]);
    setRaiseOpen(false);
  };

  const updateStatus = (id, status, note, resolutionNotes = "") => {
    persist(complaints.map((complaint) => {
      if (complaint.id !== id) return complaint;
      return appendTimeline({ ...complaint, status, resolutionNotes }, status, `${note}. Resident notification queued.`);
    }));
  };

  const assignComplaint = (id, wardenId) => {
    const warden = wardens.find((item) => item.id === wardenId);
    if (!warden) return;
    persist(complaints.map((complaint) => {
      if (complaint.id !== id) return complaint;
      return appendTimeline({ ...complaint, status: "Assigned", assignedWarden: `${warden.firstName} ${warden.lastName}`, assignedWardenId: warden.id }, "Assigned", `Assigned to ${warden.firstName} ${warden.lastName}. Warden notification queued.`);
    }));
  };

  const escalateComplaint = (id, escalation) => {
    persist(complaints.map((complaint) => {
      if (complaint.id !== id) return complaint;
      return appendTimeline({
        ...complaint,
        status: "Escalated",
        escalationReason: escalation.reason.trim(),
        escalationDescription: escalation.description.trim()
      }, "Escalated", `${escalation.reason.trim()}. Admin notification queued.`);
    }));
  };

  const addComment = (id, message) => {
    persist(complaints.map((complaint) => complaint.id === id ? {
      ...complaint,
      comments: [...complaint.comments, { id: `COM-${Date.now()}`, author: user?.name || role, role, message, createdAt: nowStamp() }]
    } : complaint));
  };

  const rateComplaint = (id, rating) => {
    persist(complaints.map((complaint) => {
      if (complaint.id !== id) return complaint;
      return appendTimeline({ ...complaint, status: "Closed", residentRating: rating }, "Closed", "Resident confirmed resolution");
    }));
  };

  const deleteComplaint = (id) => {
    const complaint = complaints.find((item) => item.id === id);
    if (complaint?.status !== "Closed") return;
    persist(complaints.filter((item) => item.id !== id));
    setAdminAction(null);
  };

  const adminExportRows = filteredComplaints.map((complaint) => [
    complaint.id,
    complaint.residentName,
    complaint.branchName,
    complaint.roomNumber,
    complaint.bedName,
    displayCategory(complaint.category),
    complaint.priority,
    complaint.assignedWarden,
    displayStatus(complaint.status),
    formatDate(complaint.createdDate)
  ]);

  const resetFilters = () => {
    setFilters({ search: "", branch: "All", warden: "All", category: "All", priority: "All", status: "All", dateRange: "All" });
    setPage(1);
  };

  const stats = {
    userTotal: scopedComplaints.length,
    new: scopedComplaints.filter((item) => item.status === "New").length,
    inProgress: scopedComplaints.filter((item) => item.status === "In Progress").length,
    resolved: scopedComplaints.filter((item) => item.status === "Resolved").length,
    escalated: scopedComplaints.filter((item) => item.status === "Escalated").length,
    open: scopedComplaints.filter((item) => !["Resolved", "Closed"].includes(item.status)).length,
    closed: scopedComplaints.filter((item) => item.status === "Closed").length
  };

  const pageTitle = role === ROLES.USER ? "My Complaints" : role === ROLES.ADMIN ? "Complaints" : "Complaint Management";
  const subtitle = role === ROLES.USER ? "Raise complaints and track resolution status." : role === ROLES.WARDEN ? `Manage complaints assigned to ${wardenBranch} branch.` : "Monitor and manage complaints across all PG branches.";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{pageTitle}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        {role === ROLES.ADMIN && (
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => window.print()}><Download className="h-4 w-4" /> Export PDF</Button>
            <Button variant="secondary" onClick={() => downloadCsv("pgstay-complaints.xls", ["Complaint ID", "Resident", "Branch", "Room", "Bed", "Category", "Priority", "Assigned Warden", "Status", "Created Date"], adminExportRows)}>
              <FileDown className="h-4 w-4" /> Export Excel
            </Button>
          </div>
        )}
        {role === ROLES.USER && <Button onClick={() => setRaiseOpen(true)}><Plus className="h-4 w-4" /> Raise Complaint</Button>}
      </div>

      {role === ROLES.USER ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Complaints" value={stats.userTotal} />
          <StatCard label="Open" value={stats.open} />
          <StatCard label="Resolved" value={stats.resolved} />
          <StatCard label="Closed" value={stats.closed} />
        </div>
      ) : role === ROLES.WARDEN ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="New Complaints" value={stats.new} />
          <StatCard label="In Progress" value={stats.inProgress} />
          <StatCard label="Resolved" value={stats.resolved} />
          <StatCard label="Escalated" value={stats.escalated} />
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard label="Total Complaints" value={scopedComplaints.length} />
          <StatCard label="Open Complaints" value={stats.open} />
          <StatCard label="In Progress" value={stats.inProgress} />
          <StatCard label="Resolved" value={stats.resolved} />
          <StatCard label="Closed" value={stats.closed} />
          <StatCard label="Escalated" value={stats.escalated} />
        </div>
      )}

      <Card className="mt-5">
        <div className={`grid gap-3 ${role === ROLES.ADMIN ? "xl:grid-cols-[1.5fr_repeat(6,1fr)_auto]" : "xl:grid-cols-[1.5fr_repeat(3,1fr)_auto]"}`}>
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className={`${fieldClass} pl-11`}
              placeholder={role === ROLES.ADMIN ? "Search by complaint ID, resident, phone or room" : role === ROLES.USER ? "Search by complaint ID or title" : "Search by complaint ID, resident, room or category"}
              value={filters.search}
              onChange={(event) => { setFilters({ ...filters, search: event.target.value }); setPage(1); }}
            />
          </label>
          {role === ROLES.ADMIN && (
            <>
              <FilterSelect label="Branch" value={filters.branch} onChange={(value) => setFilters({ ...filters, branch: value })} options={["All", ...branches.map((branch) => branch.area)]} allLabel="All Branches" />
              <FilterSelect label="Assigned Warden" value={filters.warden} onChange={(value) => setFilters({ ...filters, warden: value })} options={["All", ...wardens.map((warden) => `${warden.firstName} ${warden.lastName}`)]} allLabel="All Wardens" />
            </>
          )}
          <FilterSelect label="Category" value={filters.category} onChange={(value) => setFilters({ ...filters, category: value })} options={["All", ...(role === ROLES.ADMIN ? ADMIN_CATEGORIES : COMPLAINT_CATEGORIES)]} />
          <FilterSelect label="Priority" value={filters.priority} onChange={(value) => setFilters({ ...filters, priority: value })} options={["All", ...COMPLAINT_PRIORITIES]} />
          <FilterSelect label="Status" value={filters.status} onChange={(value) => setFilters({ ...filters, status: value })} options={["All", ...(role === ROLES.ADMIN ? ADMIN_STATUSES : COMPLAINT_STATUSES)]} />
          {role === ROLES.ADMIN && <FilterSelect label="Date Range" value={filters.dateRange} onChange={(value) => setFilters({ ...filters, dateRange: value })} options={["All", "Today", "This Week", "This Month", "Custom"]} />}
          <Button variant="secondary" onClick={resetFilters}>Reset Filters</Button>
        </div>
      </Card>

      <Card className="mt-5 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-line bg-slate-50 text-slate-500">
              <tr>
                {(role === ROLES.USER
                  ? ["Complaint ID", "Title", "Category", "Priority", "Status", "Created Date", "Actions"]
                  : role === ROLES.WARDEN
                    ? ["Complaint ID", "Resident", "Room", "Category", "Priority", "Status", "Created Date", "Actions"]
                    : ["Complaint ID", "Resident", "Branch", "Room", "Bed", "Category", "Priority", "Assigned Warden", "Status", "Created Date", "Actions"]
                ).map((column) => <th key={column} className="px-4 py-3 font-semibold">{column}</th>)}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((complaint) => (
                <tr key={complaint.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-bold text-ink">{complaint.id}</td>
                  {role === ROLES.USER ? (
                    <td className="px-4 py-3 text-slate-600">{complaint.title}</td>
                  ) : (
                    <td className="px-4 py-3 font-semibold text-ink">{complaint.residentName}</td>
                  )}
                  {role === ROLES.ADMIN && <td className="px-4 py-3 text-slate-600">{complaint.branchName}</td>}
                  {role === ROLES.ADMIN && <td className="px-4 py-3 text-slate-600">{complaint.roomNumber}</td>}
                  {role === ROLES.ADMIN && <td className="px-4 py-3 text-slate-600">{complaint.bedName}</td>}
                  {role === ROLES.WARDEN && <td className="px-4 py-3 text-slate-600">{complaint.roomNumber}</td>}
                  <td className="px-4 py-3 text-slate-600">{displayCategory(complaint.category)}</td>
                  <td className="px-4 py-3"><Pill value={complaint.priority} type="priority" /></td>
                  {role === ROLES.ADMIN && <td className="px-4 py-3 text-slate-600">{complaint.assignedWarden}</td>}
                  <td className="px-4 py-3"><Pill value={complaint.status} /></td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(complaint.createdDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" className="px-3" onClick={() => setSelected(complaint)}><Eye className="h-4 w-4" /> View</Button>
                      {role === ROLES.WARDEN && <QuickWardenActions complaint={complaint} onStatus={updateStatus} onEscalate={escalateComplaint} />}
                      {role === ROLES.ADMIN && <QuickAdminActions complaint={complaint} onAction={(type) => setAdminAction({ type, complaint })} />}
                    </div>
                  </td>
                </tr>
              ))}
              {!visibleRows.length && <tr><td colSpan={role === ROLES.USER ? 7 : role === ROLES.WARDEN ? 8 : 11} className="px-4 py-8 text-center text-slate-500">No complaints match the selected filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4 text-sm text-slate-500">
          <p>Showing {visibleRows.length} of {filteredComplaints.length} complaints</p>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</Button>
            <span className="grid min-h-11 place-items-center rounded-xl border border-line px-4 font-semibold text-ink">{page} / {totalPages}</span>
            <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</Button>
          </div>
        </div>
      </Card>

      <Card className="mt-5 border-brand/30 bg-brand/5">
        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-ink">
          <AlertTriangle className="h-4 w-4 text-brand" />
          Notifications are queued on complaint creation, status changes, and escalation.
        </div>
      </Card>

      {raiseOpen && <RaiseComplaintModal resident={currentResident} complaints={complaints} userId={user?.id || "dev-user"} onClose={() => setRaiseOpen(false)} onSave={createComplaint} />}
      {selected && (
        <ComplaintDetails
          complaint={selected}
          role={role}
          wardens={wardens}
          onClose={() => setSelected(null)}
          onComment={addComment}
          onStatus={updateStatus}
          onAssign={assignComplaint}
          onEscalate={escalateComplaint}
          onRate={rateComplaint}
        />
      )}
      {adminAction && (
        <AdminActionModal
          action={adminAction.type}
          complaint={adminAction.complaint}
          wardens={wardens}
          onClose={() => setAdminAction(null)}
          onAssign={(id, wardenId) => {
            assignComplaint(id, wardenId);
            setAdminAction(null);
          }}
          onStatus={(id, status, note, resolutionNotes) => {
            updateStatus(id, status, note, resolutionNotes);
            setAdminAction(null);
          }}
          onDelete={deleteComplaint}
        />
      )}
    </div>
  );
};

const FilterSelect = ({ label, value, onChange, options, allLabel = "All" }) => (
  <select aria-label={label} className={fieldClass} value={value} onChange={(event) => onChange(event.target.value)}>
    {options.map((option) => <option key={option} value={option}>{option === "All" ? allLabel : option}</option>)}
  </select>
);

const QuickWardenActions = ({ complaint, onStatus, onEscalate }) => (
  <>
    <Button variant="secondary" className="px-3" disabled={complaint.status === "Closed"} onClick={() => onStatus(complaint.id, "Assigned", "Assigned to warden")}>Assign</Button>
    <Button variant="secondary" className="px-3" disabled={complaint.status === "Closed"} onClick={() => onStatus(complaint.id, "In Progress", "Work started")}>Start Work</Button>
    <Button variant="secondary" className="px-3" disabled={complaint.status === "Closed"} onClick={() => onStatus(complaint.id, "Resolved", "Complaint resolved")}>Resolve</Button>
    <Button variant="danger" className="px-3" disabled={complaint.status === "Closed"} onClick={() => onEscalate(complaint.id, { reason: "Needs admin approval", description: "Escalated from warden quick action." })}>Escalate</Button>
  </>
);

const QuickAdminActions = ({ complaint, onAction }) => (
  <>
    <Button variant="secondary" className="px-3" disabled={complaint.status === "Closed"} onClick={() => onAction("assign")}>Assign Warden</Button>
    <Button variant="secondary" className="px-3" disabled={complaint.status === "Closed"} onClick={() => onAction("reassign")}>Reassign Warden</Button>
    <Button variant="secondary" className="px-3" disabled={complaint.status === "Closed"} onClick={() => onAction("status")}>Change Status</Button>
    <Button variant="secondary" className="px-3" disabled={complaint.status === "Closed"} onClick={() => onAction("close")}>Close Complaint</Button>
    <Button variant="danger" className="px-3" disabled={complaint.status !== "Closed"} onClick={() => onAction("delete")}>Delete</Button>
  </>
);

export default ComplaintsPage;
