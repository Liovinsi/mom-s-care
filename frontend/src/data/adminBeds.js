import { loadRooms } from "./adminRooms";

export const BED_STORAGE_KEY = "pg_admin_beds";

export const BED_STATUSES = ["Available", "Blocked", "Occupied", "Reserved", "Maintenance"];
export const BED_TYPES = ["Single Cot", "Bunk Cot"];

export const luxuryBedImage = "https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=900&q=82";

const legacyDefaultBeds = [
  {
    id: "anna-101-bed-a",
    branchId: "anna-nagar",
    branchName: "Anna Nagar",
    roomId: "anna-101",
    roomNumber: "101",
    sharingType: "2 Sharing",
    bedName: "Bed A",
    bedCode: "BED101A",
    bedType: "Single Cot",
    bedImage: luxuryBedImage,
    status: "Available",
    currentResident: "",
    bookingId: "",
    checkInDate: "",
    checkOutDate: "",
    description: "Premium single cot with under-bed storage and fresh linen."
  },
  {
    id: "anna-101-bed-b",
    branchId: "anna-nagar",
    branchName: "Anna Nagar",
    roomId: "anna-101",
    roomNumber: "101",
    sharingType: "2 Sharing",
    bedName: "Bed B",
    bedCode: "BED101B",
    bedType: "Single Cot",
    bedImage: luxuryBedImage,
    status: "Occupied",
    currentResident: "Rahul Kumar",
    bookingId: "BK-AN-101B",
    checkInDate: "2026-06-01",
    checkOutDate: "2027-05-31",
    description: "Window-side cot assigned to an active resident."
  },
  {
    id: "anna-102-bed-a",
    branchId: "anna-nagar",
    branchName: "Anna Nagar",
    roomId: "anna-102",
    roomNumber: "102",
    sharingType: "3 Sharing",
    bedName: "Bed A",
    bedCode: "BED102A",
    bedType: "Single Cot",
    bedImage: luxuryBedImage,
    status: "Available",
    currentResident: "",
    bookingId: "",
    checkInDate: "",
    checkOutDate: "",
    description: "Front cot in a spacious three sharing room."
  },
  {
    id: "anna-102-bed-b",
    branchId: "anna-nagar",
    branchName: "Anna Nagar",
    roomId: "anna-102",
    roomNumber: "102",
    sharingType: "3 Sharing",
    bedName: "Bed B",
    bedCode: "BED102B",
    bedType: "Single Cot",
    bedImage: luxuryBedImage,
    status: "Occupied",
    currentResident: "Naveen Raj",
    bookingId: "BK-AN-102B",
    checkInDate: "2026-05-12",
    checkOutDate: "2027-05-11",
    description: "Middle cot with wardrobe allocation."
  },
  {
    id: "anna-102-bed-c",
    branchId: "anna-nagar",
    branchName: "Anna Nagar",
    roomId: "anna-102",
    roomNumber: "102",
    sharingType: "3 Sharing",
    bedName: "Bed C",
    bedCode: "BED102C",
    bedType: "Single Cot",
    bedImage: luxuryBedImage,
    status: "Available",
    currentResident: "",
    bookingId: "",
    checkInDate: "",
    checkOutDate: "",
    description: "Rear cot with attached study table access."
  },
  {
    id: "viru-101-bed-a",
    branchId: "virugambakkam",
    branchName: "Virugambakkam",
    roomId: "viru-101",
    roomNumber: "101",
    sharingType: "2 Sharing",
    bedName: "Bed A",
    bedCode: "BEDV101A",
    bedType: "Single Cot",
    bedImage: luxuryBedImage,
    status: "Available",
    currentResident: "",
    bookingId: "",
    checkInDate: "",
    checkOutDate: "",
    description: "Bright cot near the study wall."
  },
  {
    id: "viru-101-bed-b",
    branchId: "virugambakkam",
    branchName: "Virugambakkam",
    roomId: "viru-101",
    roomNumber: "101",
    sharingType: "2 Sharing",
    bedName: "Bed B",
    bedCode: "BEDV101B",
    bedType: "Single Cot",
    bedImage: luxuryBedImage,
    status: "Reserved",
    currentResident: "",
    bookingId: "BK-VR-101B",
    checkInDate: "2026-08-01",
    checkOutDate: "2027-07-31",
    description: "Reserved for upcoming move-in."
  },
  {
    id: "tamb-201-bed-a",
    branchId: "tambaram",
    branchName: "Tambaram",
    roomId: "tamb-201",
    roomNumber: "201",
    sharingType: "4 Sharing",
    bedName: "Bed A",
    bedCode: "BED201A",
    bedType: "Single Cot",
    bedImage: luxuryBedImage,
    status: "Reserved",
    currentResident: "",
    bookingId: "BK-TB-201A",
    checkInDate: "2026-08-05",
    checkOutDate: "2027-08-04",
    description: "Reserved cot in a premium student room."
  },
  {
    id: "tamb-201-bed-b",
    branchId: "tambaram",
    branchName: "Tambaram",
    roomId: "tamb-201",
    roomNumber: "201",
    sharingType: "4 Sharing",
    bedName: "Bed B",
    bedCode: "BED201B",
    bedType: "Single Cot",
    bedImage: luxuryBedImage,
    status: "Available",
    currentResident: "",
    bookingId: "",
    checkInDate: "",
    checkOutDate: "",
    description: "Available cot with allocated storage."
  },
  {
    id: "tamb-201-bed-c",
    branchId: "tambaram",
    branchName: "Tambaram",
    roomId: "tamb-201",
    roomNumber: "201",
    sharingType: "4 Sharing",
    bedName: "Bed C",
    bedCode: "BED201C",
    bedType: "Single Cot",
    bedImage: luxuryBedImage,
    status: "Occupied",
    currentResident: "Arjun Menon",
    bookingId: "BK-TB-201C",
    checkInDate: "2026-04-20",
    checkOutDate: "2027-04-19",
    description: "Occupied cot with desk access."
  },
  {
    id: "tamb-201-bed-d",
    branchId: "tambaram",
    branchName: "Tambaram",
    roomId: "tamb-201",
    roomNumber: "201",
    sharingType: "4 Sharing",
    bedName: "Bed D",
    bedCode: "BED201D",
    bedType: "Single Cot",
    bedImage: luxuryBedImage,
    status: "Available",
    currentResident: "",
    bookingId: "",
    checkInDate: "",
    checkOutDate: "",
    description: "Corner cot with good ventilation."
  },
  {
    id: "vela-301-bed-c",
    branchId: "velachery",
    branchName: "Velachery",
    roomId: "vela-301",
    roomNumber: "301",
    sharingType: "2 Sharing",
    bedName: "Bed C",
    bedCode: "BED301C",
    bedType: "Single Cot",
    bedImage: luxuryBedImage,
    status: "Maintenance",
    currentResident: "",
    bookingId: "",
    checkInDate: "",
    checkOutDate: "",
    description: "Temporarily blocked for bed frame maintenance."
  },
  {
    id: "guindy-401-bed-a",
    branchId: "guindy",
    branchName: "Guindy",
    roomId: "guindy-401",
    roomNumber: "401",
    sharingType: "1 Sharing",
    bedName: "Bed A",
    bedCode: "BED401A",
    bedType: "Single Cot",
    bedImage: luxuryBedImage,
    status: "Available",
    currentResident: "",
    bookingId: "",
    checkInDate: "",
    checkOutDate: "",
    description: "Single occupancy cot in a premium serviced room."
  },
  {
    id: "porur-202-bed-a",
    branchId: "porur",
    branchName: "Porur",
    roomId: "porur-202",
    roomNumber: "202",
    sharingType: "3 Sharing",
    bedName: "Bed A",
    bedCode: "BEDP202A",
    bedType: "Single Cot",
    bedImage: luxuryBedImage,
    status: "Maintenance",
    currentResident: "",
    bookingId: "",
    checkInDate: "",
    checkOutDate: "",
    description: "Room maintenance hold."
  },
  {
    id: "tnagar-203-bed-a",
    branchId: "t-nagar",
    branchName: "T Nagar",
    roomId: "tnagar-203",
    roomNumber: "203",
    sharingType: "2 Sharing",
    bedName: "Bed A",
    bedCode: "BEDT203A",
    bedType: "Single Cot",
    bedImage: luxuryBedImage,
    status: "Occupied",
    currentResident: "Karthik S",
    bookingId: "BK-TN-203A",
    checkInDate: "2026-03-15",
    checkOutDate: "2027-03-14",
    description: "Occupied cot in central city room."
  },
  {
    id: "shol-501-bed-a",
    branchId: "sholinganallur",
    branchName: "Sholinganallur",
    roomId: "shol-501",
    roomNumber: "501",
    sharingType: "2 Sharing",
    bedName: "Bed A",
    bedCode: "BEDS501A",
    bedType: "Single Cot",
    bedImage: luxuryBedImage,
    status: "Available",
    currentResident: "",
    bookingId: "",
    checkInDate: "",
    checkOutDate: "",
    description: "OMR-facing cot with balcony access."
  },
  {
    id: "meda-103-bed-a",
    branchId: "medavakkam",
    branchName: "Medavakkam",
    roomId: "meda-103",
    roomNumber: "103",
    sharingType: "4 Sharing",
    bedName: "Bed A",
    bedCode: "BEDM103A",
    bedType: "Single Cot",
    bedImage: luxuryBedImage,
    status: "Available",
    currentResident: "",
    bookingId: "",
    checkInDate: "",
    checkOutDate: "",
    description: "Available cot in a large sharing room."
  }
];

