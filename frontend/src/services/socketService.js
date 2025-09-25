import { io } from "socket.io-client";
import Cookies from "js-cookie";
let socket = null;

export const connectSocket = (token, userId) => {
    socket = null
    if (!socket) {
        console.log("Connected Socket");
    
        socket = io("http://localhost:5000", {
          auth: {
            token,
            userId
          }
        });
    }

    return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
     console.log("Disconnected Socket");
  }
};

export const getSocket = () => socket;

export const initSocket = () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  if (token && userId) {
    return connectSocket(token, userId);
  }
  return null;
};