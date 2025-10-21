import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slice/auth/authSlice";
import planReducer from "../slice/planSlice";
import projectReducer from "../slice/projectSlice";
import courseReducer from "../slice/courseSlice";
import usersReducer from "../slice/usersSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    plan: planReducer,
    project: projectReducer,
    users: usersReducer,
     courses: courseReducer,
  },
});

export default store;