const canonicalRoomBeds = (branchId, branchName, roomId, roomNumber) => ["L1", "L2", "U1", "U2"].map((bedName, index) => ({
  id: `${roomId}-bed-${bedName.toLowerCase()}`,
  branchId,
  branchName,
  roomId,
  roomNumber,
  bedName,
  bedCode: `${branchId === "anna-nagar" ? "AN" : "VR"}${roomNumber}${bedName}`,
  bedType: "Bunk Cot",
  bedImage: luxuryBedImage,
  position: bedName.startsWith("L") ? "Lower" : "Upper",
  positionLabel: bedName,
  status: index === 0 ? "Occupied" : "Available",
  currentResident: index === 0 ? (branchId === "anna-nagar" && roomNumber === "101" ? "Rahul Kumar" : "") : "",
  bookingId: "",
  checkInDate: index === 0 ? "2026-06-01" : "",
  checkOutDate: index === 0 ? "2027-05-31" : "",
  description: `${bedName} bunk with individual storage and charging point.`
}));

const singleCotRoomBeds = (branchId, branchName, roomId, roomNumber, bedLetters) => bedLetters.map((letter, index) => ({
  id: `${roomId}-bed-${letter.toLowerCase()}`,
  branchId,
  branchName,
  roomId,
  roomNumber,
  bedName: `Bed ${letter}`,
  bedCode: `${branchId === "anna-nagar" ? "AN" : "VR"}${roomNumber}${letter}`,
  bedType: "Single Cot",
  bedImage: luxuryBedImage,
  position: "Single",
  status: index === 0 ? "Occupied" : "Available",
  currentResident: "",
  bookingId: "",
  checkInDate: "",
  checkOutDate: "",
  description: `Single cot in Room ${roomNumber}.`
}));

