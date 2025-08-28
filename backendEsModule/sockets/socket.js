import { Server } from "socket.io";
import messageHandler from "../controller/messages";
import {authSocket} from "../middleware/authentication"; 
import { pool } from "../models/db";

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  
  io.on("connection", async(socket) => {
   const {userId} = socket.handshake.auth;

    await pool.query("UPDATE users SET is_online = TRUE WHERE id = $1", [userId]);

    messageHandler(socket, io);

    socket.on("disconnect", async() => {
      console.log("❌ Client disconnected:", socket.id);
      await pool.query("UPDATE users SET is_online = FALSE WHERE id = $1", [userId]);
    });
  });
  return io;
}

export default initSocket;