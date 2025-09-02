import { pool } from "../models/db.js";
import filterMessage from "../middleware/filterMessages.js";

const messageHandler = (socket, io) => {
  socket.on("message", async (data) => {
    try {
      console.log(socket.data);
      if (!socket.dataroom || !socket.user || !socket.roomId) {
        console.error("Missing socket.dataroom, socket.user or socket.roomId");
        return;
      }

      const checkMessage = await filterMessage(data.text, socket.user.userId);
      if (typeof checkMessage !== "string") {
        console.log("Violation detected, message blocked.");
        socket.emit("message_blocked", {
          error: "Your message violates the platform's policy and was not sent.",
        });
        return;
      }
      
      
      data.sender_id = socket.user.userId;
      
      const query = `
        INSERT INTO messages (project_id, sender_id, receiver_id, text, image_url, time_sent)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *
      `;
      const values = [
        socket.dataroom.id,
        data.sender_id,
        socket.dataroom.id,
        data.text,
        data.image_url,
      ];

      const result = await pool.query(query, values);

      await pool.query(
        `INSERT INTO message_logs (message_id, sender_id, receiver_id, project_id) VALUES ($1,$2,$3,$4)`,
        [
          result.rows[0].id,
          result.rows[0].sender_id,
          result.rows[0].project_id,
          result.rows[0].project_id,
        ]
      );

      console.log("messages", data);
      
      io.to(socket.roomId).emit("message", {...result.rows[0], tempId : data.tempId});
    } catch (err) {
      console.error("Error handling message:", err);
      socket.emit("message_error", {
        error: "An error occurred while sending your message.",
      });
    }
  });
};

export default messageHandler;
