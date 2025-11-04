import express from "express";
import { authentication } from "../../middleware/authentication.js";
import {
  createSurveyByAdmin,
  createSurveyByPublic,
  getAllSurveys,
  getSurveyById,
  toggleSurveyVisibility,
  updateSurvey,
  deleteSurvey,
} from "../../controller/Applicants/survey.js";

const SurveyRouter = express.Router();

/* ---------- Public ---------- */
// Public users (e.g. WhatsApp funnel or website form)
SurveyRouter.post("/public", createSurveyByPublic);




/* ---------- Admin & Manager ---------- */
// Create survey manually
SurveyRouter.post("/", authentication, createSurveyByAdmin);

// Get all surveys (visible & active)
SurveyRouter.get("/", authentication, getAllSurveys);

// Get one survey by ID
SurveyRouter.get("/:id", authentication, getSurveyById);

// Update existing survey details
SurveyRouter.put("/:id", authentication, updateSurvey);

// Toggle visibility (show/hide)
SurveyRouter.put("/:id/visibility", authentication, toggleSurveyVisibility);

// Soft delete (mark as deleted)
SurveyRouter.delete("/:id", authentication, deleteSurvey);

export default SurveyRouter;
