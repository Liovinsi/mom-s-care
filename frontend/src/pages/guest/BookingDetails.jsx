import { useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { CheckCircle2, FileText, Send } from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { bookingBranches, bookingRooms, formatCurrency } from "../../data/bookingFlow";
import { loadBeds } from "../../data/adminBeds";
import { MAX_ENQUIRIES_PER_BED, countActiveEnquiriesForBed, enquiryLimitMessage, findEnquiryForUserAndBed, loadEnquiries, saveEnquiries, tokenAmountForRoom, useLiveEnquiries } from "../../data/adminEnquiries";
import Toast from "../../components/ui/Toast";
import { publicBedIdFromAdminBed } from "../../lib/liveAvailability";
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
  aadhaarFile: null,
  message: ""
};

const selectClassName = "min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/25";
const textAreaClassName = "min-h-28 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-brand/25";
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
  const [submitting, setSubmitting] = useState(false);
  const [limitToast, setLimitToast] = useState("");

  const roomId = state?.roomId || searchParams.get("roomId");
  const bedId = state?.bedId || searchParams.get("bedId");
  const room = bookingRooms.find((item) => item.id === roomId) || bookingRooms[0];
  const branch = bookingBranches.find((item) => item.id === room.branchId) || bookingBranches[0];
  const selectedBed = room.bedList.find((bed) => bed.id === bedId) || state?.selectedBed || null;
  const selectedBeds = state?.selectedBeds?.length ? state.selectedBeds : selectedBed ? [selectedBed] : [];
  const guests = Math.max(1, Number(state?.guests || searchParams.get("guests")) || selectedBeds.length || 1);
  const checkIn = state?.checkIn || searchParams.get("checkIn") || todayValue();
  const checkOut = state?.checkOut || searchParams.get("checkOut") || "";
  const liveEnquiries = useLiveEnquiries();
  const previewAdminBeds = loadBeds();
  const previewBedId = (selected) => previewAdminBeds.find((bed) => bed.id === selected.id || publicBedIdFromAdminBed(bed) === selected.id)?.id || selected.id;
  const myDuplicateBed = selectedBeds.find((selected) => findEnquiryForUserAndBed(liveEnquiries, user || {}, previewBedId(selected)));
  const fullSelectedBed = !myDuplicateBed && selectedBeds.find((selected) => countActiveEnquiriesForBed(liveEnquiries, previewBedId(selected)) >= MAX_ENQUIRIES_PER_BED);
  const enquiryBlocked = Boolean(myDuplicateBed || fullSelectedBed);
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

  const sendEnquiry = () => {
    if (submitting) return;
    setSubmitted(true);
    setSubmissionError("");
    if (!validation.formValid) return;

    const storedEnquiries = loadEnquiries();
    const adminBeds = loadBeds();
    const selectedAdminBeds = selectedBeds.map((selected) => ({
      selected,
      adminBed: adminBeds.find((bed) => bed.id === selected.id || publicBedIdFromAdminBed(bed) === selected.id)
    }));
    // Enquiry submission is gated ONLY by duplicate-check and the 3-enquiry cap
    // below — never by bed.status/assigned/booked/occupied. Whether a bed is
    // genuinely assigned is a selection-time concern (it disables the bed tile on
    // BedSelection/RoomList so it can't be picked in the first place); it is
    // intentionally not re-checked here, so this flow can never show "already
    // been assigned to another guest".
    // One enquiry per user per bed — a user can still enquire freely on other beds.
    const duplicate = selectedAdminBeds.find(({ selected, adminBed }) => findEnquiryForUserAndBed(storedEnquiries, user || {}, adminBed?.id || selected.id));
    if (duplicate) {
      setSubmissionError("You already sent an enquiry for this bed. Our admin team will contact you.");
      return;
    }

    // A bed keeps taking enquiries from different users up to the cap — the admin,
    // not the enquiry count, decides who gets it. This is a client-side mirror of
    // the same limit the backend must also enforce to survive concurrent submits.
    const fullBed = selectedAdminBeds.find(({ selected, adminBed }) => countActiveEnquiriesForBed(storedEnquiries, adminBed?.id || selected.id) >= MAX_ENQUIRIES_PER_BED);
    if (fullBed) {
      setLimitToast(enquiryLimitMessage(fullBed.selected.label || fullBed.adminBed?.bedName));
      setSubmissionError(`${fullBed.selected.label || fullBed.adminBed?.bedName || "This bed"} already has ${MAX_ENQUIRIES_PER_BED} enquiries. Please choose another bed.`);
      return;
    }

    const createdAt = new Date().toISOString();
    const highestEnquiryNumber = storedEnquiries.reduce((value, enquiry) => Math.max(value, Number(String(enquiry.id).replace(/\D/g, "") || 0)), 0);
    const newEnquiries = selectedAdminBeds.map(({ selected, adminBed }, index) => ({
      id: `ENQ${String(highestEnquiryNumber + index + 1).padStart(5, "0")}`,
      userId: user?.id || "",
      userName: form.fullName,
      phone: form.mobileNumber,
      email: user?.email || "",
      gender: form.gender,
      dob: form.dateOfBirth,
      currentAddress: form.currentAddress,
      occupation: form.occupation,
      organization: form.occupation === "Student" ? form.collegeName : form.occupation === "Working Professional" ? form.companyName : form.occupation === "Business" ? form.businessName : "",
      aadhaarNumber: `XXXX XXXX ${form.aadhaarNumber.slice(-4)}`,
      aadhaarFront: form.aadhaarFile?.name || "",
      message: form.message,
      branchId: String(branch.id).replace(/-pg$/, ""),
      branchName: branch.name.replace(/\s*PG$/, ""),
      roomId: room.id,
      roomNumber: room.number,
      bedId: adminBed?.id || selected.id,
      bedName: selected.positionLabel ? `${selected.position} ${selected.positionLabel}` : selected.label || adminBed?.bedName,
      sharingType: room.sharingType,
      roomType: room.roomType,
      moveInDate: checkIn,
      checkOutDate: checkOut,
      expectedStay: checkOut ? `${checkIn} to ${checkOut}` : "Monthly stay",
      tokenAmount: tokenAmountForRoom(room),
      monthlyRent: room.monthlyRent,
      securityDeposit: room.securityDeposit,
      status: "NEW",
      adminNotes: "",
      paymentStatus: "Not Required",
      createdAt,
      contactedAt: "",
      approvedAt: "",
      rejectedAt: ""
    }));

    setSubmitting(true);
    window.setTimeout(() => {
      // Bed status is intentionally left untouched: many guests can enquire about the
      // same bed and it must keep showing AVAILABLE until an admin approves one of them.
      saveEnquiries([...newEnquiries, ...storedEnquiries]);
      setSubmitting(false);
      setSuccess({ referenceId: newEnquiries[0].id });
    }, 450);
  };

  return (
    <main className="bg-paper/70">
      <Toast message={limitToast} onClose={() => setLimitToast("")} />
      {success && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/45 px-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="enquiry-success-title" className="w-full max-w-md animate-[loginPopup_300ms_ease-out] rounded-[22px] border border-brand/20 bg-white p-7 text-center shadow-luxury sm:p-8">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400"><CheckCircle2 className="h-9 w-9" /></span>
            <h2 id="enquiry-success-title" className="mt-5 text-2xl font-semibold text-ink">Enquiry Submitted Successfully</h2>
            <p className="mt-3 leading-7 text-secondary">Our admin will contact you shortly.</p>
            <p className="mt-2 leading-7 text-secondary">You can continue browsing other PG options while you wait — this bed stays available to others until an admin confirms your enquiry.</p>
            <p className="mt-5 rounded-xl bg-paper px-4 py-3 text-sm font-semibold text-ink">Reference ID: <span className="text-brandDark">{success.referenceId}</span></p>
            <Link to="/my-bookings" className="mt-6 block"><Button className="w-full">Go to My Enquiries</Button></Link>
          </div>
        </div>
      )}
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">Send Enquiry</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl">Resident Information</h1>
          <p className="mt-4 text-lg text-secondary">Complete the required details to send an enquiry for this bed. Our admin will call you to confirm availability — no payment is needed yet.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-14">
        <div className="grid gap-6">
          <FieldGroup title="Resident Information">
            <Input label="Full Name *" value={form.fullName} onChange={updateField("fullName")} />
            <Input label="Mobile Number *" value={form.mobileNumber} onChange={updateField("mobileNumber")} type="text" inputMode="numeric" autoComplete="tel" />
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
            <Input label="Aadhaar Number *" value={form.aadhaarNumber} onChange={updateField("aadhaarNumber")} type="text" inputMode="numeric" autoComplete="off" placeholder="123456789012" />
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

          <FieldGroup title="Additional Requirements">
            <TextAreaField label="Message / Additional Requirements (optional)" value={form.message} onChange={updateField("message")} />
          </FieldGroup>

        </div>

        <Card className="h-fit hover:translate-y-0 lg:sticky lg:top-24">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-brand">Enquiry Summary</p>
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
              ["Security Deposit", formatCurrency(room.securityDeposit)]
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
            {!submissionError && myDuplicateBed && <p className="rounded-xl border border-line bg-paper p-3 text-sm font-semibold text-secondary" role="status">You already sent an enquiry for this bed. Our admin team will contact you.</p>}
            {!submissionError && !myDuplicateBed && fullSelectedBed && <p className="rounded-xl border border-line bg-paper p-3 text-sm font-semibold text-secondary" role="status">{enquiryLimitMessage(fullSelectedBed.label)}</p>}
            <Button className={`w-full ${enquiryBlocked ? "opacity-60" : ""}`} onClick={sendEnquiry} disabled={submitting}>
              <Send className="h-4 w-4" /> {submitting ? "Sending Enquiry..." : myDuplicateBed ? "Enquiry Already Sent" : fullSelectedBed ? "Enquiry Limit Reached" : "Send Enquiry"}
            </Button>
          </div>
        </Card>
      </section>
    </main>
  );
};

export default BookingDetails;
