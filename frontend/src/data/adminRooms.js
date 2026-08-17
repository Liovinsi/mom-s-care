export const ROOM_STORAGE_KEY = "pg_admin_rooms";
export const ROOM_AMENITY_STORAGE_KEY = "pg_admin_room_amenities";

export const ROOM_AMENITIES = [
  "Air Conditioner",
  "Attached Bathroom",
  "Balcony",
  "Study Table",
  "Wardrobe",
  "Fan",
  "Geyser",
  "Window",
  "Mirror"
];

export const ROOM_IMAGE_LABELS = ["Building", "Room", "Bathroom", "Balcony"];

const imageUrl = (photoId, width = 900) => `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=82`;

const roomImages = (roomPhoto, signature) => [
  { label: "Building", image: imageUrl("photo-1545324418-cc1a3fa10c00") },
  { label: "Room", image: imageUrl(roomPhoto) },
  { label: "Bathroom", image: `https://source.unsplash.com/featured/900x650/?premium%20bathroom&sig=${signature}` },
  { label: "Balcony", image: `https://source.unsplash.com/featured/900x650/?apartment%20balcony&sig=${signature}` }
];

const legacyDefaultRooms = [
  {
    id: "anna-101",
    branchId: "anna-nagar",
    branchName: "Anna Nagar",
    roomNumber: "101",
    floor: "1st Floor",
    sharingType: "2 Sharing",
    roomType: "AC",
    monthlyRent: 16000,
    securityDeposit: 32000,
    size: "240",
    description: "Premium twin sharing room with bright windows and private storage.",
    status: "Available",
    amenities: ["Air Conditioner", "Attached Bathroom", "Study Table", "Wardrobe", "Fan", "Geyser", "Window", "Mirror"],
    images: roomImages("photo-1595526114035-0d45ed16cfbf", 101),
    beds: 2,
    availableBeds: 2,
    occupiedBeds: 0
  },
  {
    id: "anna-102",
    branchId: "anna-nagar",
    branchName: "Anna Nagar",
    roomNumber: "102",
    floor: "1st Floor",
    sharingType: "3 Sharing",
    roomType: "Non AC",
    monthlyRent: 14500,
    securityDeposit: 29000,
    size: "285",
    description: "Spacious three sharing room with study area and wardrobe access.",
    status: "Occupied",
    amenities: ["Attached Bathroom", "Study Table", "Wardrobe", "Fan", "Window", "Mirror"],
    images: roomImages("photo-1616594039964-ae9021a400a0", 102),
    beds: 3,
    availableBeds: 0,
    occupiedBeds: 3
  },
  {
    id: "viru-101",
    branchId: "virugambakkam",
    branchName: "Virugambakkam",
    roomNumber: "101",
    floor: "1st Floor",
    sharingType: "2 Sharing",
    roomType: "AC",
    monthlyRent: 15500,
    securityDeposit: 31000,
    size: "230",
    description: "Comfortable serviced room close to Arcot Road transit.",
    status: "Available",
    amenities: ["Air Conditioner", "Attached Bathroom", "Study Table", "Wardrobe", "Fan", "Geyser"],
    images: roomImages("photo-1616486338812-3dadae4b4ace", 201),
    beds: 2,
    availableBeds: 1,
    occupiedBeds: 1
  },
  {
    id: "tamb-201",
    branchId: "tambaram",
    branchName: "Tambaram",
    roomNumber: "201",
    floor: "2nd Floor",
    sharingType: "4 Sharing",
    roomType: "AC",
    monthlyRent: 12500,
    securityDeposit: 25000,
    size: "340",
    description: "Premium student hostel room with four beds and common study wall.",
    status: "Available",
    amenities: ["Air Conditioner", "Attached Bathroom", "Study Table", "Wardrobe", "Fan", "Window", "Mirror"],
    images: roomImages("photo-1560448204-603b3fc33ddc", 301),
    beds: 4,
    availableBeds: 3,
    occupiedBeds: 1
  },
  {
    id: "vela-301",
    branchId: "velachery",
    branchName: "Velachery",
    roomNumber: "301",
    floor: "3rd Floor",
    sharingType: "2 Sharing",
    roomType: "AC",
    monthlyRent: 17000,
    securityDeposit: 34000,
    size: "260",
    description: "High-demand room with premium fittings and IT corridor access.",
    status: "Occupied",
    amenities: ["Air Conditioner", "Attached Bathroom", "Balcony", "Study Table", "Wardrobe", "Fan", "Geyser", "Window", "Mirror"],
    images: roomImages("photo-1618221195710-dd6b41faaea6", 401),
    beds: 2,
    availableBeds: 0,
    occupiedBeds: 2
  },
  {
    id: "porur-202",
    branchId: "porur",
    branchName: "Porur",
    roomNumber: "202",
    floor: "2nd Floor",
    sharingType: "3 Sharing",
    roomType: "Non AC",
    monthlyRent: 12000,
    securityDeposit: 24000,
    size: "290",
    description: "Budget-friendly room with cross ventilation and storage.",
    status: "Maintenance",
    amenities: ["Attached Bathroom", "Study Table", "Wardrobe", "Fan", "Window", "Mirror"],
    images: roomImages("photo-1586023492125-27b2c045efd7", 501),
    beds: 3,
    availableBeds: 0,
    occupiedBeds: 0
  },
  {
    id: "guindy-401",
    branchId: "guindy",
    branchName: "Guindy",
    roomNumber: "401",
    floor: "4th Floor",
    sharingType: "1 Sharing",
    roomType: "AC",
    monthlyRent: 24000,
    securityDeposit: 48000,
    size: "220",
    description: "Single occupancy serviced apartment style room for professionals.",
    status: "Available",
    amenities: ["Air Conditioner", "Attached Bathroom", "Balcony", "Study Table", "Wardrobe", "Fan", "Geyser", "Window", "Mirror"],
    images: roomImages("photo-1615873968403-89e068629265", 601),
    beds: 1,
    availableBeds: 1,
    occupiedBeds: 0
  },
  {
    id: "tnagar-203",
    branchId: "t-nagar",
    branchName: "T Nagar",
    roomNumber: "203",
    floor: "2nd Floor",
    sharingType: "2 Sharing",
    roomType: "AC",
    monthlyRent: 18000,
    securityDeposit: 36000,
    size: "245",
    description: "Central city premium room with attached bath and wardrobe.",
    status: "Occupied",
    amenities: ["Air Conditioner", "Attached Bathroom", "Study Table", "Wardrobe", "Fan", "Geyser", "Mirror"],
    images: roomImages("photo-1618220179428-22790b461013", 701),
    beds: 2,
    availableBeds: 0,
    occupiedBeds: 2
  },
  {
    id: "meda-103",
    branchId: "medavakkam",
    branchName: "Medavakkam",
    roomNumber: "103",
    floor: "1st Floor",
    sharingType: "4 Sharing",
    roomType: "Non AC",
    monthlyRent: 10500,
    securityDeposit: 21000,
    size: "360",
    description: "Large sharing room suited for students and early professionals.",
    status: "Available",
    amenities: ["Attached Bathroom", "Study Table", "Wardrobe", "Fan", "Window"],
    images: roomImages("photo-1560185127-6ed189bf02f4", 801),
    beds: 4,
    availableBeds: 4,
    occupiedBeds: 0
  },
  {
    id: "shol-501",
    branchId: "sholinganallur",
    branchName: "Sholinganallur",
    roomNumber: "501",
    floor: "5th Floor",
    sharingType: "2 Sharing",
    roomType: "AC",
    monthlyRent: 17500,
    securityDeposit: 35000,
    size: "255",
    description: "Modern OMR residence room with balcony and work desk.",
    status: "Available",
    amenities: ["Air Conditioner", "Attached Bathroom", "Balcony", "Study Table", "Wardrobe", "Fan", "Geyser", "Window", "Mirror"],
    images: roomImages("photo-1598928506311-c55ded91a20c", 901),
    beds: 2,
    availableBeds: 1,
    occupiedBeds: 1
  }
];

