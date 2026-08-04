import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const BOOKING_INTENT_KEY = "pg_booking_intent";

export const useBookingAuth = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showSignInNotice, setShowSignInNotice] = useState(false);
  const redirectTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(redirectTimer.current), []);

  const continueToBooking = ({ roomId, redirect, state, onAuthenticated }) => {
    if (isAuthenticated) {
      if (onAuthenticated) onAuthenticated();
      else navigate(redirect, { state });
      return;
    }

    const currentUrl = `${location.pathname}${location.search}${location.hash}`;
    sessionStorage.setItem(BOOKING_INTENT_KEY, JSON.stringify({ roomId, redirect, currentUrl }));
    setShowSignInNotice(true);
    window.clearTimeout(redirectTimer.current);
    redirectTimer.current = window.setTimeout(() => {
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`, {
        state: { from: { pathname: redirect }, bookingRoomId: roomId }
      });
    }, 1000);
  };

  return { continueToBooking, showSignInNotice };
};

export const BookingAuthToast = ({ visible }) => visible ? (
  <div role="status" aria-live="polite" className="fixed right-4 top-24 z-[70] flex max-w-sm animate-[loginPopup_250ms_ease-out] items-center gap-3 rounded-[14px] border border-brand/25 bg-white px-4 py-3 text-sm font-semibold text-ink shadow-luxury sm:right-6">
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/10 text-brand"><LogIn className="h-4 w-4" /></span>
    Please sign in to continue your booking.
  </div>
) : null;

export { BOOKING_INTENT_KEY };
