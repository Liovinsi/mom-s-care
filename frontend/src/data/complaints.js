export const COMPLAINT_STORAGE_KEY = "pg_complaints";

export const COMPLAINT_CATEGORIES = [
  "Electrical",
  "Plumbing",
  "Cleaning",
  "Furniture",
  "WiFi",
  "Water",
  "Security",
  "Other"
];

export const COMPLAINT_PRIORITIES = ["Low", "Medium", "High", "Urgent"];
export const COMPLAINT_STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

const issueImage = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=82`;

export const defaultComplaints = [
  {
    id: "CMP0001",
    userId: "dev-user",
    residentId: "RES0001",
    residentName: "Rahul Kumar",
    phone: "9876542101",
    branchId: "anna-nagar",
    branchName: "Anna Nagar",
    roomNumber: "101",
    bedName: "Bed A",
    category: "Electrical",
    priority: "High",
    title: "Tube light flickering near study table",
    description: "The main tube light keeps flickering in the evening and needs inspection.",
    status: "In Progress",
    assignedWarden: "Arun Kumar",
    assignedWardenId: "WD001",
    createdDate: "2026-07-15",
    images: [issueImage("photo-1621905252507-b35492cc74b4")],
    comments: [
      { id: "COM-1", author: "Rahul Kumar", role: "USER", message: "Please check this today if possible.", createdAt: "2026-07-15 09:30" },
      { id: "COM-2", author: "Arun Kumar", role: "WARDEN", message: "Electrician has been informed.", createdAt: "2026-07-15 11:10" }
    ],
    timeline: [
      { label: "Complaint Created", note: "Resident raised complaint", date: "2026-07-15 09:15" },
      { label: "Assigned to Warden", note: "Assigned to Arun Kumar", date: "2026-07-15 09:45" },
      { label: "In Progress", note: "Warden started work", date: "2026-07-15 11:00" }
    ],
    statusHistory: ["New", "Assigned", "In Progress"],
    resolutionNotes: "",
    escalationReason: "",
    escalationDescription: "",
    residentRating: ""
  },
  {
    id: "CMP0002",
    userId: "dev-user",
    residentId: "RES0001",
    residentName: "Rahul Kumar",
    phone: "9876542101",
    branchId: "anna-nagar",
    branchName: "Anna Nagar",
    roomNumber: "101",
    bedName: "Bed A",
    category: "WiFi",
    priority: "Medium",
    title: "WiFi speed is low",
    description: "Internet is unstable during evening study hours.",
    status: "Resolved",
    assignedWarden: "Priya Raman",
    assignedWardenId: "WD003",
    createdDate: "2026-07-12",
    images: [],
    comments: [{ id: "COM-3", author: "Priya Raman", role: "WARDEN", message: "Router was restarted and tested.", createdAt: "2026-07-12 18:40" }],
    timeline: [
      { label: "Complaint Created", note: "Resident raised complaint", date: "2026-07-12 17:00" },
      { label: "Assigned to Warden", note: "Assigned to Priya Raman", date: "2026-07-12 17:20" },
      { label: "Resolved", note: "Network restored", date: "2026-07-12 18:45" }
    ],
    statusHistory: ["New", "Assigned", "Resolved"],
    resolutionNotes: "Router was restarted and connection speed verified.",
    escalationReason: "",
    escalationDescription: "",
    residentRating: ""
  },
  {
    id: "CMP0003",
    userId: "resident-priya",
    residentId: "RES0002",
    residentName: "Priya Sharma",
    phone: "9876542102",
    branchId: "velachery",
    branchName: "Velachery",
    roomNumber: "302",
    bedName: "Bed C",
    category: "Room Cleaning",
    priority: "Low",
    title: "Deep cleaning required before move-in",
    description: "Room needs a deep clean before check-in completion.",
    status: "New",
    assignedWarden: "Karthik Raj",
    assignedWardenId: "WD002",
    createdDate: "2026-07-17",
    images: [issueImage("photo-1581578731548-c64695cc6952")],
    comments: [],
    timeline: [{ label: "Complaint Created", note: "Resident raised complaint", date: "2026-07-17 10:05" }],
    statusHistory: ["New"],
    resolutionNotes: "",
    escalationReason: "",
    escalationDescription: "",
    residentRating: ""
  },
  {
    id: "CMP0004",
    userId: "resident-naveen",
    residentId: "RES0004",
    residentName: "Naveen Raj",
    phone: "9876542103",
    branchId: "tambaram",
    branchName: "Tambaram",
    roomNumber: "201",
    bedName: "Bed B",
    category: "Water Supply",
    priority: "Emergency",
    title: "No water in bathroom",
    description: "Bathroom water supply stopped this morning.",
    status: "Escalated",
    assignedWarden: "Ramesh Babu",
    assignedWardenId: "WD006",
    createdDate: "2026-07-18",
    images: [],
    comments: [{ id: "COM-4", author: "Ramesh Babu", role: "WARDEN", message: "Motor issue needs admin approval for immediate repair.", createdAt: "2026-07-18 08:35" }],
    timeline: [
      { label: "Complaint Created", note: "Resident raised complaint", date: "2026-07-18 07:50" },
      { label: "Assigned to Warden", note: "Assigned to Ramesh Babu", date: "2026-07-18 08:05" },
      { label: "Escalated to Admin", note: "Motor replacement approval required", date: "2026-07-18 08:40" }
    ],
    statusHistory: ["New", "Assigned", "Escalated"],
    resolutionNotes: "",
    escalationReason: "Vendor Approval",
    escalationDescription: "Water motor needs replacement approval from admin.",
    residentRating: ""
  }
];

export const loadComplaints = () => {
  const stored = localStorage.getItem(COMPLAINT_STORAGE_KEY);
  const allowed = new Set(["anna-nagar", "virugambakkam"]);
  return (stored ? JSON.parse(stored) : defaultComplaints)
    .filter((complaint) => allowed.has(complaint.branchId))
    .map((complaint) => ({
      ...complaint,
      category: complaint.category === "Room Cleaning" ? "Cleaning" : complaint.category === "Water Supply" ? "Water" : complaint.category,
      priority: complaint.priority === "Emergency" ? "Urgent" : complaint.priority,
      status: ["New", "Assigned"].includes(complaint.status) ? "Open" : complaint.status === "Escalated" ? "In Progress" : complaint.status
    }));
};

export const saveComplaints = (complaints) => {
  const allowed = new Set(["anna-nagar", "virugambakkam"]);
  const scoped = complaints.filter((complaint) => allowed.has(complaint.branchId));
  localStorage.setItem(COMPLAINT_STORAGE_KEY, JSON.stringify(scoped));
  window.dispatchEvent(new CustomEvent("pg:complaints-updated", { detail: scoped }));
};

export const createComplaintId = (complaints) => {
  const max = complaints.reduce((value, complaint) => Math.max(value, Number(complaint.id.replace(/\D/g, "") || 0)), 0);
  return `CMP${String(max + 1).padStart(4, "0")}`;
};
