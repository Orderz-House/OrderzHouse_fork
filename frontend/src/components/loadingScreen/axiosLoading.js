import axios from "axios";

let pending = 0;
const listeners = new Set();

function notify() {
  const active = pending > 0;
  listeners.forEach((cb) => cb(active));
}

export function onGlobalLoading(cb) {
  listeners.add(cb);
  cb(pending > 0);
  return () => listeners.delete(cb);
}

function isSilent(config = {}) {
  const headerSilent = config.headers && (config.headers["x-silent"] === "1" || config.headers["x-Silent"] === "1");
  const url = String(config.url || "");
  const urlSilent =
    url.includes("/notifications") || url.includes("/notifications/count");
  return !!(config.__silent || headerSilent || config.meta?.silent || urlSilent);
}

axios.interceptors.request.use(
  (config) => {
    if (!isSilent(config)) {
      pending += 1;
      notify();
    }
    return config;
  },
  (error) => {
    pending = Math.max(0, pending - 1);
    notify();
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    if (!isSilent(response.config)) {
      pending = Math.max(0, pending - 1);
      notify();
    }
    return response;
  },
  (error) => {
    if (!isSilent(error.config)) {
      pending = Math.max(0, pending - 1);
      notify();
    }
    return Promise.reject(error);
  }
);
