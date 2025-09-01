import { createSlice } from "@reduxjs/toolkit";

const courseSlice = createSlice({
  name: "courses",
  initialState: {
    courses: [],
    filteredCourses: [],
    loading: false,
    error: null,
    searchTerm: "",
  },
  reducers: {
    setCourses: (state, action) => {
      state.courses = action.payload;
      state.filteredCourses = action.payload;
    },
    setFilteredCourses: (state, action) => {
      state.filteredCourses = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    addCourse: (state, action) => {
      state.courses.push(action.payload);
      state.filteredCourses.push(action.payload);
    },
    updateCourse: (state, action) => {
      const index = state.courses.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.courses[index] = action.payload;
        state.filteredCourses[index] = action.payload;
      }
    },
    deleteCourse: (state, action) => {
      state.courses = state.courses.filter((c) => c.id !== action.payload);
      state.filteredCourses = state.filteredCourses.filter(
        (c) => c.id !== action.payload
      );
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCourses,
  setFilteredCourses,
  setSearchTerm,
  setLoading,
  setError,
  addCourse,
  updateCourse,
  deleteCourse,
  clearError,
} = courseSlice.actions;

export default courseSlice.reducer;
