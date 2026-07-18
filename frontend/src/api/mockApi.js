import { computeAmountDue } from "../lib/computeAmountDue";

const delay = (value, ms = 100 + Math.floor(Math.random() * 401)) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(clone(value)), ms);
  });

const rejectAfterDelay = (message, ms = 100 + Math.floor(Math.random() * 401)) =>
  new Promise((_resolve, reject) => {
    window.setTimeout(() => reject(new Error(message)), ms);
  });

const clone = (value) => JSON.parse(JSON.stringify(value));
const now = () => new Date().toISOString();
const newId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const branches = [
  {
    branch_id: "branch_aurelia_indiranagar",
    name: "The Aurelia House",
    code: "AUR-IND",
    address: "12 7th Main, Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    description: "Premium managed PG with chef meals, ensuite rooms, and a quiet study lounge.",
    amenities: ["Chef Meals", "Wi-Fi", "Housekeeping", "CCTV"],
    images: ["https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80"],
    is_active: true
  },
  {
    branch_id: "branch_maison_gachibowli",
    name: "Maison Gold Coliving",
    code: "MAI-GAC",
    address: "Financial District Road, Gachibowli",
    city: "Hyderabad",
    state: "Telangana",
    description: "Modern coliving branch near IT parks with serviced rooms and power backup.",
    amenities: ["Fitness Studio", "Laundry", "Power Backup", "AC"],
    images: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80"],
    is_active: true
  }
];

const rooms = [
  {
    room_id: "room_aurelia_204",
    branch_id: "branch_aurelia_indiranagar",
    name: "Aurelia 204",
    floor: "2",
    ac_type: "ac",
    sharing_type: 4,
    monthly_rent: 18500,
    deposit_amount: 37000,
    token_amount: 2500,
    amenities: ["Ensuite Bathroom", "Study Table", "Wardrobe", "Wi-Fi"],
    images: ["https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80"],
    is_active: true
  },
  {
    room_id: "room_aurelia_108",
    branch_id: "branch_aurelia_indiranagar",
    name: "Aurelia 108",
    floor: "1",
    ac_type: "non_ac",
    sharing_type: 3,
    monthly_rent: 14800,
    deposit_amount: 29600,
    token_amount: 2000,
    amenities: ["Balcony", "Study Table", "Wardrobe"],
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80"],
    is_active: true
  },
  {
    room_id: "room_maison_301",
    branch_id: "branch_maison_gachibowli",
    name: "Maison 301",
    floor: "3",
    ac_type: "ac",
    sharing_type: 2,
    monthly_rent: 16900,
    deposit_amount: 33800,
    token_amount: 2500,
    amenities: ["AC", "Fitness Access", "Housekeeping"],
    images: ["https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80"],
    is_active: true
  }
];

const beds = [
  {
    bed_id: "bed_a204_a1",
    branch_id: "branch_aurelia_indiranagar",
    room_id: "room_aurelia_204",
    label: "A1",
    position: { row: 1, col: 1 },
    status: "available",
    current_guest_id: null,
    hold_id: null,
    hold_expires_at: null
  },
  {
    bed_id: "bed_a204_a2",
    branch_id: "branch_aurelia_indiranagar",
    room_id: "room_aurelia_204",
    label: "A2",
    position: { row: 1, col: 2 },
    status: "held",
    current_guest_id: "guest_isha",
    hold_id: "hold_seed_isha",
    hold_expires_at: "2026-07-16T12:45:00.000Z"
  },
  {
    bed_id: "bed_a204_b1",
    branch_id: "branch_aurelia_indiranagar",
    room_id: "room_aurelia_204",
    label: "B1",
    position: { row: 2, col: 1 },
    status: "booked",
    current_guest_id: "guest_rohan",
    hold_id: null,
    hold_expires_at: null
  },
  {
    bed_id: "bed_a204_b2",
    branch_id: "branch_aurelia_indiranagar",
    room_id: "room_aurelia_204",
    label: "B2",
    position: { row: 2, col: 2 },
    status: "occupied",
    current_guest_id: "guest_ananya",
    hold_id: null,
    hold_expires_at: null
  },
  {
    bed_id: "bed_a108_a1",
    branch_id: "branch_aurelia_indiranagar",
    room_id: "room_aurelia_108",
    label: "A1",
    position: { row: 1, col: 1 },
    status: "maintenance",
    current_guest_id: null,
    hold_id: null,
    hold_expires_at: null
  },
  {
    bed_id: "bed_m301_a1",
    branch_id: "branch_maison_gachibowli",
    room_id: "room_maison_301",
    label: "A1",
    position: { row: 1, col: 1 },
    status: "available",
    current_guest_id: null,
    hold_id: null,
    hold_expires_at: null
  }
];

