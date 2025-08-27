import { createSlice } from "@reduxjs/toolkit";

const planSlice = createSlice({
  name: "plan",
  initialState: {
    plans: [],
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
      const index = state.plans.findIndex(
        (plan) => plan.id === action.payload.id
      );
      if (index !== -1) {
        state.plans[index] = action.payload;
      }
    },
  },
});
export const { setPlans, addPlan, removePlan, updatePlan } = planSlice.actions;
export default planSlice.reducer;