export const defaultBeds = [
  ...canonicalRoomBeds("anna-nagar", "Anna Nagar", "anna-101", "101"),
  ...canonicalRoomBeds("anna-nagar", "Anna Nagar", "anna-102", "102"),
  ...canonicalRoomBeds("anna-nagar", "Anna Nagar", "anna-201", "201"),
  ...canonicalRoomBeds("anna-nagar", "Anna Nagar", "anna-202", "202"),
  ...canonicalRoomBeds("virugambakkam", "Virugambakkam", "viru-301", "301"),
  ...canonicalRoomBeds("virugambakkam", "Virugambakkam", "viru-302", "302"),
  ...canonicalRoomBeds("virugambakkam", "Virugambakkam", "viru-303", "303"),
  ...canonicalRoomBeds("virugambakkam", "Virugambakkam", "viru-304", "304"),
  ...singleCotRoomBeds("virugambakkam", "Virugambakkam", "viru-105", "105", ["A"]),
  ...singleCotRoomBeds("virugambakkam", "Virugambakkam", "viru-106", "106", ["A", "B"]),
  ...singleCotRoomBeds("virugambakkam", "Virugambakkam", "viru-205", "205", ["A", "B", "C"]),
  ...singleCotRoomBeds("anna-nagar", "Anna Nagar", "anna-105", "105", ["A"]),
  ...singleCotRoomBeds("anna-nagar", "Anna Nagar", "anna-106", "106", ["A", "B"]),
  ...singleCotRoomBeds("anna-nagar", "Anna Nagar", "anna-205", "205", ["A", "B", "C"])
];

