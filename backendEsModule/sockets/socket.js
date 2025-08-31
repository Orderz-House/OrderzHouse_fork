import { Server } from "socket.io";
import messageHandler from "../controller/messages.js";
import { authSocket } from "../middleware/authentication.js";
import { pool } from "../models/db.js";

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // ✅ Middleware للتحقق من التوكن عند الاتصال
  io.use(authSocket);

  io.on("connection", async (socket) => {
    console.log("User connected:", socket.user.userId);

    try {
      await pool.query("UPDATE users SET is_online = TRUE WHERE id = $1", [
        socket.user.userId,
      ]);
    } catch (err) {
      console.error("Error updating user online status:", err);
    }
    console.log("finish connected");
    socket.on("join_room", async ({ project_id }) => {
      console.log("Server received join_room:", project_id, "user:", socket.user.userId);
      try {
        console.log("Attempting to join room for project:", project_id);
        
        const result = await pool.query(
          `SELECT * FROM projects WHERE id = $1`,
          [project_id]
        );

        console.log("Project query result:", result.rows.length);
        
        if (!result.rows.length) {
          console.error("Project not found:", project_id);
          socket.emit("join_error", { error: "Project not found" });
          return;
        }

        const dataroom = result.rows[0];
        const roomId = `${dataroom.id}`;
        
        // Leave any previous room first
        if (socket.roomId) {
          socket.leave(socket.roomId);
        }
        
        socket.join(roomId);
        socket.roomId = roomId;
        socket.dataroom = dataroom;
        
        console.log(
          `User ${socket.user.userId} joined room ${roomId}`,
          dataroom
        );
        
        // Initialize message handler after joining room
        messageHandler(socket, io);
        
        // Confirm room joining to client
        socket.emit("room_joined", { project_id, roomId });
        
      } catch (err) {
        console.error("Error joining room:", err);
        socket.emit("join_error", { error: "Failed to join room" });
      }
    });

    
    
    socket.on("leave_room", ({ project_id }) => {
      console.log("Server received leave_room:", project_id, "user:", socket.user.userId);
      
      if (socket.roomId) {
        socket.leave(socket.roomId);
        console.log(`User ${socket.user.userId} left room ${socket.roomId}`);
        socket.roomId = null;
        socket.dataroom = null;
      }
    });

    // التعامل مع الانفصال
    socket.on("disconnect", async () => {
      console.log("❌ Client disconnected:", socket.id);
      try {
        await pool.query("UPDATE users SET is_online = FALSE WHERE id = $1", [
          socket.user.userId,
        ]);
      } catch (err) {
        console.error("Error updating user offline status:", err);
      }
    });
  });

  return io;
}

export default initSocket;
