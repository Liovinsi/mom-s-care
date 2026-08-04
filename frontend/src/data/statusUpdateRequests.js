export const STATUS_UPDATE_REQUESTS_KEY = "pg_status_update_requests";
export const STATUS_UPDATE_REQUESTS_EVENT = "pg:status-update-requests-updated";

export const REQUEST_STATUSES = ["Pending Approval", "Approved", "Rejected"];

export const loadStatusUpdateRequests = () => {
  try {
    return JSON.parse(localStorage.getItem(STATUS_UPDATE_REQUESTS_KEY) || "[]")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch {
    return [];
  }
};

export const saveStatusUpdateRequests = (requests) => {
  localStorage.setItem(STATUS_UPDATE_REQUESTS_KEY, JSON.stringify(requests));
  window.dispatchEvent(new CustomEvent(STATUS_UPDATE_REQUESTS_EVENT, { detail: requests }));
  return requests;
};

export const createStatusUpdateRequest = (request) => {
  const requests = loadStatusUpdateRequests();
  const { reason: _discardedReason, ...requestWithoutReason } = request;
  const nextNumber = requests.reduce((max, item) => Math.max(max, Number(String(item.id).replace(/\D/g, "")) || 0), 0) + 1;
  const createdAt = new Date().toISOString();
  const next = {
    id: `UR-${String(nextNumber).padStart(6, "0")}`,
    status: "Pending Approval",
    createdAt,
    actionHistory: [{ action: "Requested", by: request.wardenName, at: createdAt }],
    ...requestWithoutReason
  };
  saveStatusUpdateRequests([next, ...requests]);
  return next;
};

export const updateStatusUpdateRequest = (id, changes, historyEntry) => {
  const next = loadStatusUpdateRequests().map((request) => request.id === id ? {
    ...request,
    ...changes,
    actionHistory: historyEntry ? [...(request.actionHistory || []), historyEntry] : request.actionHistory
  } : request);
  saveStatusUpdateRequests(next);
  return next.find((request) => request.id === id);
};
