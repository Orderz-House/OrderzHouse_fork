const {pool} = require("../models/db");
const filterMessage = require("../middleware/filterMessages");
const messageHandler = (socket, io) => {
    //for one to one chat :)
    socket.on("message", async(data) => {   
        try {
            const checkMessage = await filterMessage(data.text, socket.user.userId)
            console.log("Filter Message : ",typeof checkMessage );
            if(typeof checkMessage !== "string"){
                console.log("Violation detected, message blocked.")

                socket.emit("message_blocked", {
                    error : "Your message violates the platform's policy and was not sent."
                });
                return;
            }
        

            if(socket.dataroom.owner_id === socket.user.userId){
                data.snder_id = socket.user.userId;
                data.receiver_id = socket.dataroom.user_id;
            
            }
            if(socket.dataroom.owner_id !== socket.user.userId){
                 data.snder_id = socket.user.userId;
                data.receiver_id = socket.dataroom.owner_id;
            }        
            console.log("Message received:", data);
            const room = socket.roomId;
            socket.to(room).emit("message", data);
            socket.emit("message", data);
            
            const saveMessage = async () => {
                const query = `
                    INSERT INTO messages (conversation_id, sender_id, receiver_id, text, time_sent)
                    VALUES ($1, $2, $3, $4, NOW())
                    RETURNING *
                `;
                const values = [socket.dataroom.id, data.snder_id, data.receiver_id, data.text];
    
                try {
                    const result = await pool.query(query, values);
                    console.log("Message saved:", result.rows[0]);
                } catch (err) {
                    console.error("Error saving message:", err);
                }
            }
            saveMessage();
        } catch (err) {
            
        }    
        
    });
}

module.exports = messageHandler;