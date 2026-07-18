import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import api from "../../services/api";

const Booking = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [moveInDate, setMoveInDate] = useState("");
  const [message, setMessage] = useState("");

  const submit = async () => {
    setMessage("");
    try {
      const payload = {
        branch: state?.selectedBed?.branch || "sample-branch-1",
        room: state?.roomId,
        bed: state?.selectedBed?._id,
        moveInDate
      };
      const { data } = await api.post("/bookings", payload);
      navigate("/payment", { state: { booking: data.data } });
    } catch (err) {
      setMessage(err.response?.data?.message || "Booking captured locally. Connect API to complete.");
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Card>
        <h1 className="text-2xl font-bold">Confirm booking</h1>
        <p className="mt-2 text-slate-600">Selected bed: {state?.selectedBed?.label || "None"}</p>
        {message && <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-700">{message}</p>}
        <div className="mt-5">
          <Input label="Move-in date" type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} />
        </div>
        <Button className="mt-5" disabled={!moveInDate || !state?.selectedBed} onClick={submit}>Create booking</Button>
      </Card>
    </main>
  );
};

export default Booking;
