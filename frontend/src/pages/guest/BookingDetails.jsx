import { useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { CheckCircle2, FileText, LockKeyhole } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { bookingBranches, bookingRooms, formatCurrency } from "../../data/bookingFlow";
import { loadBeds } from "../../data/adminBeds";
import { loadBookings, saveBookings } from "../../data/adminBookings";
import { loadRooms } from "../../data/adminRooms";
import { loadResidents, saveResidents } from "../../data/adminResidents";
import { publicBedIdFromAdminBed, saveAvailabilitySnapshot } from "../../lib/liveAvailability";
import { useAuth } from "../../context/AuthContext";

const initialForm = {
  fullName: "",
  mobileNumber: "",
  dateOfBirth: "",
  gender: "",
  currentAddress: "",
  occupation: "",
  collegeName: "",
  courseDepartment: "",
  companyName: "",
  designation: "",
  businessName: "",
  aadhaarNumber: "",
  aadhaarFile: null
};

const selectClassName = "min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/25";
const textAreaClassName = "min-h-28 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-brand/25";
const blockDurationHours = () => Math.max(1, Number(localStorage.getItem("pg_bed_block_hours")) || 24);
const mobilePattern = /^[6-9]\d{9}$/;
const numericFields = {
  mobileNumber: 10,
  aadhaarNumber: 12
};

const todayValue = () => new Date().toISOString().slice(0, 10);

const FieldGroup = ({ title, children }) => (
  <Card className="hover:translate-y-0">
    <h2 className="text-2xl font-semibold text-ink">{title}</h2>
    <div className="mt-6 grid gap-5 md:grid-cols-2">{children}</div>
  </Card>
);

const SelectField = ({ label, value, onChange, options, required = false }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-ink">{label}{required ? " *" : ""}</span>
    <select value={value} onChange={onChange} className={selectClassName}>
      <option value="">Select</option>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  </label>
);

const TextAreaField = ({ label, value, onChange, required = false }) => (
  <label className="block md:col-span-2">
    <span className="mb-2 block text-sm font-semibold text-ink">{label}{required ? " *" : ""}</span>
    <textarea value={value} onChange={onChange} className={textAreaClassName} />
  </label>
);

const BookingDetails = () => {
  const { user } = useAuth();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(initialForm);
  const [fileError, setFileError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [success, setSuccess] = useState(null);

  const roomId = state?.roomId || searchParams.get("roomId");
  const bedId = state?.bedId || searchParams.get("bedId");
  const room = bookingRooms.find((item) => item.id === roomId) || bookingRooms[0];
  const branch = bookingBranches.find((item) => item.id === room.branchId) || bookingBranches[0];
  const selectedBed = room.bedList.find((bed) => bed.id === bedId) || state?.selectedBed || null;
  const selectedBeds = state?.selectedBeds?.length ? state.selectedBeds : selectedBed ? [selectedBed] : [];
  const guests = Math.max(1, Number(state?.guests || searchParams.get("guests")) || selectedBeds.length || 1);
  const checkIn = state?.checkIn || searchParams.get("checkIn") || todayValue();
  const checkOut = state?.checkOut || searchParams.get("checkOut") || "";
  const updateField = (field) => (event) => {
    const limit = numericFields[field];
    const value = limit ? event.target.value.replace(/\D/g, "").slice(0, limit) : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0] || null;
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

    if (!file) {
      setForm((current) => ({ ...current, aadhaarFile: null }));
      setFileError("");
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setForm((current) => ({ ...current, aadhaarFile: null }));
      setFileError("Upload JPG, PNG, or PDF only.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setForm((current) => ({ ...current, aadhaarFile: null }));
      setFileError("Maximum file size is 5 MB.");
      return;
    }

    setFileError("");
    setForm((current) => ({ ...current, aadhaarFile: file }));
  };

  const validation = useMemo(() => {
    const requiredFields = [
      "fullName",
      "mobileNumber",
      "dateOfBirth",
      "gender",
      "currentAddress",
      "occupation",
      "aadhaarNumber",
      "aadhaarFile"
    ];

    if (form.occupation === "Student") requiredFields.push("collegeName");
    if (form.occupation === "Working Professional") requiredFields.push("companyName");

    const requiredComplete = requiredFields.every((field) => field === "aadhaarFile" ? Boolean(form[field]) : String(form[field]).trim());
    const aadhaarValid = /^\d{12}$/.test(form.aadhaarNumber);
    const mobileNumberValid = mobilePattern.test(form.mobileNumber);
    const fileValid = Boolean(form.aadhaarFile) && !fileError;
    const errors = {};
    const labels = {
      fullName: "Full Name",
      mobileNumber: "Mobile Number",
      dateOfBirth: "Date of Birth",
      gender: "Gender",
      currentAddress: "Current Address",
      occupation: "Occupation",
      collegeName: "College Name",
      companyName: "Company Name",
      aadhaarNumber: "Aadhaar Number",
      aadhaarFile: "Aadhaar Upload"
    };
    requiredFields.forEach((field) => {
      const empty = field === "aadhaarFile" ? !form[field] : !String(form[field]).trim();
      if (empty) errors[field] = `${labels[field]} is required.`;
    });
    if (form.mobileNumber && !mobileNumberValid) errors.mobileNumber = "Enter a valid 10-digit mobile number.";
    if (form.aadhaarNumber && !aadhaarValid) errors.aadhaarNumber = "Enter a valid 12-digit Aadhaar number.";
    if (fileError) errors.aadhaarFile = fileError;
    if (selectedBeds.length !== guests) errors.selectedBeds = "Please select the required number of beds.";

    return {
      errors,
      aadhaarValid,
      mobileNumberValid,
      fileValid,
      formValid: requiredComplete && aadhaarValid && mobileNumberValid && fileValid && selectedBeds.length === guests
    };
  }, [fileError, form, guests, selectedBeds.length]);

  const blockBed = () => {
    setSubmitted(true);
    setSubmissionError("");
    if (!validation.formValid) return;

    const storedBookings = loadBookings();
    const adminBeds = loadBeds();
    const selectedAdminBeds = selectedBeds.map((selected) => ({
      selected,
      adminBed: adminBeds.find((bed) => bed.id === selected.id || publicBedIdFromAdminBed(bed) === selected.id)
    }));
    if (selectedAdminBeds.some(({ adminBed }) => !adminBed || adminBed.status !== "Available")) {
      setSubmissionError("One of the selected beds is no longer available. Please return to rooms and choose another bed.");
      return;
    }
    const blockedUntil = new Date(Date.now() + blockDurationHours() * 60 * 60 * 1000).toISOString();
    const blockedAt = new Date().toISOString();
    const highestBookingNumber = storedBookings.reduce((value, booking) => Math.max(value, Number(String(booking.id).replace(/\D/g, "") || 0)), 0);
    const newBookings = selectedAdminBeds.map(({ selected, adminBed }, index) => {
      const bookingId = `BK-${String(highestBookingNumber + index + 1).padStart(6, "0")}`;
      const bookingGuest = { name: form.fullName, phone: form.mobileNumber, email: "" };
      return {
      id: bookingId,
      customerName: bookingGuest.name,
      userId: user?.id || "",
      userEmail: user?.email || "",
      gender: form.gender,
      dob: form.dateOfBirth,
      phone: bookingGuest.phone,
      email: bookingGuest.email,
      currentAddress: form.currentAddress,
      occupation: form.occupation,
      organization: form.occupation === "Student" ? form.collegeName : form.occupation === "Working Professional" ? form.companyName : form.occupation === "Business" ? form.businessName : "",
      aadhaarNumber: `XXXX XXXX ${form.aadhaarNumber.slice(-4)}`,
      aadhaarFront: form.aadhaarFile?.name || "",
      aadhaarBack: "",
      branchId: String(branch.id).replace(/-pg$/, ""),
      branchName: branch.name.replace(/\s*PG$/, ""),
      roomId: room.id,
      roomNumber: room.number,
      bedId: adminBed?.id || selected.id,
      bedName: selected.positionLabel ? `${selected.position} ${selected.positionLabel}` : selected.label || adminBed?.bedName,
      sharingType: room.sharingType,
      roomType: room.roomType,
      bookingDate: todayValue(),
      moveInDate: checkIn,
      checkOutDate: checkOut,
      expectedStay: checkOut ? `${checkIn} to ${checkOut}` : "Monthly stay",
      blockedUntil,
      blockedAt,
      transactionId: "",
      paymentMethod: "",
      paymentDate: "",
      paymentScreenshot: "",
      paymentStatus: "Not Required",
      bookingStatus: "Pending Approval",
      assignedWardenId: "",
      assignedWardenName: "",
      rejectionReason: ""
      };
    });

    const bookingIdByBedId = new Map(newBookings.map((booking) => [booking.bedId, booking.id]));
    const selectedAdminBedIds = new Set(selectedAdminBeds.map(({ adminBed }) => adminBed?.id).filter(Boolean));
    const nextBeds = adminBeds.map((bed) => selectedAdminBedIds.has(bed.id) ? {
      ...bed,
      status: "Blocked",
      currentResident: "",
      bookingId: bookingIdByBedId.get(bed.id) || "",
      blockedUntil,
      checkInDate: checkIn,
      checkOutDate: checkOut
    } : bed);
    saveAvailabilitySnapshot(nextBeds, loadRooms());

    const storedResidents = loadResidents();
    const highestResidentNumber = storedResidents.reduce((value, resident) => Math.max(value, Number(String(resident.id).replace(/\D/g, "") || 0)), 0);
    const stagedResidents = newBookings.map((booking, index) => ({
      id: `RES${String(highestResidentNumber + index + 1).padStart(4, "0")}`,
      userId: user?.id || "",
      fullName: form.fullName,
      gender: form.gender,
      dob: form.dateOfBirth,
      phone: form.mobileNumber,
      email: user?.email || "",
      currentAddress: form.currentAddress,
      occupation: form.occupation,
      organization: booking.organization,
      aadhaarNumber: booking.aadhaarNumber,
      aadhaarFront: form.aadhaarFile?.name || "",
      branchId: booking.branchId,
      branchName: booking.branchName,
      roomId: booking.roomId,
      roomNumber: booking.roomNumber,
      bedId: booking.bedId,
      bedName: booking.bedName,
      sharingType: booking.sharingType,
      roomType: booking.roomType,
      moveInDate: booking.moveInDate,
      monthlyRent: room.monthlyRent,
      securityDeposit: room.securityDeposit,
      bookingId: booking.id,
      bookingDate: booking.bookingDate,
      assignedWarden: "",
      status: "Pending Approval"
    }));
    saveResidents([...stagedResidents, ...storedResidents.filter((resident) => !newBookings.some((booking) => booking.id === resident.bookingId))]);
    saveBookings([...newBookings, ...storedBookings]);

    setSuccess({ referenceId: newBookings[0].id, blockedUntil });
  };

  return (
    <main className="bg-paper/70">
      {success && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/45 px-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="blocked-success-title" className="w-full max-w-md animate-[loginPopup_300ms_ease-out] rounded-[22px] border border-brand/20 bg-white p-7 text-center shadow-luxury sm:p-8">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400"><CheckCircle2 className="h-9 w-9" /></span>
            <h2 id="blocked-success-title" className="mt-5 text-2xl font-semibold text-ink">Bed Blocked Successfully</h2>
            <p className="mt-3 leading-7 text-secondary">Your bed has been reserved temporarily.</p>
            <p className="mt-2 leading-7 text-secondary">Our team will contact you shortly to verify your details and confirm your booking.</p>
            <p className="mt-5 rounded-xl bg-paper px-4 py-3 text-sm font-semibold text-ink">Reference ID: <span className="text-brandDark">{success.referenceId}</span></p>
            <p className="mt-2 text-xs text-muted">Hold expires in {blockDurationHours()} hours.</p>
            <Link to="/my-bookings" className="mt-6 block"><Button className="w-full">Go to My Bookings</Button></Link>
          </div>
        </div>
      )}
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">Booking Details</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl">Resident Information</h1>
          <p className="mt-4 text-lg text-secondary">Complete the required details to block this bed for manual confirmation.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-14">
        <div className="grid gap-6">
          <FieldGroup title="Resident Information">
            <Input label="Full Name *" value={form.fullName} onChange={updateField("fullName")} />
            <Input label="Mobile Number *" value={form.mobileNumber} onChange={updateField("mobileNumber")} inputMode="numeric" maxLength="10" />
            <Input label="Date of Birth *" type="date" value={form.dateOfBirth} onChange={updateField("dateOfBirth")} />
            <SelectField label="Gender" required value={form.gender} onChange={updateField("gender")} options={["Male", "Female", "Other"]} />
            {!validation.mobileNumberValid && form.mobileNumber && <p className="text-sm font-semibold text-danger">Mobile number must contain exactly 10 digits and start with 6-9.</p>}
          </FieldGroup>

          <FieldGroup title="Address Information">
            <TextAreaField label="Current Address" required value={form.currentAddress} onChange={updateField("currentAddress")} />
          </FieldGroup>

          <FieldGroup title="College / Office Details">
            <SelectField label="Occupation" required value={form.occupation} onChange={updateField("occupation")} options={["Student", "Working Professional", "Business", "Other"]} />
            <div key={form.occupation || "empty"} className="grid gap-5 md:col-span-2 md:grid-cols-2 animate-[loginModeSwitch_300ms_ease-out]">
              {form.occupation === "Student" && <><Input label="College Name *" value={form.collegeName} onChange={updateField("collegeName")} /><Input label="Course / Department" value={form.courseDepartment} onChange={updateField("courseDepartment")} /></>}
              {form.occupation === "Working Professional" && <><Input label="Company Name *" value={form.companyName} onChange={updateField("companyName")} /><Input label="Designation" value={form.designation} onChange={updateField("designation")} /></>}
              {form.occupation === "Business" && <Input label="Business Name" value={form.businessName} onChange={updateField("businessName")} />}
              {!form.occupation && <p className="text-sm leading-6 text-secondary md:col-span-2">Select an occupation to add the relevant details.</p>}
            </div>
          </FieldGroup>

          <FieldGroup title="Government ID">
            <Input label="Aadhaar Number *" value={form.aadhaarNumber} onChange={updateField("aadhaarNumber")} inputMode="numeric" maxLength="12" />
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">Upload Aadhaar *</span>
              <input type="file" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" onChange={handleFile} className="min-h-12 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink file:mr-4 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white" />
            </label>
            {!validation.aadhaarValid && form.aadhaarNumber && <p className="text-sm font-semibold text-danger">Aadhaar number must contain exactly 12 digits.</p>}
            {fileError && <p className="text-sm font-semibold text-danger">{fileError}</p>}
            {form.aadhaarFile && (
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-secondary">
                <FileText className="h-4 w-4 text-brand" /> {form.aadhaarFile.name}
              </p>
            )}
          </FieldGroup>

        </div>

        <Card className="h-fit hover:translate-y-0 lg:sticky lg:top-24">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">Booking Summary</p>
          <h2 className="mt-3 text-2xl font-semibold text-ink">Selected Bed</h2>

          <div className="mt-6 grid gap-4 text-sm">
            {[
              ["Branch", branch.name],
              ["Room Number", `Room ${room.number}`],
              ["Sharing Type", room.sharingType],
              ["AC / Non AC", room.roomType],
              ["Selected Beds", selectedBeds.map((bed) => bed.positionLabel ? `${bed.position} ${bed.positionLabel}` : bed.label).join(", ") || "No beds selected"],
              ["Guests", guests],
              ["Check-in", checkIn],
              ["Check-out", checkOut || "Monthly stay"],
              ["Monthly Rent", formatCurrency(room.monthlyRent)],
              ["Security Deposit", formatCurrency(room.securityDeposit)],
              ["Hold Duration", `${blockDurationHours()} hours`]
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
                <span className="font-semibold text-secondary">{label}</span>
                <span className="text-right font-semibold text-ink">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-7 grid gap-3">
            <Link to={`/rooms?branch=${encodeURIComponent(branch.id)}&checkIn=${encodeURIComponent(checkIn)}&guests=${guests}`}>
              <Button variant="secondary" className="w-full">Back to Rooms</Button>
            </Link>
            {submitted && Object.keys(validation.errors).length > 0 && (
              <div className="rounded-xl border border-brand/20 bg-paper p-3 text-sm text-brandDark" role="alert">
                <p className="font-semibold">Please complete the required information:</p>
                <ul className="mt-2 list-inside list-disc space-y-1">{[...new Set(Object.values(validation.errors))].map((message) => <li key={message}>{message}</li>)}</ul>
              </div>
            )}
            {submissionError && <p className="rounded-xl border border-brand/20 bg-paper p-3 text-sm font-semibold text-brandDark" role="alert">{submissionError}</p>}
            <Button className="w-full" onClick={blockBed}>
              <LockKeyhole className="h-4 w-4" /> Block Bed
            </Button>
          </div>
        </Card>
      </section>
    </main>
  );
};

export default BookingDetails;
