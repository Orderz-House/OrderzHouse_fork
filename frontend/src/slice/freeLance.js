import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchAllFreelancers = createAsyncThunk(
  'freelance/fetchAllFreelancers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('https://backend.thi8ah.com/users/allfreelance');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const freelanceSlice = createSlice({
  name: 'freelance',
  initialState: {
    freelancers: [],
    loading: false,
    error: null,
    searchTerm: "",
    selectedCountry: "all"
  },
  reducers: {
    setFreelancers: (state, action) => {
      state.freelancers = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setSelectedCountry: (state, action) => {
      state.selectedCountry = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle pending state
      .addCase(fetchAllFreelancers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Handle fulfilled state
      .addCase(fetchAllFreelancers.fulfilled, (state, action) => {
        state.loading = false;
        state.freelancers = action.payload;
      })
      // Handle rejected state
      .addCase(fetchAllFreelancers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setFreelancers, setSearchTerm, setSelectedCountry, clearError } = freelanceSlice.actions;
export default freelanceSlice.reducer;