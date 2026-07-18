export const computeAmountDue = (booking, payments = []) => {
  if (!booking) return 0;

  const totalDue = Number(booking.monthly_rent || 0) + Number(booking.deposit_amount || 0);
  const paid = payments
    .filter((payment) => payment.booking_id === booking.booking_id && payment.status === "paid")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  return Math.max(totalDue - paid, 0);
};
