export const sampleBranches = [
  {
    _id: "sample-branch-1",
    name: "Green Nest PG",
    city: "Bengaluru",
    state: "Karnataka",
    address: "HSR Layout, Sector 2",
    amenities: ["Wi-Fi", "Laundry", "Meals", "Security"],
    description: "Well-managed shared accommodation near offices and public transport."
  },
  {
    _id: "sample-branch-2",
    name: "Urban Stay Coliving",
    city: "Hyderabad",
    state: "Telangana",
    address: "Gachibowli",
    amenities: ["AC", "Housekeeping", "Power Backup"],
    description: "Modern rooms with flexible sharing options and quick booking approval."
  }
];

export const sampleRooms = [
  { _id: "sample-room-1", branch: "sample-branch-1", name: "Aster 201", floor: "2", sharingType: 4, monthlyRent: 9500, tokenAmount: 2000 },
  { _id: "sample-room-2", branch: "sample-branch-1", name: "Maple 105", floor: "1", sharingType: 3, monthlyRent: 11000, tokenAmount: 2500 }
];

export const sampleBeds = [
  { _id: "bed-a1", room: "sample-room-1", label: "A1", status: "AVAILABLE" },
  { _id: "bed-a2", room: "sample-room-1", label: "A2", status: "BOOKED" },
  { _id: "bed-a3", room: "sample-room-1", label: "A3", status: "HELD" },
  { _id: "bed-a4", room: "sample-room-1", label: "A4", status: "AVAILABLE" }
];
