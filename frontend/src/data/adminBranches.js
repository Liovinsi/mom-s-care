export const AMENITIES = [
  "WiFi",
  "Healthy Food",
  "Laundry",
  "Housekeeping",
  "Power Backup",
  "RO Water",
  "CCTV",
  "Biometric Entry",
  "Parking",
  "Lift"
];

export const AMENITY_STORAGE_KEY = "pg_admin_amenities";

export const AREAS = [
  "Anna Nagar",
  "Virugambakkam",
  "Tambaram",
  "Velachery",
  "Porur",
  "Guindy",
  "T Nagar",
  "Sholinganallur",
  "Medavakkam"
];

export const GALLERY_LABELS = ["Building Front", "Reception", "Room", "Washroom", "Dining Area", "Terrace"];

const imageUrl = (photoId, width = 900) => `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=82`;
const featuredImage = (query, signature, width = 900) =>
  `https://source.unsplash.com/featured/${width}x650/?${encodeURIComponent(query)}&sig=${signature}`;

const buildGallery = (signatureBase) =>
  GALLERY_LABELS.map((label, index) => ({
    label,
    image: featuredImage(`premium pg ${label.toLowerCase()} apartment`, signatureBase + index)
  }));

export const branchImageSets = {
  "anna-nagar": {
    image: imageUrl("photo-1545324418-cc1a3fa10c00"),
    gallery: buildGallery(101)
  },
  virugambakkam: {
    image: imageUrl("photo-1486406146926-c627a92ad1ab"),
    gallery: buildGallery(201)
  },
  tambaram: {
    image: imageUrl("photo-1518005020951-eccb494ad742"),
    gallery: buildGallery(301)
  },
  velachery: {
    image: imageUrl("photo-1512917774080-9991f1c4c750"),
    gallery: buildGallery(401)
  },
  porur: {
    image: imageUrl("photo-1600607687939-ce8a6c25118c"),
    gallery: buildGallery(501)
  },
  guindy: {
    image: imageUrl("photo-1494526585095-c41746248156"),
    gallery: buildGallery(601)
  },
  "t-nagar": {
    image: imageUrl("photo-1564013799919-ab600027ffc6"),
    gallery: buildGallery(701)
  },
  medavakkam: {
    image: imageUrl("photo-1570129477492-45c003edd2be"),
    gallery: buildGallery(801)
  },
  sholinganallur: {
    image: imageUrl("photo-1600566753190-17f0baa2a6c3"),
    gallery: buildGallery(901)
  }
};

