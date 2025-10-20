import { createSlice } from "@reduxjs/toolkit";

const usersSlice = createSlice({
  name: "users",
  initialState: {
    freelancers: [],
    clients: [],
    loading: false,
    error: null,
  },
  reducers: {
    setFreelancers: (state, action) => {
      state.freelancers = action.payload;
    },
    addFreelancer: (state, action) => {
      state.freelancers.push(action.payload);
    },
    updateFreelancer: (state, action) => {
      const index = state.freelancers.findIndex(f => f.id === action.payload.id);
      if (index !== -1) state.freelancers[index] = action.payload;
    },
    removeFreelancer: (state, action) => {
      state.freelancers = state.freelancers.filter(f => f.id !== action.payload);
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

export const {
  setFreelancers,
  addFreelancer,
  updateFreelancer,
  removeFreelancer,
  setLoading,
  setError,
  clearError,
} = usersSlice.actions;

export default usersSlice.reducer;
