import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slice/auth/authSlice";
import planReducer from "../slice/planSlice";
import projectReducer from "../slice/projectSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    plan: planReducer,
    project: projectReducer,
  },
});

export default store;