const guests = [
  {
    guest_id: "guest_demo_google",
    name: "Google Guest",
    email: "guest.google@example.com",
    phone: "+91 98765 43210",
    provider: "google",
    avatar_url: ""
  },
  {
    guest_id: "guest_isha",
    name: "Isha Nair",
    email: "isha@example.com",
    phone: "+91 90000 11111",
    provider: "google",
    avatar_url: ""
  },
  {
    guest_id: "guest_rohan",
    name: "Rohan Mehta",
    email: "rohan@example.com",
    phone: "+91 90000 22222",
    provider: "facebook",
    avatar_url: ""
  },
  {
    guest_id: "guest_ananya",
    name: "Ananya Rao",
    email: "ananya@example.com",
    phone: "+91 90000 33333",
    provider: "google",
    avatar_url: ""
  }
];

const staffUsers = [
  {
    staff_user_id: "staff_warden_aurelia",
    name: "Aurelia Warden",
    email: "warden@basera.local",
    password: "Warden@123",
    role: "warden",
    branch_id: "branch_aurelia_indiranagar",
    is_active: true
  },
  {
    staff_user_id: "staff_super_admin",
    name: "Super Admin",
    email: "super@basera.local",
    password: "Admin@123",
    role: "super_admin",
    branch_id: null,
    is_active: true
  }
];

const bookings = [
  {
    booking_id: "booking_pending_isha",
    guest_id: "guest_isha",
    branch_id: "branch_aurelia_indiranagar",
    room_id: "room_aurelia_204",
    bed_id: "bed_a204_a2",
    move_in_date: "2026-07-20",
    status: "pending",
    monthly_rent: 18500,
    deposit_amount: 37000,
    token_amount: 2500,
    document_filenames: ["aadhaar-isha.pdf"],
    created_at: "2026-07-16T09:30:00.000Z",
    updated_at: "2026-07-16T09:30:00.000Z"
  },
  {
    booking_id: "booking_approved_rohan",
    guest_id: "guest_rohan",
    branch_id: "branch_aurelia_indiranagar",
    room_id: "room_aurelia_204",
    bed_id: "bed_a204_b1",
    move_in_date: "2026-07-18",
    status: "approved",
    monthly_rent: 18500,
    deposit_amount: 37000,
    token_amount: 2500,
    document_filenames: ["aadhaar-rohan.pdf", "offer-letter-rohan.pdf"],
    created_at: "2026-07-14T11:00:00.000Z",
    updated_at: "2026-07-15T10:20:00.000Z"
  },
  {
    booking_id: "booking_rejected_demo",
    guest_id: "guest_demo_google",
    branch_id: "branch_maison_gachibowli",
    room_id: "room_maison_301",
    bed_id: "bed_m301_a1",
    move_in_date: "2026-07-22",
    status: "rejected",
    monthly_rent: 16900,
    deposit_amount: 33800,
    token_amount: 2500,
    document_filenames: ["id-demo.pdf"],
    created_at: "2026-07-12T08:45:00.000Z",
    updated_at: "2026-07-13T16:10:00.000Z"
  },
  {
    booking_id: "booking_checked_in_ananya",
    guest_id: "guest_ananya",
    branch_id: "branch_aurelia_indiranagar",
    room_id: "room_aurelia_204",
    bed_id: "bed_a204_b2",
    move_in_date: "2026-07-10",
    status: "checked_in",
    monthly_rent: 18500,
    deposit_amount: 37000,
    token_amount: 2500,
    document_filenames: ["aadhaar-ananya.pdf"],
    created_at: "2026-07-08T10:15:00.000Z",
    updated_at: "2026-07-10T09:00:00.000Z"
  }
];

const payments = [
  {
    payment_id: "payment_isha_token",
    booking_id: "booking_pending_isha",
    guest_id: "guest_isha",
    branch_id: "branch_aurelia_indiranagar",
    amount: 2500,
    method: "upi",
    status: "paid",
    reference: "UPI-ISHA-2500",
    paid_at: "2026-07-16T09:35:00.000Z"
  },
  {
    payment_id: "payment_rohan_token",
    booking_id: "booking_approved_rohan",
    guest_id: "guest_rohan",
    branch_id: "branch_aurelia_indiranagar",
    amount: 2500,
    method: "upi",
    status: "paid",
    reference: "UPI-ROHAN-2500",
    paid_at: "2026-07-14T11:05:00.000Z"
  },
  {
    payment_id: "payment_ananya_initial",
    booking_id: "booking_checked_in_ananya",
    guest_id: "guest_ananya",
    branch_id: "branch_aurelia_indiranagar",
    amount: 20500,
    method: "card",
    status: "paid",
    reference: "CARD-ANANYA-20500",
    paid_at: "2026-07-10T09:05:00.000Z"
  }
];

