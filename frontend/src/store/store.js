import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slice/auth/authSlice";
import planReducer from "../slice/planSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    plan: planReducer,
  },
});

export default store;
