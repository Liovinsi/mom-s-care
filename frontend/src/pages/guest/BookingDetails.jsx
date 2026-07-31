import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FileText, ShieldCheck } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { bookingBranches, bookingRooms, formatCurrency } from "../../data/bookingFlow";
import { loadBeds } from "../../data/adminBeds";
import { loadBookings, saveBookings } from "../../data/adminBookings";
import { loadRooms } from "../../data/adminRooms";
import { publicBedIdFromAdminBed, saveAvailabilitySnapshot } from "../../lib/liveAvailability";

const initialForm = {
  fullName: "",
  mobileNumber: "",
  dateOfBirth: "",
  gender: "",
  residentType: "",
  guardianName: "",
  guardianRelationship: "",
  guardianMobile: "",
  alternateMobile: "",
  currentAddress: "",
  city: "",
  state: "",
  pincode: "",
  collegeName: "",
  collegeAddress: "",
  companyName: "",
  officeAddress: "",
  aadhaarNumber: "",
  aadhaarFile: null,
  emergencyName: "",
  emergencyRelationship: "",
  emergencyMobile: ""
};

const selectClassName = "min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/25";
const textAreaClassName = "min-h-28 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-brand/25";
const tokenAmount = 5000;
const mobilePattern = /^[6-9]\d{9}$/;
const numericFields = {
  mobileNumber: 10,
  guardianMobile: 10,
  alternateMobile: 10,
  emergencyMobile: 10,
  aadhaarNumber: 12,
  pincode: 6
};

const todayValue = () => new Date().toISOString().slice(0, 10);