const complaints = [
  {
    complaint_id: "complaint_wifi_isha",
    guest_id: "guest_isha",
    branch_id: "branch_aurelia_indiranagar",
    room_id: "room_aurelia_204",
    bed_id: "bed_a204_a2",
    title: "Wi-Fi instability",
    description: "Wi-Fi drops frequently near the study desk.",
    status: "open",
    created_at: "2026-07-16T10:00:00.000Z",
    updated_at: "2026-07-16T10:00:00.000Z"
  }
];

const holds = [
  {
    hold_id: "hold_seed_isha",
    bed_id: "bed_a204_a2",
    guest_id: "guest_isha",
    document_filenames: ["aadhaar-isha.pdf"],
    expires_at: "2026-07-16T12:45:00.000Z"
  }
];

const paymentOrders = [];

const getRoom = (roomId) => rooms.find((room) => room.room_id === roomId);
const getBed = (bedId) => beds.find((bed) => bed.bed_id === bedId);
const getBookingPayments = (bookingId) => payments.filter((payment) => payment.booking_id === bookingId);

export const listBranches = () => delay(branches.filter((branch) => branch.is_active));

export const listRooms = (filters = {}) => {
  const result = rooms.filter((room) => {
    if (!room.is_active) return false;
    if (filters.branch_id && room.branch_id !== filters.branch_id) return false;
    if (filters.ac_type && room.ac_type !== filters.ac_type) return false;
    if (filters.sharing_type && room.sharing_type !== Number(filters.sharing_type)) return false;
    return true;
  });

  return delay(result);
};

export const listBeds = (roomId) => delay(beds.filter((bed) => bed.room_id === roomId));

export const holdBed = (bedId, guestId) => {
  const bed = getBed(bedId);
  if (!bed || bed.status !== "available" || Math.random() < 0.1) {
    return rejectAfterDelay("Bed is no longer available.");
  }

  const holdId = newId("hold");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  bed.status = "held";
  bed.current_guest_id = guestId;
  bed.hold_id = holdId;
  bed.hold_expires_at = expiresAt;
  holds.push({ hold_id: holdId, bed_id: bedId, guest_id: guestId, document_filenames: [], expires_at: expiresAt });

  return delay({ hold_id: holdId, bed: clone(bed), expires_at: expiresAt });
};

export const uploadDocument = (holdId, file) => {
  const hold = holds.find((item) => item.hold_id === holdId);
  if (!hold) return rejectAfterDelay("Hold not found.");

  const filename = typeof file === "string" ? file : file?.name;
  if (!filename) return rejectAfterDelay("Document filename is required.");

  hold.document_filenames.push(filename);
  return delay({ hold_id: holdId, document_filenames: hold.document_filenames });
};

export const createPaymentOrder = (holdId) => {
  const hold = holds.find((item) => item.hold_id === holdId);
  if (!hold) return rejectAfterDelay("Hold not found.");

  const bed = getBed(hold.bed_id);
  const room = getRoom(bed?.room_id);
  if (!bed || !room) return rejectAfterDelay("Held bed details not found.");

  const order = {
    order_id: newId("order"),
    hold_id: holdId,
    amount: room.token_amount,
    currency: "INR",
    status: "created"
  };
  paymentOrders.push(order);

  return delay(order);
};

export const verifyPayment = (orderId) => {
  const order = paymentOrders.find((item) => item.order_id === orderId);
  if (!order) return rejectAfterDelay("Payment order not found.");

  const hold = holds.find((item) => item.hold_id === order.hold_id);
  const bed = getBed(hold?.bed_id);
  const room = getRoom(bed?.room_id);
  if (!hold || !bed || !room) return rejectAfterDelay("Hold could not be verified.");

  order.status = "paid";
  bed.status = "booked";
  bed.hold_id = null;
  bed.hold_expires_at = null;

  const timestamp = now();
  const booking = {
    booking_id: newId("booking"),
    guest_id: hold.guest_id,
    branch_id: bed.branch_id,
    room_id: bed.room_id,
    bed_id: bed.bed_id,
    move_in_date: timestamp.slice(0, 10),
    status: "pending",
    monthly_rent: room.monthly_rent,
    deposit_amount: room.deposit_amount,
    token_amount: room.token_amount,
    document_filenames: hold.document_filenames,
    created_at: timestamp,
    updated_at: timestamp
  };
  bookings.push(booking);
  payments.push({
    payment_id: newId("payment"),
    booking_id: booking.booking_id,
    guest_id: booking.guest_id,
    branch_id: booking.branch_id,
    amount: room.token_amount,
    method: "mock",
    status: "paid",
    reference: order.order_id,
    paid_at: timestamp
  });

  return delay({ booking, bed: clone(bed), order });
};

