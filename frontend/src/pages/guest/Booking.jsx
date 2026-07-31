import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { loadBookings, saveBookings } from "../../data/adminBookings";
import { updateStoredBedStatus } from "../../lib/liveAvailability";

const Booking = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [moveInDate, setMoveInDate] = useState("");
  const [message, setMessage] = useState("");

  const submit = () => {
    setMessage("");
    const selectedBed = state?.selectedBed;
    const bookings = loadBookings();
    const bookingId = `BK${String(bookings.length + 1).padStart(4, "0")}`;
    const booking = {
      id: bookingId,
      customerName: user?.name || "Demo User",
      phone: "9876543210",
      email: user?.email || "demo@gmail.com",
      branchId: selectedBed?.branchId || selectedBed?.branch || "anna-nagar",
      branchName: selectedBed?.branchName || "Selected branch",
      roomId: state?.roomId || selectedBed?.roomId || "",
      roomNumber: selectedBed?.roomNumber || "",
      bedId: selectedBed?.id || selectedBed?._id,
      bedName: selectedBed?.bedName || selectedBed?.label || "Selected bed",
      sharingType: selectedBed?.sharingType || "",
      roomType: selectedBed?.roomType || "",
      bookingDate: new Date().toISOString().slice(0, 10),
      moveInDate,
      tokenAmount: 5000,
      paymentStatus: "Pending",
      bookingStatus: "Pending"
    };

    saveBookings([booking, ...bookings]);
    if (booking.bedId) updateStoredBedStatus(booking.bedId, "Reserved");

    navigate("/booking-status", {
      state: {
        booking: {
          ...booking,
          branch: booking.branchName,
          selectedBed: booking.bedName
        }
      }
    });
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Card>
        <h1 className="text-2xl font-bold">Block bed</h1>
        <p className="mt-2 text-slate-600">Selected bed: {state?.selectedBed?.label || "None"}</p>
        {message && <p className="mt-4 rounded-md bg-brand/10 p-3 text-sm text-brandDark">{message}</p>}
        <div className="mt-5">
          <Input label="Move-in date" type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} />
        </div>
        <Button className="mt-5" disabled={!moveInDate || !state?.selectedBed} onClick={submit}>Block bed</Button>
      </Card>
    </main>
  );
};

export default Booking;
