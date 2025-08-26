const {pool} = require('../models/db');

const getConversationId = async (req, res) => {
    const {userId} = req.token;
    try {

        const conversationQuery = `
            SELECT * FROM conversations WHERE owner_id = $1 OR user_id = $1
        `;

        const conversationResult = await pool.query(conversationQuery, [userId]);

        if (conversationResult.rows.length === 0) {
            return res.status(404).json({message: "No conversations found"});
        }

        res.status(200).json({
            success : true,
            message : "Conversations fetched successfully",
            conversations: conversationResult.rows
        });
    } catch (err) {
        console.error("Error fetching conversations:", err);

        return res.status(500).json({
            success : false,
            message: "Internal server error",
            error: err.message
        });
    }
}

const getChatOneToOne = async (req, res) => {
    const { userId } = req.token;
    const { otherUserId } = req.params;

    try {
        const conversationQuery = `
            SELECT * FROM conversations WHERE 
            (owner_id = $1 AND user_id = $2) OR
            (owner_id = $2 AND user_id = $1)`
        const conversationResult = await pool.query(conversationQuery, [userId, otherUserId]);
        if (conversationResult.rows.length === 0) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        const conversationId = conversationResult.rows[0].id;
        const messagesQuery = `
            SELECT * FROM messages 
            WHERE conversation_id = $1
            ORDER BY time_sent DESC
        `;
        const messagesResult = await pool.query(messagesQuery, [conversationId]);
        res.json({ conversation: conversationResult.rows[0], messages: messagesResult.rows });


    } catch (error) {
        console.error("Error fetching chat:", error);
        res.status(500).json({ message: "Internal server error" });
    }

}

module.exports = {getConversationId , getChatOneToOne};