const createBookingId = (bookings) => {
  const maxId = bookings.reduce((value, booking) => Math.max(value, Number(String(booking.id).replace(/\D/g, "") || 0)), 0);
  return `BK${String(maxId + 1).padStart(4, "0")}`;
};

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
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(initialForm);
  const [fileError, setFileError] = useState("");

  const roomId = state?.roomId || searchParams.get("roomId");
  const bedId = state?.bedId || searchParams.get("bedId");
  const room = bookingRooms.find((item) => item.id === roomId) || bookingRooms[0];
  const branch = bookingBranches.find((item) => item.id === room.branchId) || bookingBranches[0];
  const selectedBed = room.bedList.find((bed) => bed.id === bedId) || state?.selectedBed || null;

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
      "residentType",
      "guardianName",
      "guardianMobile",
      "currentAddress",
      "city",
      "state",
      "pincode",
      "aadhaarNumber",
      "emergencyName",
      "emergencyRelationship",
      "emergencyMobile"
    ];

    if (form.residentType === "Student") requiredFields.push("collegeName", "collegeAddress");
    if (form.residentType === "Working Professional") requiredFields.push("companyName", "officeAddress");

    const requiredComplete = requiredFields.every((field) => String(form[field]).trim());
    const aadhaarValid = /^\d{12}$/.test(form.aadhaarNumber);
    const mobileNumberValid = mobilePattern.test(form.mobileNumber);
    const guardianMobileValid = mobilePattern.test(form.guardianMobile);
    const alternateMobileValid = !form.alternateMobile || mobilePattern.test(form.alternateMobile);
    const emergencyMobileValid = mobilePattern.test(form.emergencyMobile);
    const fileValid = Boolean(form.aadhaarFile) && !fileError;

    return {
      aadhaarValid,
      mobileNumberValid,
      guardianMobileValid,
      alternateMobileValid,
      emergencyMobileValid,
      fileValid,
      formValid: requiredComplete && aadhaarValid && mobileNumberValid && guardianMobileValid && alternateMobileValid && emergencyMobileValid && fileValid && Boolean(selectedBed)
    };
  }, [fileError, form, selectedBed]);

  const blockBed = () => {
    if (!validation.formValid) return;

    const storedBookings = loadBookings();
    const bookingId = createBookingId(storedBookings);
    const adminBeds = loadBeds();
    const adminBed = adminBeds.find((bed) => bed.id === selectedBed.id || publicBedIdFromAdminBed(bed) === selectedBed.id);

    if (adminBed) {
      const nextBeds = adminBeds.map((bed) => (
        bed.id === adminBed.id
          ? {
              ...bed,
              status: "Reserved",
              currentResident: "",
              bookingId,
              checkInDate: todayValue(),
              checkOutDate: ""
            }
          : bed
      ));
      saveAvailabilitySnapshot(nextBeds, loadRooms());
    }

    const booking = {
      id: bookingId,
      customerName: form.fullName,
      gender: form.gender,
      dob: form.dateOfBirth,
      phone: form.mobileNumber,
      email: "",
      emergencyContact: `${form.emergencyName} - ${form.emergencyMobile}`,
      occupation: form.residentType,
      organization: form.residentType === "Student" ? form.collegeName : form.companyName,
      aadhaarNumber: `XXXX XXXX ${form.aadhaarNumber.slice(-4)}`,
      aadhaarFront: "",
      aadhaarBack: "",
      branchId: String(branch.id).replace(/-pg$/, ""),
      branchName: branch.name.replace(/\s*PG$/, ""),
      roomId: room.id,
      roomNumber: room.number,
      bedId: adminBed?.id || selectedBed.id,
      bedName: selectedBed.label,
      sharingType: room.sharingType,
      roomType: room.roomType,
      bookingDate: todayValue(),
      moveInDate: todayValue(),
      expectedStay: "Pending discussion",
      tokenAmount,
      transactionId: "",
      paymentMethod: "Manual",
      paymentDate: "",
      paymentScreenshot: "",
      paymentStatus: "Pending",
      bookingStatus: "Pending",
      assignedWardenId: "",
      assignedWardenName: "",
      rejectionReason: ""
    };

    saveBookings([booking, ...storedBookings]);

    navigate("/booking-status", {
      state: {
        booking: {
          branch: branch.name,
          roomNumber: room.number,
          sharingType: room.sharingType,
          roomType: room.roomType,
          selectedBed: selectedBed.label,
          monthlyRent: room.monthlyRent,
          securityDeposit: room.securityDeposit,
          tokenAmount,
          status: "Blocked",
          guestName: form.fullName,
          mobileNumber: form.mobileNumber
        }
      }
    });
  };

  return (
    <main className="bg-paper/70">
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
            <SelectField label="Gender" value={form.gender} onChange={updateField("gender")} options={["Male", "Female", "Other"]} />
            <SelectField label="Resident Type" required value={form.residentType} onChange={updateField("residentType")} options={["Student", "Working Professional"]} />
            <Input label="Parent / Guardian Name *" value={form.guardianName} onChange={updateField("guardianName")} />
            <SelectField label="Relationship" value={form.guardianRelationship} onChange={updateField("guardianRelationship")} options={["Father", "Mother", "Husband", "Wife", "Guardian"]} />
            <Input label="Parent / Guardian Mobile Number *" value={form.guardianMobile} onChange={updateField("guardianMobile")} inputMode="numeric" maxLength="10" />
            <Input label="Alternate Mobile Number" value={form.alternateMobile} onChange={updateField("alternateMobile")} inputMode="numeric" maxLength="10" />
            {!validation.mobileNumberValid && form.mobileNumber && <p className="text-sm font-semibold text-danger">Mobile number must contain exactly 10 digits and start with 6-9.</p>}
            {!validation.guardianMobileValid && form.guardianMobile && <p className="text-sm font-semibold text-danger">Parent / Guardian mobile must contain exactly 10 digits and start with 6-9.</p>}
            {!validation.alternateMobileValid && form.alternateMobile && <p className="text-sm font-semibold text-danger">Alternate mobile must contain exactly 10 digits and start with 6-9.</p>}
          </FieldGroup>

          <FieldGroup title="Address Information">
            <TextAreaField label="Current Address" required value={form.currentAddress} onChange={updateField("currentAddress")} />
            <Input label="City *" value={form.city} onChange={updateField("city")} />
            <Input label="State *" value={form.state} onChange={updateField("state")} />
            <Input label="Pincode *" value={form.pincode} onChange={updateField("pincode")} inputMode="numeric" />
          </FieldGroup>

          <FieldGroup title="College / Office Details">
            {form.residentType === "Working Professional" ? (
              <>
                <Input label="Company Name *" value={form.companyName} onChange={updateField("companyName")} />
                <TextAreaField label="Office Address" required value={form.officeAddress} onChange={updateField("officeAddress")} />
              </>
            ) : form.residentType === "Student" ? (
              <>
                <Input label="College Name *" value={form.collegeName} onChange={updateField("collegeName")} />
                <TextAreaField label="College Address" required value={form.collegeAddress} onChange={updateField("collegeAddress")} />
              </>
            ) : (
              <p className="text-sm leading-6 text-secondary md:col-span-2">Select resident type to enter college or office details.</p>
            )}
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

          <FieldGroup title="Emergency Contact">
            <Input label="Emergency Contact Name *" value={form.emergencyName} onChange={updateField("emergencyName")} />
            <Input label="Relationship *" value={form.emergencyRelationship} onChange={updateField("emergencyRelationship")} />
            <Input label="Emergency Contact Mobile *" value={form.emergencyMobile} onChange={updateField("emergencyMobile")} inputMode="numeric" maxLength="10" />
            {!validation.emergencyMobileValid && form.emergencyMobile && <p className="text-sm font-semibold text-danger">Emergency contact mobile must contain exactly 10 digits and start with 6-9.</p>}
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
              ["Selected Bed", selectedBed?.label || "No bed selected"],
              ["Monthly Rent", formatCurrency(room.monthlyRent)],
              ["Security Deposit", formatCurrency(room.securityDeposit)],
              ["Manual Confirmation Amount", formatCurrency(tokenAmount)]
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
                <span className="font-semibold text-secondary">{label}</span>
                <span className="text-right font-semibold text-ink">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-7 grid gap-3">
            <Link to={`/rooms/${room.id}/beds`}>
              <Button variant="secondary" className="w-full">Back</Button>
            </Link>
            <Button className="w-full" disabled={!validation.formValid} onClick={blockBed}>
              <ShieldCheck className="h-4 w-4" /> Block Bed
            </Button>
          </div>
        </Card>
      </section>
    </main>
  );
};

export default BookingDetails;