export const loadBeds = () => {
  const stored = localStorage.getItem(BED_STORAGE_KEY);
  const allowed = new Set(["anna-nagar", "virugambakkam"]);
  const roomsById = new Map(loadRooms().map((room) => [room.id, room]));
  const beds = (stored ? JSON.parse(stored) : defaultBeds).filter((bed) => allowed.has(bed.branchId)).map((bed) => (
    bed.status === "Blocked" && bed.blockedUntil && Date.parse(bed.blockedUntil) <= Date.now()
      ? { ...bed, status: "Available", bookingId: "", blockedUntil: "", checkInDate: "", checkOutDate: "" }
      : bed
  ));
  // sharingType always comes from the bed's room (single source of truth), never a value stored on the bed itself.
  return beds.map((bed) => {
    const sharingType = roomsById.get(bed.roomId)?.sharingType || bed.sharingType || "";
    const bunkCot = sharingType === "4 Sharing";
    if (!bunkCot) return { ...bed, sharingType, bedType: bed.bedType || "Single Cot", position: bed.position || "Single" };
    if (bed.positionLabel) return { ...bed, sharingType, bedType: "Bunk Cot" };
    const letter = String(bed.bedName || "").match(/([A-Z])$/i)?.[1]?.toUpperCase();
    const index = Math.max(0, (letter?.charCodeAt(0) || 65) - 65);
    const position = index < 2 ? "Upper" : "Lower";
    const positionNumber = index < 2 ? index + 1 : index - 1;
    return { ...bed, sharingType, bedType: "Bunk Cot", position, positionLabel: `${position === "Upper" ? "U" : "L"}${positionNumber}` };
  });
};

export const saveBeds = (beds) => {
  const allowed = new Set(["anna-nagar", "virugambakkam"]);
  const scopedBeds = beds.filter((bed) => allowed.has(bed.branchId));
  localStorage.setItem(BED_STORAGE_KEY, JSON.stringify(scopedBeds));
  window.dispatchEvent(new CustomEvent("pg:beds-updated", { detail: { beds: scopedBeds } }));
};

// The guest-facing room/bed catalog (data/bookingFlow.js) and this admin bed
// inventory are two independently seeded datasets, so a bed a guest can select
// does not always have a matching record here yet. Enquiries must not be
// rejected just because that record is missing (see BookingDetails.jsx) — this
// lazily creates it, defaulting to AVAILABLE, so later admin actions (approve,
// reserve, book) have a real record to update atomically.
export const ensureBedRecord = (beds, details) => {
  const existing = beds.find((bed) => bed.id === details.id);
  if (existing) return { beds, bed: existing };

  const bed = {
    id: details.id,
    branchId: details.branchId,
    branchName: details.branchName,
    roomId: details.roomId,
    roomNumber: details.roomNumber,
    sharingType: details.sharingType || "",
    bedName: details.bedName || "",
    bedCode: details.id,
    bedType: details.sharingType === "4 Sharing" ? "Bunk Cot" : "Single Cot",
    bedImage: luxuryBedImage,
    status: "Available",
    currentResident: "",
    bookingId: "",
    checkInDate: "",
    checkOutDate: "",
    description: ""
  };
  return { beds: [...beds, bed], bed };
};
