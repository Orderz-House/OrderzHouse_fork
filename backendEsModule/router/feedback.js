import express from "express";
import {
  addFeedback,
  viewFeedbacksById,
  viewAllFeedbacks,
} from "../controller/feedback.js";
import { authentication } from "../middleware/authentication.js";

const feedbackRouter = express.Router();

feedbackRouter.post("/add", authentication, addFeedback);

feedbackRouter.get(
  "/freelancer/:freelancerId",
  authentication,
  viewFeedbacksById
);

feedbackRouter.get("/", authentication, viewAllFeedbacks);

export default feedbackRouter;
