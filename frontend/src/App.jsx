import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import PublicLayout from "./components/layout/PublicLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import { getDashboardPathForRole, ROLES } from "./routes/roleRoutes";
import ComplaintsPage from "./pages/complaints/ComplaintsPage";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import BedsPage from "./pages/admin/BedsPage";
import BranchDetailsPage from "./pages/admin/BranchDetailsPage";
import BranchesPage from "./pages/admin/BranchesPage";
import BookingsPage from "./pages/admin/BookingsPage";
import ManagementPage from "./pages/admin/ManagementPage";
import PaymentsPage from "./pages/admin/PaymentsPage";
import ReportsPage from "./pages/admin/ReportsPage";
import ResidentsPage from "./pages/admin/ResidentsPage";
import RoomsPage from "./pages/admin/RoomsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import WardensPage from "./pages/admin/WardensPage";
import BedSelection from "./pages/guest/BedSelection";
import Booking from "./pages/guest/Booking";
import BookingDetails from "./pages/guest/BookingDetails";
import BookingStatus from "./pages/guest/BookingStatus";
import BranchListing from "./pages/guest/BranchListing";
import FeaturedBranches from "./pages/guest/FeaturedBranches";
import Home from "./pages/guest/Home";
import Profile from "./pages/guest/Profile";
import RoomDetails from "./pages/guest/RoomDetails";
import OccupancyPage from "./pages/warden/OccupancyPage";
import WardenDashboard from "./pages/warden/WardenDashboard";
import WardenPaymentsPage from "./pages/warden/WardenPaymentsPage";
import WardenResidentsPage from "./pages/warden/WardenResidentsPage";

const App = () => (
  <Routes>
    <Route element={<PublicLayout />}>
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="branches" element={<BranchListing />} />
      <Route path="featured-branches" element={<FeaturedBranches />} />
      <Route path="branches/:branchId/rooms" element={<RoomDetails />} />
      <Route path="rooms/:roomId/beds" element={<BedSelection />} />
      <Route path="booking-details" element={<BookingDetails />} />
      <Route path="booking-status" element={<BookingStatus />} />
      <Route element={<ProtectedRoute roles={[ROLES.USER]} />}>
        <Route path="booking" element={<Booking />} />
        <Route path="my-bookings" element={<BookingStatus />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
      <Route path="pgbooking/admin" element={<DashboardLayout role={ROLES.ADMIN} />}>
        <Route index element={<Navigate to={getDashboardPathForRole(ROLES.ADMIN)} replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="branches" element={<BranchesPage />} />
        <Route path="branches/:branchId" element={<BranchDetailsPage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="beds" element={<BedsPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="residents" element={<ResidentsPage />} />
        <Route path="wardens" element={<WardensPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="complaints" element={<ComplaintsPage role={ROLES.ADMIN} />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute roles={[ROLES.WARDEN]} />}>
      <Route path="pgbooking/warden" element={<DashboardLayout role={ROLES.WARDEN} />}>
        <Route index element={<Navigate to={getDashboardPathForRole(ROLES.WARDEN)} replace />} />
        <Route path="dashboard" element={<WardenDashboard />} />
        <Route path="residents" element={<WardenResidentsPage />} />
        <Route path="payments" element={<WardenPaymentsPage />} />
        <Route path="occupancy" element={<OccupancyPage />} />
        <Route path="complaints" element={<ComplaintsPage role={ROLES.WARDEN} />} />
      </Route>
    </Route>
  </Routes>
);

export default App;
