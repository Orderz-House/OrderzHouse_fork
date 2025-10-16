import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = "/projects";

// Create project thunk
export const createProjectThunk = createAsyncThunk(
  "project/create",
  async (projectData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(API_BASE, projectData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.project;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create project"
      );
    }
  }
);

// Fetch related freelancers
export const fetchRelatedFreelancers = createAsyncThunk(
  "project/fetchRelatedFreelancers",
  async (categoryId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE}/categories/${categoryId}/related-freelancers`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.freelancers;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch freelancers"
      );
    }
  }
);

// Assign project to freelancer
export const assignProjectThunk = createAsyncThunk(
  "project/assign",
  async ({ projectId, freelancerId, assignmentType }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE}/${projectId}/assign`,
        { freelancer_id: freelancerId, assignment_type: assignmentType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.assignment;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to assign project"
      );
    }
  }
);

// Submit work completion
export const submitWorkCompletionThunk = createAsyncThunk(
  "project/submitCompletion",
  async ({ projectId, files }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      files.forEach(file => formData.append("files", file));

      const response = await axios.post(
        `${API_BASE}/${projectId}/submit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit work"
      );
    }
  }
);

// Approve or request revision
export const approveWorkThunk = createAsyncThunk(
  "project/approveWork",
  async ({ projectId, action }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE}/${projectId}/approve`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to process approval"
      );
    }
  }
);

// Resubmit work after revision
export const resubmitWorkThunk = createAsyncThunk(
  "project/resubmitWork",
  async ({ projectId, files }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      files.forEach(file => formData.append("files", file));

      const response = await axios.post(
        `${API_BASE}/${projectId}/resubmit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to resubmit work"
      );
    }
  }
);