export const defaultBranches = [
  {
    id: "anna-nagar",
    name: "PGStay Anna Nagar",
    code: "PG-ANN-001",
    area: "Anna Nagar",
    address: "12, 2nd Avenue, Anna Nagar, Chennai",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600040",
    contactNumber: "9876543210",
    email: "annanagar@pgstay.com",
    mapLink: "https://maps.google.com/?q=Anna+Nagar+Chennai",
    latitude: "13.0850",
    longitude: "80.2101",
    image: branchImageSets["anna-nagar"].image,
    gallery: branchImageSets["anna-nagar"].gallery,
    description: "Premium branch close to metro access, shopping streets, and coaching hubs.",
    gender: "Unisex",
    status: "Active",
    amenities: ["WiFi", "Healthy Food", "Laundry", "Housekeeping", "Power Backup", "RO Water", "CCTV", "Biometric Entry", "Lift"],
    rooms: 50,
    beds: 200,
    occupiedBeds: 148,
    availableBeds: 42,
    reservedBeds: 6,
    maintenanceBeds: 4,
    monthlyRevenue: 1245000,
    todayCollection: 18000,
    pendingRent: 120000,
    overduePayments: 12,
    occupancy: 74,
    wardens: ["Priya Raman", "S. Kavitha"],
    residents: 148
  },
  {
    id: "virugambakkam",
    name: "PGStay Virugambakkam",
    code: "PG-VIR-002",
    area: "Virugambakkam",
    address: "44, Arcot Road, Virugambakkam, Chennai",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600092",
    contactNumber: "9876543211",
    email: "virugambakkam@pgstay.com",
    mapLink: "https://maps.google.com/?q=Virugambakkam+Chennai",
    latitude: "13.0486",
    longitude: "80.1928",
    image: branchImageSets.virugambakkam.image,
    gallery: branchImageSets.virugambakkam.gallery,
    description: "Well connected PG for working professionals around Kodambakkam and Vadapalani.",
    gender: "Girls",
    status: "Active",
    amenities: ["WiFi", "Healthy Food", "Laundry", "RO Water", "CCTV", "Biometric Entry", "Parking"],
    rooms: 22,
    beds: 88,
    occupiedBeds: 69,
    availableBeds: 19,
    wardens: ["Nandhini S."],
    residents: 69
  },
  {
    id: "tambaram",
    name: "PGStay Tambaram",
    code: "PG-TAM-003",
    area: "Tambaram",
    address: "8, GST Road, East Tambaram, Chennai",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600059",
    contactNumber: "9876543212",
    email: "tambaram@pgstay.com",
    mapLink: "https://maps.google.com/?q=Tambaram+Chennai",
    latitude: "12.9249",
    longitude: "80.1000",
    image: branchImageSets.tambaram.image,
    gallery: branchImageSets.tambaram.gallery,
    description: "Student-friendly property near colleges and suburban railway access.",
    gender: "Boys",
    status: "Active",
    amenities: ["WiFi", "Healthy Food", "Housekeeping", "Power Backup", "RO Water", "CCTV", "Parking"],
    rooms: 31,
    beds: 124,
    occupiedBeds: 98,
    availableBeds: 26,
    wardens: ["R. Manikandan"],
    residents: 98
  },
  {
    id: "velachery",
    name: "PGStay Velachery",
    code: "PG-VEL-004",
    area: "Velachery",
    address: "19, Bypass Road, Velachery, Chennai",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600042",
    contactNumber: "9876543213",
    email: "velachery@pgstay.com",
    mapLink: "https://maps.google.com/?q=Velachery+Chennai",
    latitude: "12.9759",
    longitude: "80.2212",
    image: branchImageSets.velachery.image,
    gallery: branchImageSets.velachery.gallery,
    description: "High-demand branch near IT offices, malls, and transit points.",
    gender: "Unisex",
    status: "Active",
    amenities: ["WiFi", "Healthy Food", "Laundry", "Housekeeping", "Power Backup", "RO Water", "CCTV", "Lift"],
    rooms: 34,
    beds: 136,
    occupiedBeds: 121,
    availableBeds: 15,
    wardens: ["Maya R.", "Dinesh K."],
    residents: 121
  },
  {
    id: "porur",
    name: "PGStay Porur",
    code: "PG-POR-005",
    area: "Porur",
    address: "63, Mount Poonamallee Road, Porur, Chennai",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600116",
    contactNumber: "9876543214",
    email: "porur@pgstay.com",
    mapLink: "https://maps.google.com/?q=Porur+Chennai",
    latitude: "13.0382",
    longitude: "80.1565",
    image: branchImageSets.porur.image,
    gallery: branchImageSets.porur.gallery,
    description: "Quiet branch serving hospital, office, and university corridors.",
    gender: "Girls",
    status: "Inactive",
    amenities: ["WiFi", "Healthy Food", "RO Water", "CCTV", "Parking"],
    rooms: 18,
    beds: 72,
    occupiedBeds: 0,
    availableBeds: 72,
    wardens: ["Unassigned"],
    residents: 0
  },
  {
    id: "guindy",
    name: "PGStay Guindy",
    code: "PG-GUI-006",
    area: "Guindy",
    address: "27, Race Course Road, Guindy, Chennai",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600032",
    contactNumber: "9876543215",
    email: "guindy@pgstay.com",
    mapLink: "https://maps.google.com/?q=Guindy+Chennai",
    latitude: "13.0067",
    longitude: "80.2206",
    image: branchImageSets.guindy.image,
    gallery: branchImageSets.guindy.gallery,
    description: "Premium access to industrial estate, metro, and central business routes.",
    gender: "Boys",
    status: "Active",
    amenities: ["WiFi", "Healthy Food", "Laundry", "Housekeeping", "Power Backup", "RO Water", "CCTV", "Biometric Entry", "Parking", "Lift"],
    rooms: 26,
    beds: 104,
    occupiedBeds: 77,
    availableBeds: 27,
    wardens: ["Suresh N."],
    residents: 77
  },
  {
    id: "t-nagar",
    name: "PGStay T Nagar",
    code: "PG-TNG-007",
    area: "T Nagar",
    address: "5, North Usman Road, T Nagar, Chennai",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600017",
    contactNumber: "9876543216",
    email: "tnagar@pgstay.com",
    mapLink: "https://maps.google.com/?q=T+Nagar+Chennai",
    latitude: "13.0418",
    longitude: "80.2341",
    image: branchImageSets["t-nagar"].image,
    gallery: branchImageSets["t-nagar"].gallery,
    description: "Central branch for retail, office, and commute-heavy residents.",
    gender: "Girls",
    status: "Active",
    amenities: ["WiFi", "Healthy Food", "Laundry", "Housekeeping", "RO Water", "CCTV", "Biometric Entry", "Lift"],
    rooms: 24,
    beds: 96,
    occupiedBeds: 82,
    availableBeds: 14,
    wardens: ["Janani P."],
    residents: 82
  },
  {
    id: "medavakkam",
    name: "PGStay Medavakkam",
    code: "PG-MED-008",
    area: "Medavakkam",
    address: "71, Velachery Main Road, Medavakkam, Chennai",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600100",
    contactNumber: "9876543217",
    email: "medavakkam@pgstay.com",
    mapLink: "https://maps.google.com/?q=Medavakkam+Chennai",
    latitude: "12.9171",
    longitude: "80.1923",
    image: branchImageSets.medavakkam.image,
    gallery: branchImageSets.medavakkam.gallery,
    description: "Affordable branch serving OMR, Velachery, and Pallikaranai routes.",
    gender: "Unisex",
    status: "Inactive",
    amenities: ["WiFi", "Healthy Food", "Housekeeping", "Power Backup", "RO Water", "CCTV", "Parking"],
    rooms: 20,
    beds: 80,
    occupiedBeds: 0,
    availableBeds: 80,
    wardens: ["Unassigned"],
    residents: 0
  },
  {
    id: "sholinganallur",
    name: "PGStay Sholinganallur",
    code: "PG-SHO-009",
    area: "Sholinganallur",
    address: "102, OMR, Sholinganallur, Chennai",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600119",
    contactNumber: "9876543218",
    email: "sholinganallur@pgstay.com",
    mapLink: "https://maps.google.com/?q=Sholinganallur+Chennai",
    latitude: "12.9010",
    longitude: "80.2279",
    image: branchImageSets.sholinganallur.image,
    gallery: branchImageSets.sholinganallur.gallery,
    description: "Large IT-corridor branch for professionals along OMR.",
    gender: "Unisex",
    status: "Active",
    amenities: ["WiFi", "Healthy Food", "Laundry", "Housekeeping", "Power Backup", "RO Water", "CCTV", "Biometric Entry", "Parking", "Lift"],
    rooms: 40,
    beds: 160,
    occupiedBeds: 133,
    availableBeds: 27,
    wardens: ["Arun V.", "Keerthi M."],
    residents: 133
  }
];

