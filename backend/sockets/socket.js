const { Server } = require("socket.io");
const messageHandler = require("../controller/messages");
const {authSocket}=require("../middleware/authentication") 


function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(authSocket); 
  io.on("connection", (socket) => {
    //console.log("🔌 Client connected:", socket);

    messageHandler(socket, io);

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = initSocket;