const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const env = require("./config/env");
const { attachSocket } = require("./services/socket.service");

const start = async () => {
  await connectDB();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: env.clientUrl, credentials: true }
  });

  attachSocket(io);

  io.on("connection", (socket) => {
    socket.on("room:join", (roomId) => socket.join(`room:${roomId}`));
    socket.on("room:leave", (roomId) => socket.leave(`room:${roomId}`));
  });

  server.listen(env.port, () => {
    console.log(`[api] Server running on http://localhost:${env.port}`);
  });
};

start().catch((error) => {
  console.error("[api] Failed to start server", error);
  process.exit(1);
});