export const getBedsForSharing = (sharingType) => Number(String(sharingType).split(" ")[0]) || 0;

const canonicalRoom = (id, branchId, branchName, roomNumber, floor, roomType, monthlyRent, signature, sharingType) => {
  const beds = getBedsForSharing(sharingType);
  return {
    id,
    branchId,
    branchName,
    roomNumber,
    floor,
    sharingType,
    roomType,
    monthlyRent,
    securityDeposit: monthlyRent * 2,
    size: "320",
    description: `Well-maintained ${sharingType.toLowerCase()} ${roomType} room with individual storage and study space.`,
    status: "Available",
    amenities: ["Attached Bathroom", "Study Table", "Wardrobe", "Fan", "Geyser", "Window", "Mirror", ...(roomType === "AC" ? ["Air Conditioner"] : [])],
    images: roomImages("photo-1595526114035-0d45ed16cfbf", signature),
    beds,
    availableBeds: Math.max(beds - 1, 0),
    occupiedBeds: Math.min(1, beds)
  };
};

// sharingType reflects each room's actual bed count in adminBeds.js — keep them in sync when a room's bed layout changes.
export const defaultRooms = [
  canonicalRoom("anna-101", "anna-nagar", "Anna Nagar", "101", "1st Floor", "AC", 16000, 101, "4 Sharing"),
  canonicalRoom("anna-102", "anna-nagar", "Anna Nagar", "102", "1st Floor", "Non AC", 14000, 102, "4 Sharing"),
  canonicalRoom("anna-201", "anna-nagar", "Anna Nagar", "201", "2nd Floor", "AC", 16500, 201, "4 Sharing"),
  canonicalRoom("anna-202", "anna-nagar", "Anna Nagar", "202", "2nd Floor", "Non AC", 14500, 202, "4 Sharing"),
  canonicalRoom("viru-301", "virugambakkam", "Virugambakkam", "301", "3rd Floor", "AC", 15500, 301, "4 Sharing"),
  canonicalRoom("viru-302", "virugambakkam", "Virugambakkam", "302", "3rd Floor", "Non AC", 13500, 302, "4 Sharing"),
  canonicalRoom("viru-303", "virugambakkam", "Virugambakkam", "303", "3rd Floor", "AC", 16000, 303, "4 Sharing"),
  canonicalRoom("viru-304", "virugambakkam", "Virugambakkam", "304", "3rd Floor", "Non AC", 14000, 304, "4 Sharing"),
  canonicalRoom("viru-105", "virugambakkam", "Virugambakkam", "105", "1st Floor", "AC", 19500, 305, "1 Sharing"),
  canonicalRoom("viru-106", "virugambakkam", "Virugambakkam", "106", "1st Floor", "AC", 17500, 306, "2 Sharing"),
  canonicalRoom("viru-205", "virugambakkam", "Virugambakkam", "205", "2nd Floor", "Non AC", 13500, 307, "3 Sharing"),
  canonicalRoom("anna-105", "anna-nagar", "Anna Nagar", "105", "1st Floor", "AC", 20500, 401, "1 Sharing"),
  canonicalRoom("anna-106", "anna-nagar", "Anna Nagar", "106", "1st Floor", "AC", 18500, 402, "2 Sharing"),
  canonicalRoom("anna-205", "anna-nagar", "Anna Nagar", "205", "2nd Floor", "Non AC", 14500, 403, "3 Sharing")
];

export const loadRooms = () => {
  const stored = localStorage.getItem(ROOM_STORAGE_KEY);
  const allowed = new Set(["anna-nagar", "virugambakkam"]);
  return (stored ? JSON.parse(stored) : defaultRooms).filter((room) => allowed.has(room.branchId));
};

export const saveRooms = (rooms) => {
  const allowed = new Set(["anna-nagar", "virugambakkam"]);
  localStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(rooms.filter((room) => allowed.has(room.branchId))));
};

export const loadRoomAmenities = () => {
  const stored = localStorage.getItem(ROOM_AMENITY_STORAGE_KEY);
  return stored ? JSON.parse(stored) : ROOM_AMENITIES;
};

export const saveRoomAmenities = (amenities) => {
  localStorage.setItem(ROOM_AMENITY_STORAGE_KEY, JSON.stringify(amenities));
};
