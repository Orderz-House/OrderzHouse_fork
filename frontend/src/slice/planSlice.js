// src/redux/slices/planSlice.js
import { createSlice } from "@reduxjs/toolkit";

const planSlice = createSlice({
  name: "plan",
  initialState: {
    plans: [],
    loading: false,
    error: null,
  },
  reducers: {
    setPlans: (state, action) => {
      state.plans = action.payload;
    },
    addPlan: (state, action) => {
      state.plans.push(action.payload);
    },
    removePlan: (state, action) => {
      state.plans = state.plans.filter((plan) => plan.id !== action.payload);
    },
    updatePlan: (state, action) => {
      const index = state.plans.findIndex((plan) => plan.id === action.payload.id);
      if (index !== -1) {
        state.plans[index] = action.payload;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setPlans, addPlan, removePlan, updatePlan, setLoading, setError, clearError } =
  planSlice.actions;
export default planSlice.reducer;
