import {
  Bell,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Database,
  Download,
  Globe2,
  ImagePlus,
  LockKeyhole,
  MapPin,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
  Upload,
  UserCircle
} from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const fieldClass = "min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15 disabled:bg-paper disabled:text-slate-500";
const textareaClass = `${fieldClass} min-h-28 py-3`;

const menuItems = [
  { id: "general", label: "General", icon: Settings },
  { id: "company", label: "Company", icon: Building2 },
  { id: "branches", label: "Branches", icon: MapPin },
  { id: "booking", label: "Booking", icon: CalendarCheck },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: LockKeyhole },
  { id: "profile", label: "Profile", icon: UserCircle },
  { id: "backup", label: "Backup", icon: Database }
];

const defaultSettings = {
  general: {
    systemName: "PGStay Admin",
    systemLogo: "",
    favicon: "",
    timezone: "Asia/Kolkata",
    currency: "INR",
    language: "English"
  },
  company: {
    companyName: "PGStay Hospitality",
    ownerName: "Arun Prakash",
    email: "admin@pgstay.in",
    phone: "9876543210",
    website: "https://pgstay.in",
    gstNumber: "33ABCDE1234F1Z5",
    address: "Anna Nagar, Chennai, Tamil Nadu",
    googleMapLink: "https://maps.google.com",
    companyLogo: ""
  },
  branches: {
    defaultCheckInTime: "12:00",
    defaultCheckOutTime: "10:00",
    bookingTokenAmount: "5000",
    maximumAdvanceBookingDays: "45",
    allowOnlineBooking: true,
    branchEnabled: true
  },
  booking: {
    autoApproveBooking: false,
    requireAadhaarUpload: true,
    requireTokenPayment: true,
    allowBookingCancellation: true,
    cancellationHours: "24"
  },
  payments: {
    paymentGateway: "Razorpay",
    upiId: "pgstay@upi",
    bankAccount: "PGStay Hospitality - 1234567890",
    gstPercentage: "18",
    lateFeeAmount: "250",
    lateFeeGraceDays: "5",
    refundPolicy: "Refunds are processed after check-out inspection and adjusted against pending dues."
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    whatsappNotifications: true,
    adminAlerts: true,
    wardenAlerts: true,
    residentAlerts: true
  },
  security: {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorAuthentication: true,
    sessionTimeout: "30",
    loginAttemptLimit: "5"
  },
  profile: {
    profilePhoto: "",
    name: "Admin Manager",
    email: "admin@pgstay.in",
    phone: "9876543210",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  },
  backup: {
    lastBackupDate: "18 Jul 2026, 09:30 AM",
    restoreFile: ""
  }
};

const requiredFields = {
  general: ["systemName", "timezone", "currency", "language"],
  company: ["companyName", "ownerName", "email", "phone", "address"],
  branches: ["defaultCheckInTime", "defaultCheckOutTime", "bookingTokenAmount", "maximumAdvanceBookingDays"],
  booking: ["cancellationHours"],
  payments: ["paymentGateway", "upiId", "bankAccount", "gstPercentage", "lateFeeAmount", "lateFeeGraceDays"],
  notifications: [],
  security: ["sessionTimeout", "loginAttemptLimit"],
  profile: ["name", "email", "phone"],
  backup: []
};

const labels = {
  systemName: "System Name",
  timezone: "Timezone",
  currency: "Currency",
  language: "Language",
  companyName: "Company Name",
  ownerName: "Owner Name",
  email: "Email",
  phone: "Phone",
  address: "Address",
  defaultCheckInTime: "Default Check-In Time",
  defaultCheckOutTime: "Default Check-Out Time",
  bookingTokenAmount: "Booking Token Amount",
  maximumAdvanceBookingDays: "Maximum Advance Booking Days",
  cancellationHours: "Cancellation Hours",
  paymentGateway: "Payment Gateway",
  upiId: "UPI ID",
  bankAccount: "Bank Account",
  gstPercentage: "GST Percentage",
  lateFeeAmount: "Late Fee Amount",
  lateFeeGraceDays: "Late Fee Grace Days",
  sessionTimeout: "Session Timeout",
  loginAttemptLimit: "Login Attempt Limit",
  name: "Name"
};

