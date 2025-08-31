import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
  token: localStorage.getItem("token") || null,
  userId: localStorage.getItem("userId") || null,
  roleId: localStorage.getItem("roleId") || null,
  isLoggedIn: !!localStorage.getItem("token"),
  userData: Cookies.get("userData")
    ? JSON.parse(Cookies.get("userData"))
    : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLogin: (state, action) => {
      const { token, userId, roleId } = action.payload;
      state.token = token;
      state.userId = userId;
      state.roleId = roleId;
      state.isLoggedIn = true;

      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("roleId", roleId);
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
  
  },
});

export const { setLogin, setUserId, setLogout, setUserData,setFreeLance } =
  authSlice.actions;
export default authSlice.reducer;
