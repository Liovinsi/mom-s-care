export const colors = {
  paper: "#F1F4F2",
  ink: "#1B2B2A",
  indigo: "#2C4A52",
  marigold: "#E3A73B",
  moss: "#4C8C6B",
  clay: "#C15B3E"
};

export const fonts = {
  display: '"Fraunces", serif',
  body: '"Inter", system-ui, sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, monospace'
};

export const bedStatusStyles = {
  available: {
    label: "Available",
    background: "bg-emerald-50",
    border: "border-emerald-300",
    text: "text-emerald-800",
    color: colors.moss
  },
  held: {
    label: "Held",
    background: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-800",
    color: colors.marigold
  },
  booked: {
    label: "Booked",
    background: "bg-sky-50",
    border: "border-sky-300",
    text: "text-sky-800",
    color: colors.indigo
  },
  occupied: {
    label: "Occupied",
    background: "bg-orange-50",
    border: "border-orange-300",
    text: "text-orange-800",
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
    background: "bg-amber-50",
    text: "text-amber-800",
    color: colors.marigold
  },
  approved: {
    label: "Approved",
    background: "bg-emerald-50",
    text: "text-emerald-800",
    color: colors.moss
  },
  rejected: {
    label: "Rejected",
    background: "bg-red-50",
    text: "text-red-800",
    color: colors.clay
  },
  checked_in: {
    label: "Checked in",
    background: "bg-sky-50",
    text: "text-sky-800",
    color: colors.indigo
  }
};