export const BRANCH_STORAGE_KEY = "pg_admin_branches";

const normalizeAmenityLabel = (amenity) => (amenity === "Food" ? "Healthy Food" : amenity);

const normalizeBranchAmenities = (branch) => ({
  ...branch,
  amenities: [...new Set((branch.amenities || []).map(normalizeAmenityLabel))]
});

const isLegacyImage = (image) => !image || image.includes("photo-1560448204-e02f11c3d0e2");

const normalizeGallery = (branch) => {
  const defaultGallery = branchImageSets[branch.id]?.gallery || [];
  if (!Array.isArray(branch.gallery) || branch.gallery.length < GALLERY_LABELS.length) return defaultGallery;
  if (branch.gallery.some((item) => typeof item === "string" && isLegacyImage(item))) return defaultGallery;

  return GALLERY_LABELS.map((label, index) => {
    const item = branch.gallery[index];
    return typeof item === "string" ? { label, image: item } : { label: item?.label || label, image: item?.image || "" };
  });
};

const normalizeBranchImages = (branch) => ({
  ...branch,
  image: isLegacyImage(branch.image) ? branchImageSets[branch.id]?.image || "" : branch.image,
  gallery: normalizeGallery(branch)
});

export const loadBranches = () => {
  const stored = localStorage.getItem(BRANCH_STORAGE_KEY);
  return (stored ? JSON.parse(stored) : defaultBranches).map((branch) => normalizeBranchImages(normalizeBranchAmenities(branch)));
};

export const saveBranches = (branches) => {
  localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(branches));
};

export const loadAmenities = () => {
  const stored = localStorage.getItem(AMENITY_STORAGE_KEY);
  return [...new Set((stored ? JSON.parse(stored) : AMENITIES).map(normalizeAmenityLabel))];
};

export const saveAmenities = (amenities) => {
  localStorage.setItem(AMENITY_STORAGE_KEY, JSON.stringify(amenities));
};
