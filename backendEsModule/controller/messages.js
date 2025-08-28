import { pool } from "../models/db.js";
import filterMessage from "../middleware/filterMessages.js";
import { authSocket } from "../middleware/authentication.js";

const messageHandler = (socket, io) => {
    socket.on("message", async (data) => {
        io.use(authSocket); 
        try {
            if (!socket.dataroom || !socket.user) {
                console.error("Missing socket.dataroom or socket.user");
                return;
            }

            const checkMessage = await filterMessage(data.text, socket.user.userId);
            console.log("Filter Message:", typeof checkMessage);

            if (typeof checkMessage !== "string") {
                console.log("Violation detected, message blocked.");
                socket.emit("message_blocked", {
                    error: "Your message violates the platform's policy and was not sent."
                });
                return;
            }

            const isOwner = socket.dataroom.owner_id === socket.user.userId;
            data.sender_id = socket.user.userId;
            data.receiver_id = isOwner
                ? socket.dataroom.freelancer_id
                : socket.dataroom.owner_id;

            console.log("Message received:", data);

            const query = `
                INSERT INTO messages (conversation_id, sender_id, receiver_id, text, image_url, time_sent)
                VALUES ($1, $2, $3, $4, $5, NOW())
                RETURNING *
            `;
            const values = [
                socket.dataroom.id,
                data.sender_id,
                data.receiver_id,
                data.text,
                data.image_url
            ];

            pool.query(query, values)
                .then(result => {
                    return pool.query(
                        `INSERT INTO message_logs (message_id, sender_id, receiver_id, conversation_id) VALUES ($1,$2,$3,$4)`,
                        [result.rows[0].id, result.rows[0].sender_id, result.rows[0].receiver_id, result.rows[0].conversation_id]
                    );
                })
                .then(() => {
                    console.log("Message logged successfully");
                })
                .catch(err => {
                    console.log(err);
                });
            

             

            
            const room = socket.roomId;
            socket.to(room).emit("message", data);
            socket.emit("message", data);

        } catch (err) {
            console.error("Error handling message:", err);
            socket.emit("message_error", {
                error: "An error occurred while sending your message."
            });
        }
    });
};

export default messageHandler;
