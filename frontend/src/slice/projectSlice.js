import { createSlice } from "@reduxjs/toolkit";
import {
  createProjectThunk,
  fetchRelatedFreelancers,
  assignProjectThunk,
  submitWorkCompletionThunk,
  approveWorkThunk,
  resubmitWorkThunk
} from "../components/CreateProjects/api/projects";

const initialState = {
  creating: false,
  loading: false,
  error: null,
  projects: [],
  currentProject: null,
  relatedFreelancers: [],
  loadingRelated: false,
  assignmentLoading: false,
  submissionLoading: false,
  approvalLoading: false,
  successMessage: null
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    clearProjectError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    resetProjectState: (state) => {
      Object.assign(state, initialState);
    }
  },
  extraReducers: (builder) => {
    // Create Project
    builder
      .addCase(createProjectThunk.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createProjectThunk.fulfilled, (state, action) => {
        state.creating = false;
        state.currentProject = action.payload;
        state.projects.push(action.payload);
        state.successMessage = "Project created successfully!";
      })
      .addCase(createProjectThunk.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      });

    // Fetch Related Freelancers
    builder
      .addCase(fetchRelatedFreelancers.pending, (state) => {
        state.loadingRelated = true;
        state.error = null;
      })
      .addCase(fetchRelatedFreelancers.fulfilled, (state, action) => {
        state.loadingRelated = false;
        state.relatedFreelancers = action.payload;
      })
      .addCase(fetchRelatedFreelancers.rejected, (state, action) => {
        state.loadingRelated = false;
        state.error = action.payload;
      });

    // Assign Project
    builder
      .addCase(assignProjectThunk.pending, (state) => {
        state.assignmentLoading = true;
        state.error = null;
      })
      .addCase(assignProjectThunk.fulfilled, (state, action) => {
        state.assignmentLoading = false;
        state.successMessage = "Project assigned successfully!";
      })
      .addCase(assignProjectThunk.rejected, (state, action) => {
        state.assignmentLoading = false;
        state.error = action.payload;
      });

    // Submit Work Completion
    builder
      .addCase(submitWorkCompletionThunk.pending, (state) => {
        state.submissionLoading = true;
        state.error = null;
      })
      .addCase(submitWorkCompletionThunk.fulfilled, (state, action) => {
        state.submissionLoading = false;
        state.successMessage = "Work submitted for review!";
      })
      .addCase(submitWorkCompletionThunk.rejected, (state, action) => {
        state.submissionLoading = false;
        state.error = action.payload;
      });

    // Approve Work
    builder
      .addCase(approveWorkThunk.pending, (state) => {
        state.approvalLoading = true;
        state.error = null;
      })
      .addCase(approveWorkThunk.fulfilled, (state, action) => {
        state.approvalLoading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(approveWorkThunk.rejected, (state, action) => {
        state.approvalLoading = false;
        state.error = action.payload;
      });

    // Resubmit Work
    builder
      .addCase(resubmitWorkThunk.pending, (state) => {
        state.submissionLoading = true;
        state.error = null;
      })
      .addCase(resubmitWorkThunk.fulfilled, (state, action) => {
        state.submissionLoading = false;
        state.successMessage = "Revision resubmitted successfully!";
      })
      .addCase(resubmitWorkThunk.rejected, (state, action) => {
        state.submissionLoading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearProjectError,
  clearSuccessMessage,
  setCurrentProject,
  resetProjectState
} = projectSlice.actions;

export default projectSlice.reducer;