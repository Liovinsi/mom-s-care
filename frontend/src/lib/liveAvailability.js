import { useEffect, useMemo, useState } from "react";
import { BED_STATUSES, loadBeds, saveBeds } from "../data/adminBeds";
import { loadRooms, saveRooms } from "../data/adminRooms";
import api from "../services/api";
import { getSocket } from "../services/socket";

export const AVAILABILITY_EVENT = "pg:availability-updated";
export const AVAILABLE_STATUS = "Available";
export const NOT_AVAILABLE_STATUS = "Not Available";

const apiStatusToUi = {
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
  RESERVED: "Reserved",
  MAINTENANCE: "Maintenance",
  HELD: "Reserved",
  BOOKED: "Reserved"
};

const uiStatusToApi = {
  Available: "AVAILABLE",
  Occupied: "OCCUPIED",
  Reserved: "RESERVED",
  Maintenance: "MAINTENANCE"
};

export const isAllowedAvailabilityStatus = (status) => BED_STATUSES.includes(status);

export const toUiStatus = (status) => apiStatusToUi[status] || status;

export const toApiStatus = (status) => uiStatusToApi[status] || status;

export const publicBranchIdFromAdminBranchId = (branchId) => {
  if (branchId === "t-nagar") return "t-nagar-pg";
  return `${branchId}-pg`;
};

export const adminBranchIdFromPublicBranchId = (branchId) => String(branchId || "").replace(/-pg$/, "");

export const publicBedIdFromAdminBed = (bed) =>
  `${publicRoomIdFromAdminRoomId(bed.roomId)}-${String(bed.bedName || "").replace(/^Bed\s+/i, "").toLowerCase()}`;

export const publicRoomIdFromAdminRoomId = (roomId) => {
  if (!roomId) return "";
  if (roomId.startsWith("tnagar-")) return roomId.replace("tnagar-", "tnagar-");
  return roomId;
};

const getRoomBeds = (room, beds) => beds.filter((bed) => bed.roomId === room.id);

export const summarizeRoomAvailability = (room, beds) => {
  const roomBeds = getRoomBeds(room, beds);
  const totalBeds = roomBeds.length || Number(room.beds || 0);
  const availableBeds = roomBeds.filter((bed) => bed.status === "Available").length;
  const occupiedBeds = roomBeds.filter((bed) => bed.status === "Occupied").length;
  const reservedBeds = roomBeds.filter((bed) => bed.status === "Reserved").length;
  const maintenanceBeds = roomBeds.filter((bed) => bed.status === "Maintenance").length;
  const overallAvailability = availableBeds > 0 ? AVAILABLE_STATUS : NOT_AVAILABLE_STATUS;

  return {
    ...room,
    beds: totalBeds,
    totalBeds,
    availableBeds,
    occupiedBeds,
    reservedBeds,
    maintenanceBeds,
    status: overallAvailability,
    overallAvailability
  };
};

export const summarizeRoomsAvailability = (rooms, beds) =>
  rooms.map((room) => summarizeRoomAvailability(room, beds));

export const saveAvailabilitySnapshot = (beds, rooms = loadRooms()) => {
  const nextRooms = summarizeRoomsAvailability(rooms, beds);
  saveBeds(beds);
  saveRooms(nextRooms);
  window.dispatchEvent(new CustomEvent(AVAILABILITY_EVENT, { detail: { beds, rooms: nextRooms } }));
  return { beds, rooms: nextRooms };
};

export const updateStoredBedStatus = (bedId, status) => {
  const uiStatus = toUiStatus(status);
  if (!isAllowedAvailabilityStatus(uiStatus)) return null;

  const beds = loadBeds();
  const nextBeds = beds.map((bed) => (bed.id === bedId || bed._id === bedId ? { ...bed, status: uiStatus } : bed));
  return saveAvailabilitySnapshot(nextBeds);
};

export const updateBedStatus = async (bed, status) => {
  const uiStatus = toUiStatus(status);
  if (!isAllowedAvailabilityStatus(uiStatus)) throw new Error("Invalid availability status.");

  const snapshot = updateStoredBedStatus(bed.id, uiStatus);

  if (/^[a-f\d]{24}$/i.test(String(bed.id))) {
    try {
      await api.patch(`/beds/${bed.id}`, { status: toApiStatus(uiStatus) });
    } catch (error) {
      if (!snapshot) throw error;
    }
  }

  return snapshot;
};

export const useLiveAvailability = () => {
  const [beds, setBeds] = useState(() => loadBeds());
  const [rooms, setRooms] = useState(() => summarizeRoomsAvailability(loadRooms(), loadBeds()));

  useEffect(() => {
    const refresh = () => {
      const nextBeds = loadBeds();
      setBeds(nextBeds);
      setRooms(summarizeRoomsAvailability(loadRooms(), nextBeds));
    };

    const socket = getSocket();
    const onAvailabilityUpdated = (payload) => {
      const uiStatus = toUiStatus(payload?.status);
      const bedId = payload?.id || payload?._id;
      if (!bedId || !isAllowedAvailabilityStatus(uiStatus)) {
        refresh();
        return;
      }
      updateStoredBedStatus(String(bedId), uiStatus);
      refresh();
    };

    window.addEventListener(AVAILABILITY_EVENT, refresh);
    window.addEventListener("pg:beds-updated", refresh);
    window.addEventListener("storage", refresh);
    socket.on("availability:updated", onAvailabilityUpdated);
    socket.on("bed:updated", onAvailabilityUpdated);
    refresh();

    return () => {
      window.removeEventListener(AVAILABILITY_EVENT, refresh);
      window.removeEventListener("pg:beds-updated", refresh);
      window.removeEventListener("storage", refresh);
      socket.off("availability:updated", onAvailabilityUpdated);
      socket.off("bed:updated", onAvailabilityUpdated);
    };
  }, []);

  return useMemo(() => ({ beds, rooms }), [beds, rooms]);
};
