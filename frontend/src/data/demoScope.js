export const DEMO_BRANCHES = [
  { id: "anna-nagar", publicId: "anna-nagar-pg", name: "Anna Nagar" },
  { id: "virugambakkam", publicId: "virugambakkam-pg", name: "Virugambakkam" }
];

export const DEMO_BRANCH_IDS = new Set(DEMO_BRANCHES.map((branch) => branch.id));
export const DEMO_PUBLIC_BRANCH_IDS = new Set(DEMO_BRANCHES.map((branch) => branch.publicId));

export const inDemoScope = (record) => DEMO_BRANCH_IDS.has(record?.branchId);
export const scopeDemoRecords = (records = []) => records.filter(inDemoScope);

const SCOPE_VERSION_KEY = "pg_demo_scope_version";
const SCOPE_VERSION = "two-branch-v1";
const LEGACY_DEMO_KEYS = [
  "pg_admin_branches",
  "pg_admin_rooms",
  "pg_admin_beds",
  "pg_admin_wardens",
  "pg_admin_residents",
  "pg_admin_bookings",
  "pg_admin_payments",
  "pg_complaints",
  "pg_payment_notifications",
  "pg_payment_rent_due_config"
];

export const initializeDemoScope = () => {
  if (localStorage.getItem(SCOPE_VERSION_KEY) === SCOPE_VERSION) return;
  LEGACY_DEMO_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.setItem(SCOPE_VERSION_KEY, SCOPE_VERSION);
};

initializeDemoScope();
