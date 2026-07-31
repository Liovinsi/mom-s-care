export const colors = {
  paper: "#FFF4F6",
  ink: "#1F2937",
  indigo: "#3B2A2E",
  rose: "#DD5E67",
  moss: "#DD5E67",
  clay: "#D12233"
};

export const fonts = {
  display: '"Fraunces", serif',
  body: '"Inter", system-ui, sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, monospace'
};

export const bedStatusStyles = {
  available: {
    label: "Available",
    background: "bg-brand/10",
    border: "border-brand/30",
    text: "text-brandDark",
    color: colors.rose
  },
  held: {
    label: "Held",
    background: "bg-brand/10",
    border: "border-brand/30",
    text: "text-brandDark",
    color: colors.rose
  },
  booked: {
    label: "Booked",
    background: "bg-brand/10",
    border: "border-brand/30",
    text: "text-brandDark",
    color: colors.rose
  },
  occupied: {
    label: "Occupied",
    background: "bg-paper",
    border: "border-brand/30",
    text: "text-brandDark",
    color: colors.clay
  },
  maintenance: {
    label: "Maintenance",
    background: "bg-slate-100",
    border: "border-slate-300",
    text: "text-slate-700",
    color: "#64748B"
  }
};

export const bookingStatusStyles = {
  pending: {
    label: "Pending",
    background: "bg-brand/10",
    text: "text-brandDark",
    color: colors.rose
  },
  approved: {
    label: "Approved",
    background: "bg-brand/10",
    text: "text-brandDark",
    color: colors.rose
  },
  rejected: {
    label: "Rejected",
    background: "bg-paper",
    text: "text-brandDark",
    color: colors.clay
  },
  checked_in: {
    label: "Checked in",
    background: "bg-brand/10",
    text: "text-brandDark",
    color: colors.rose
  }
};
