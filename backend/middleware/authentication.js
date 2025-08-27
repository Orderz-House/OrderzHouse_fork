const jwt = require("jsonwebtoken");
const {pool} = require("../models/db");
const authentication = (req, res, next) => {
  try {
    if (!req.headers.authorization)
      res.status(403).json({ message: "forbidden" });

    const token = req.headers.authorization.split(" ").pop();

    jwt.verify(token, process.env.JWT_SECRET, (err, result) => {
      if (err) {
        res.status(403).json({ 
          success: false,
          message: `The token is invalid or expired`,
        });
      } else {
        req.token = result; 
        next();
      }
    });
  } catch (error) {
    res.status(403).json({ message: "forbidden" });
  }
};

const authSocket = (socket, next) => {
  const headers = socket.handshake.headers;
  //console.log(headers);
  
  if (!headers.token) {
    return next(new Error("Authentication error: Token required"));
  }

  jwt.verify(headers.token, process.env.JWT_SECRET,async (err, decoded) => {
    if (err) {
      return next(new Error("Authentication error: Invalid token"));
    }else{
      //const room = headers.user
      console.log("🔐 Socket authenticated:", decoded);
      const conversation_id = headers.conversation_id;
      const consversation = await pool.query(`SELECT * FROM conversations WHERE id = $1`, [conversation_id]);
      console.log("consversation =>", consversation.rows);
      
        //if(consversation.rows.length === 0) return;
      const roomId = `${consversation.rows[0].id}-${consversation.rows[0].owner_id}-${consversation.rows[0].freelancer_id}`;

      console.log("this roomId =>", roomId);
      
      socket.join(roomId);
      socket.roomId = roomId;
      socket.dataroom = consversation.rows[0];
      console.log("socket.dataroom", socket.dataroom);
      
      socket.user = decoded;
      next();
    }
  });
};

module.exports = {authentication, authSocket};