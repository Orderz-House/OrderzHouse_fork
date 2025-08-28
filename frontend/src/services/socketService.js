import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (token, userId) => {
    socket = null
    if (!socket) {
        console.log(token, userId);
    
        socket = io("http://localhost:5000", {
          auth: {
            token,
            userId
          },
        });
    }
    return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;