export const listGuestBookings = (guestId) => {
  const result = bookings
    .filter((booking) => booking.guest_id === guestId)
    .map((booking) => ({
      ...booking,
      branch: branches.find((branch) => branch.branch_id === booking.branch_id),
      room: rooms.find((room) => room.room_id === booking.room_id),
      bed: beds.find((bed) => bed.bed_id === booking.bed_id),
      payments: getBookingPayments(booking.booking_id),
      amount_due: computeAmountDue(booking, payments)
    }));

  return delay(result);
};

export const listPendingBookings = () => {
  const result = bookings
    .filter((booking) => booking.status === "pending")
    .map((booking) => ({
      ...booking,
      guest: guests.find((guest) => guest.guest_id === booking.guest_id),
      branch: branches.find((branch) => branch.branch_id === booking.branch_id),
      room: rooms.find((room) => room.room_id === booking.room_id),
      bed: beds.find((bed) => bed.bed_id === booking.bed_id),
      payments: getBookingPayments(booking.booking_id)
    }));

  return delay(result);
};

export const approveBooking = (id) => {
  const booking = bookings.find((item) => item.booking_id === id);
  if (!booking) return rejectAfterDelay("Booking not found.");

  booking.status = "approved";
  booking.updated_at = now();
  return delay(booking);
};

export const rejectBooking = (id) => {
  const booking = bookings.find((item) => item.booking_id === id);
  if (!booking) return rejectAfterDelay("Booking not found.");

  booking.status = "rejected";
  booking.updated_at = now();

  const bed = getBed(booking.bed_id);
  if (bed && bed.status !== "occupied") {
    bed.status = "available";
    bed.current_guest_id = null;
    bed.hold_id = null;
    bed.hold_expires_at = null;
  }

  return delay({ booking, bed });
};

export const listWardenBookings = (branchId) => {
  const result = bookings
    .filter((booking) => booking.branch_id === branchId && ["approved", "checked_in"].includes(booking.status))
    .map((booking) => ({
      ...booking,
      guest: guests.find((guest) => guest.guest_id === booking.guest_id),
      room: rooms.find((room) => room.room_id === booking.room_id),
      bed: beds.find((bed) => bed.bed_id === booking.bed_id),
      payments: getBookingPayments(booking.booking_id),
      amount_due: computeAmountDue(booking, payments)
    }));

  return delay(result);
};

export const checkInGuest = (bookingId) => {
  const booking = bookings.find((item) => item.booking_id === bookingId);
  if (!booking) return rejectAfterDelay("Booking not found.");

  const bed = getBed(booking.bed_id);
  booking.status = "checked_in";
  booking.updated_at = now();
  if (bed) bed.status = "occupied";

  return delay({ booking, bed });
};

export const logPayment = (bookingId, amount, method = "cash") => {
  const booking = bookings.find((item) => item.booking_id === bookingId);
  if (!booking) return rejectAfterDelay("Booking not found.");

  const payment = {
    payment_id: newId("payment"),
    booking_id: bookingId,
    guest_id: booking.guest_id,
    branch_id: booking.branch_id,
    amount: Number(amount),
    method,
    status: "paid",
    reference: `MANUAL-${Date.now()}`,
    paid_at: now()
  };
  payments.push(payment);

  return delay({ payment, amount_due: computeAmountDue(booking, payments) });
};

export const createComplaint = ({ guest_id, branch_id, room_id = null, bed_id = null, title, description }) => {
  const timestamp = now();
  const complaint = {
    complaint_id: newId("complaint"),
    guest_id,
    branch_id,
    room_id,
    bed_id,
    title,
    description,
    status: "open",
    created_at: timestamp,
    updated_at: timestamp
  };
  complaints.push(complaint);

  return delay(complaint);
};

export const listComplaints = (filters = {}) => {
  const result = complaints.filter((complaint) => {
    if (filters.branch_id && complaint.branch_id !== filters.branch_id) return false;
    if (filters.guest_id && complaint.guest_id !== filters.guest_id) return false;
    if (filters.status && complaint.status !== filters.status) return false;
    return true;
  });

  return delay(result);
};

export const updateComplaintStatus = (id, status) => {
  const complaint = complaints.find((item) => item.complaint_id === id);
  if (!complaint) return rejectAfterDelay("Complaint not found.");

  complaint.status = status;
  complaint.updated_at = now();
  return delay(complaint);
};

export const staffLogin = (email, password) => {
  const staff = staffUsers.find((user) => user.email === email && user.password === password && user.is_active);
  if (!staff) return rejectAfterDelay("Invalid email or password.");

  const { password: _password, ...safeStaff } = staff;
  return delay({ token: `mock-token-${safeStaff.staff_user_id}`, ...safeStaff });
};

export const guestLoginWithProvider = (provider) => {
  const guest =
    guests.find((item) => item.provider === provider && item.guest_id.startsWith("guest_demo")) ||
    guests.find((item) => item.provider === provider);

  return delay(guest, 0);
};