const validateSection = (section, values) => {
  const errors = {};
  requiredFields[section].forEach((field) => {
    if (!String(values[field] || "").trim()) errors[field] = `${labels[field]} is required`;
  });
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Enter a valid email";
  if (values.phone && !/^\d{10}$/.test(values.phone)) errors.phone = "Enter a 10 digit phone number";
  if (values.newPassword || values.confirmPassword) {
    if (values.newPassword.length < 8) errors.newPassword = "Password must be at least 8 characters";
    if (values.newPassword !== values.confirmPassword) errors.confirmPassword = "Passwords do not match";
  }
  return errors;
};

const Field = ({ label, required, error, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-ink">{label}{required && " *"}</span>
    {children}
    {error && <span className="mt-1 block text-xs font-semibold text-danger">{error}</span>}
  </label>
);

const Toggle = ({ label, checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="flex min-h-12 items-center justify-between rounded-xl border border-line bg-white px-4 text-left transition hover:border-gold"
  >
    <span className="text-sm font-semibold text-ink">{label}</span>
    <span className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-gold" : "bg-slate-300"}`}>
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`} />
    </span>
  </button>
);

const FileUpload = ({ label, value, accept = "image/*", onChange }) => (
  <div>
    <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
    <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
      <div className="grid h-28 place-items-center overflow-hidden rounded-xl border border-line bg-paper">
        {value ? <img src={value} alt={label} className="h-full w-full object-cover" /> : <ImagePlus className="h-7 w-7 text-muted" />}
      </div>
      <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line bg-white px-4 text-center text-sm font-semibold text-ink transition hover:border-gold hover:text-gold">
        <Upload className="mb-2 h-5 w-5" />
        Upload {label}
        <span className="mt-1 text-xs font-medium text-slate-500">JPG, PNG, WEBP preferred</span>
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => onChange(reader.result);
            reader.readAsDataURL(file);
          }}
        />
      </label>
    </div>
  </div>
);

const SaveBar = ({ onSave, saved }) => (
  <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
    <Button onClick={onSave}><Save className="h-4 w-4" /> Save Changes</Button>
    {saved && <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Settings saved</span>}
  </div>
);

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState(defaultSettings);
  const [errors, setErrors] = useState({});
  const [savedSection, setSavedSection] = useState("");

  const activeMenu = useMemo(() => menuItems.find((item) => item.id === activeTab), [activeTab]);

  const update = (section, field, value) => {
    setSettings((current) => ({ ...current, [section]: { ...current[section], [field]: value } }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setSavedSection("");
  };

  const save = (section) => {
    const nextErrors = validateSection(section, settings[section]);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSavedSection(section);
  };

  const input = (section, field, label, props = {}) => (
    <Field label={label} required={requiredFields[section].includes(field)} error={errors[field]}>
      <input
        className={fieldClass}
        value={settings[section][field]}
        onChange={(event) => update(section, field, event.target.value)}
        {...props}
      />
    </Field>
  );

  const select = (section, field, label, options) => (
    <Field label={label} required={requiredFields[section].includes(field)} error={errors[field]}>
      <select className={fieldClass} value={settings[section][field]} onChange={(event) => update(section, field, event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </Field>
  );

  const renderPanel = () => {
    if (activeTab === "general") {
      return (
        <SettingsPanel title="General" icon={Globe2}>
          <div className="grid gap-4 lg:grid-cols-2">
            {input("general", "systemName", "System Name")}
            {select("general", "timezone", "Timezone", ["Asia/Kolkata", "UTC", "Asia/Dubai", "Asia/Singapore"])}
            {select("general", "currency", "Currency", ["INR", "USD", "AED", "SGD"])}
            {select("general", "language", "Language", ["English", "Tamil", "Hindi"])}
            <FileUpload label="System Logo" value={settings.general.systemLogo} onChange={(value) => update("general", "systemLogo", value)} />
            <FileUpload label="Favicon" value={settings.general.favicon} onChange={(value) => update("general", "favicon", value)} />
          </div>
          <SaveBar onSave={() => save("general")} saved={savedSection === "general"} />
        </SettingsPanel>
      );
    }

    if (activeTab === "company") {
      return (
        <SettingsPanel title="Company" icon={Building2}>
          <div className="grid gap-4 lg:grid-cols-2">
            {input("company", "companyName", "Company Name")}
            {input("company", "ownerName", "Owner Name")}
            {input("company", "email", "Email", { type: "email" })}
            {input("company", "phone", "Phone")}
            {input("company", "website", "Website")}
            {input("company", "gstNumber", "GST Number")}
            {input("company", "googleMapLink", "Google Map Link")}
            <FileUpload label="Company Logo" value={settings.company.companyLogo} onChange={(value) => update("company", "companyLogo", value)} />
            <div className="lg:col-span-2">
              <Field label="Address" required error={errors.address}>
                <textarea className={textareaClass} value={settings.company.address} onChange={(event) => update("company", "address", event.target.value)} />
              </Field>
            </div>
          </div>
          <SaveBar onSave={() => save("company")} saved={savedSection === "company"} />
        </SettingsPanel>
      );
    }

    if (activeTab === "branches") {
      return (
        <SettingsPanel title="Branch Settings" icon={MapPin}>
          <div className="grid gap-4 lg:grid-cols-2">
            {input("branches", "defaultCheckInTime", "Default Check-In Time", { type: "time" })}
            {input("branches", "defaultCheckOutTime", "Default Check-Out Time", { type: "time" })}
            {input("branches", "bookingTokenAmount", "Booking Token Amount", { type: "number", min: "0" })}
            {input("branches", "maximumAdvanceBookingDays", "Maximum Advance Booking Days", { type: "number", min: "1" })}
            <Toggle label="Allow Online Booking" checked={settings.branches.allowOnlineBooking} onChange={(value) => update("branches", "allowOnlineBooking", value)} />
            <Toggle label="Enable Branch" checked={settings.branches.branchEnabled} onChange={(value) => update("branches", "branchEnabled", value)} />
          </div>
          <SaveBar onSave={() => save("branches")} saved={savedSection === "branches"} />
        </SettingsPanel>
      );
    }

    if (activeTab === "booking") {
      return (
        <SettingsPanel title="Booking Settings" icon={CalendarCheck}>
          <div className="grid gap-4 lg:grid-cols-2">
            <Toggle label="Auto Approve Booking" checked={settings.booking.autoApproveBooking} onChange={(value) => update("booking", "autoApproveBooking", value)} />
            <Toggle label="Require Aadhaar Upload" checked={settings.booking.requireAadhaarUpload} onChange={(value) => update("booking", "requireAadhaarUpload", value)} />
            <Toggle label="Require Token Payment" checked={settings.booking.requireTokenPayment} onChange={(value) => update("booking", "requireTokenPayment", value)} />
            <Toggle label="Allow Booking Cancellation" checked={settings.booking.allowBookingCancellation} onChange={(value) => update("booking", "allowBookingCancellation", value)} />
            {input("booking", "cancellationHours", "Cancellation Hours", { type: "number", min: "0" })}
          </div>
          <SaveBar onSave={() => save("booking")} saved={savedSection === "booking"} />
        </SettingsPanel>
      );
    }

    if (activeTab === "payments") {
      return (
        <SettingsPanel title="Payment Settings" icon={CreditCard}>
          <div className="grid gap-4 lg:grid-cols-2">
            {select("payments", "paymentGateway", "Payment Gateway", ["Razorpay", "Cashfree", "PayU", "Manual"])}
            {input("payments", "upiId", "UPI ID")}
            {input("payments", "bankAccount", "Bank Account")}
            {input("payments", "gstPercentage", "GST Percentage", { type: "number", min: "0" })}
            {input("payments", "lateFeeAmount", "Late Fee Amount", { type: "number", min: "0" })}
            {input("payments", "lateFeeGraceDays", "Late Fee Grace Days", { type: "number", min: "0" })}
            <div className="lg:col-span-2">
              <Field label="Refund Policy">
                <textarea className={textareaClass} value={settings.payments.refundPolicy} onChange={(event) => update("payments", "refundPolicy", event.target.value)} />
              </Field>
            </div>
          </div>
          <SaveBar onSave={() => save("payments")} saved={savedSection === "payments"} />
        </SettingsPanel>
      );
    }

    if (activeTab === "notifications") {
      return (
        <SettingsPanel title="Notification Settings" icon={Bell}>
          <div className="grid gap-4 lg:grid-cols-2">
            <Toggle label="Email Notifications" checked={settings.notifications.emailNotifications} onChange={(value) => update("notifications", "emailNotifications", value)} />
            <Toggle label="SMS Notifications" checked={settings.notifications.smsNotifications} onChange={(value) => update("notifications", "smsNotifications", value)} />
            <Toggle label="WhatsApp Notifications" checked={settings.notifications.whatsappNotifications} onChange={(value) => update("notifications", "whatsappNotifications", value)} />
            <Toggle label="Admin Alerts" checked={settings.notifications.adminAlerts} onChange={(value) => update("notifications", "adminAlerts", value)} />
            <Toggle label="Warden Alerts" checked={settings.notifications.wardenAlerts} onChange={(value) => update("notifications", "wardenAlerts", value)} />
            <Toggle label="Resident Alerts" checked={settings.notifications.residentAlerts} onChange={(value) => update("notifications", "residentAlerts", value)} />
          </div>
          <SaveBar onSave={() => save("notifications")} saved={savedSection === "notifications"} />
        </SettingsPanel>
      );
    }

    if (activeTab === "security") {
      return (
        <SettingsPanel title="Security" icon={ShieldCheck}>
          <div className="grid gap-4 lg:grid-cols-2">
            {input("security", "currentPassword", "Change Password", { type: "password", placeholder: "Current password" })}
            {input("security", "newPassword", "New Password", { type: "password" })}
            {input("security", "confirmPassword", "Confirm Password", { type: "password" })}
            {input("security", "sessionTimeout", "Session Timeout", { type: "number", min: "5" })}
            {input("security", "loginAttemptLimit", "Login Attempt Limit", { type: "number", min: "1" })}
            <Toggle label="Two-Factor Authentication" checked={settings.security.twoFactorAuthentication} onChange={(value) => update("security", "twoFactorAuthentication", value)} />
          </div>
          <SaveBar onSave={() => save("security")} saved={savedSection === "security"} />
        </SettingsPanel>
      );
    }

    if (activeTab === "profile") {
      return (
        <SettingsPanel title="Admin Profile" icon={UserCircle}>
          <div className="grid gap-4 lg:grid-cols-2">
            <FileUpload label="Profile Photo" value={settings.profile.profilePhoto} onChange={(value) => update("profile", "profilePhoto", value)} />
            {input("profile", "name", "Name")}
            {input("profile", "email", "Email", { type: "email" })}
            {input("profile", "phone", "Phone")}
            {input("profile", "currentPassword", "Change Password", { type: "password", placeholder: "Current password" })}
            {input("profile", "newPassword", "New Password", { type: "password" })}
            {input("profile", "confirmPassword", "Confirm Password", { type: "password" })}
          </div>
          <SaveBar onSave={() => save("profile")} saved={savedSection === "profile"} />
        </SettingsPanel>
      );
    }

    return (
      <SettingsPanel title="Backup" icon={Database}>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-gold/30 bg-gold/5">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-gold">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Last Backup Date</p>
                <p className="mt-1 text-lg font-bold text-ink">{settings.backup.lastBackupDate}</p>
              </div>
            </div>
          </Card>
          <Card>
            <p className="text-sm font-semibold text-slate-500">Database Backup</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={() => update("backup", "lastBackupDate", "18 Jul 2026, 10:15 AM")}><Database className="h-4 w-4" /> Create Backup</Button>
              <Button variant="secondary"><Download className="h-4 w-4" /> Download Backup</Button>
            </div>
          </Card>
          <div className="lg:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-ink">Restore Backup</span>
            <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line bg-white px-4 text-center text-sm font-semibold text-ink transition hover:border-gold hover:text-gold">
              <RotateCcw className="mb-2 h-5 w-5" />
              {settings.backup.restoreFile || "Upload Backup File"}
              <span className="mt-1 text-xs font-medium text-slate-500">Select a database backup file to restore</span>
              <input type="file" className="hidden" onChange={(event) => update("backup", "restoreFile", event.target.files?.[0]?.name || "")} />
            </label>
          </div>
        </div>
      </SettingsPanel>
    );
  };

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
        <p className="text-sm text-slate-500">Manage system preferences and configurations.</p>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[280px_1fr]">
        <Card className="p-2">
          <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setErrors({});
                    setSavedSection("");
                  }}
                  className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-left text-sm font-bold transition ${
                    active ? "bg-gold text-white shadow-[0_12px_24px_rgba(212,175,55,0.22)]" : "text-slate-600 hover:bg-paper hover:text-ink"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </Card>

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
            {activeMenu && <activeMenu.icon className="h-4 w-4 text-gold" />}
            {activeMenu?.label}
          </div>
          {renderPanel()}
        </div>
      </div>
    </div>
  );
};

const SettingsPanel = ({ title, icon: Icon, children }) => (
  <Card className="space-y-5">
    <div className="flex items-center gap-3 border-b border-line pb-5">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-gold/10 text-gold">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="text-xl font-bold text-ink">{title}</h2>
    </div>
    {children}
  </Card>
);

export default SettingsPage;
