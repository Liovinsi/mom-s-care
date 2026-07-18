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

module.exports = { attachSocket, emitBedAvailability, emitPaymentUpdate };
