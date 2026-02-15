import { io } from "socket.io-client";
import { getApiBaseURL } from "../api/client.js";

let socket = null;

export const connectSocket = (token, userId) => {
  socket = null;
  if (!socket) {
    console.log("Connected Socket");
    socket = io(getApiBaseURL(), {
      auth: { token, userId },
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

export const initSocket = (token, userId) => {
  if (token && userId) {
    return connectSocket(token, userId);
  }
  const t = typeof localStorage !== "undefined" ? localStorage.getItem("accessToken") : null;
  const raw = typeof localStorage !== "undefined" ? localStorage.getItem("userInfo") : null;
  let uid = null;
  if (raw) try { uid = JSON.parse(raw)?.id ?? JSON.parse(raw)?.userId; } catch (_) {}
  if (t && uid) return connectSocket(t, uid);
  return null;
};
