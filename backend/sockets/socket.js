const { Server } = require("socket.io");
const messageHandler = require("../controller/messages");
const {authSocket}=require("../middleware/authentication"); 
const { pool } = require("../models/db");

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(authSocket); 
  io.on("connection", async(socket) => {
   const userId = socket.user.userId;

    await pool.query("UPDATE users SET is_online = TRUE WHERE id = $1", [userId]);

    messageHandler(socket, io);

    socket.on("disconnect", async() => {
      console.log("❌ Client disconnected:", socket.id);
      const userId = socket.user.userId;  
      await pool.query("UPDATE users SET is_online = FALSE WHERE id = $1", [userId]);
    });
  });
  return io;
}

module.exports = initSocket;