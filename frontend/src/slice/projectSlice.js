import { createSlice } from "@reduxjs/toolkit";

const projectSlice = createSlice({
  name: "project",
  initialState: {
    creating: false,
    error: "",
    projects: [],
    currentProject: null,
    relatedFreelancers: [],
    loadingRelated: false,
  },
  reducers: {
    clearProjectError: (state) => {
      state.error = "";
    },
    setCreating: (state, action) => {
      state.creating = !!action.payload;
    },
    setLoadingRelated: (state, action) => {
      state.loadingRelated = !!action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload || "";
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload || null;
    },
    addProject: (state, action) => {
      if (action.payload) state.projects.push(action.payload);
    },
    setRelatedFreelancers: (state, action) => {
      state.relatedFreelancers = action.payload || [];
    },
  },
});

export const {
  clearProjectError,
  setCreating,
  setLoadingRelated,
  setError,
  setCurrentProject,
  addProject,
  setRelatedFreelancers,
} = projectSlice.actions;
export default projectSlice.reducer;
