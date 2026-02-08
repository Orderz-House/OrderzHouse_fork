import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
  token: localStorage.getItem("token") || null,
  userId: localStorage.getItem("userId") || null,
  roleId: localStorage.getItem("roleId") || null,
  isLoggedIn: !!localStorage.getItem("token"),
  isVerified: localStorage.getItem("is_verified") || null,
  userData: (() => {
  const data = Cookies.get("userData");
  if (!data || data === "undefined" || data === "null") return null;

  try {
    return JSON.parse(data);
  } catch (err) {
    console.error("Invalid userData cookie:", data);
    return null;
  }
})(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLogin: (state, action) => {
      const { token, userId, roleId, is_verified } = action.payload;
      state.token = token;
      state.userId = userId;
      state.roleId = roleId;
      state.isVerified = is_verified;
      state.isLoggedIn = true;

      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("roleId", roleId);
      localStorage.setItem("is_verified", is_verified);
    },
    setToken: (state, action) => {
      state.token = action.payload;
      if (action.payload) localStorage.setItem("token", action.payload);
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
      localStorage.setItem("userId", action.payload);
    },
    setLogout: (state) => {
      state.token = null;
      state.userId = null;
      state.roleId = null;
      state.isLoggedIn = false;
      localStorage.clear();
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
      Cookies.set("userData", JSON.stringify(action.payload));
    },
    updateVerification: (state, action) => {
      state.isVerified = action.payload;
    },
  },
});

export const {
  setLogin,
  setToken,
  setUserId,
  setLogout,
  setUserData,
  updateVerification,
} = authSlice.actions;
export default authSlice.reducer;
