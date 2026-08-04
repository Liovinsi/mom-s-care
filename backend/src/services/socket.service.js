let io;

const attachSocket = (serverIo) => {
  io = serverIo;
};

const emitBedAvailability = (bed) => {
  if (!io || !bed) return;
  const payload = {
    id: bed._id,
    room: bed.room,
    branch: bed.branch,
    status: bed.status,
    holdExpiresAt: bed.holdExpiresAt
  };
  io.to(`room:${bed.room.toString()}`).emit("bed:updated", payload);
  io.emit("availability:updated", payload);
};

const emitPaymentUpdate = (payment) => {
  if (!io || !payment) return;
  io.emit("payment:updated", {
    id: payment._id,
    branch: payment.branch,
    receiptNumber: payment.receiptNumber,
    amount: payment.amount,
    status: payment.status,
    paidAt: payment.paidAt
  });
};

const emitBookingBlocked = (booking) => {
  if (!io || !booking) return;
  io.emit("booking:blocked", {
    id: booking._id,
    guestName: booking.guestName,
    guestPhone: booking.guestPhone,
    branch: booking.branch,
    room: booking.room,
    bed: booking.bed,
    status: booking.status,
    source: booking.source,
    createdAt: booking.createdAt
  });
};

const emitStatusUpdateRequest = (request) => {
  if (!io || !request) return;
  io.emit("status-update-request:updated", {
    id: request._id,
    branch: request.branch,
    room: request.room,
    bed: request.bed,
    currentStatus: request.currentStatus,
    requestedStatus: request.requestedStatus,
    status: request.status,
    requestedByName: request.requestedByName,
    createdAt: request.createdAt
  });
};

module.exports = { attachSocket, emitBedAvailability, emitPaymentUpdate, emitBookingBlocked, emitStatusUpdateRequest };
