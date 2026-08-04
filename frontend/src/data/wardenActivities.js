export const WARDEN_ACTIVITY_STORAGE_KEY = "pg_warden_activities";
export const WARDEN_ACTIVITY_EVENT = "pg:warden-activities-updated";

const allowedBranches = new Set(["anna-nagar", "virugambakkam"]);

export const loadWardenActivities = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(WARDEN_ACTIVITY_STORAGE_KEY) || "[]");
    return stored.filter((item) => allowedBranches.has(item.branchId)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch {
    return [];
  }
};

export const saveWardenActivities = (activities) => {
  const scoped = activities.filter((item) => allowedBranches.has(item.branchId)).slice(0, 100);
  localStorage.setItem(WARDEN_ACTIVITY_STORAGE_KEY, JSON.stringify(scoped));
  window.dispatchEvent(new CustomEvent(WARDEN_ACTIVITY_EVENT, { detail: scoped }));
  return scoped;
};

export const recordWardenActivity = (activity) => saveWardenActivities([
  {
    id: `WACT-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...activity
  },
  ...loadWardenActivities()
]);
