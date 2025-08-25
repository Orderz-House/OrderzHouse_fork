const express = require("express");
const {
  addFeedback,
  viewFeedbacksById,
  viewAllFeedbacks,
} = require("../controller/feedback");
const authentication = require("../middleware/authentication");

const feedbackRouter = express.Router();

feedbackRouter.post("/add", authentication, addFeedback);

feedbackRouter.get(
  "/freelancer/:freelancerId",
  authentication,
  viewFeedbacksById
);

feedbackRouter.get("/", authentication, viewAllFeedbacks);

module.exports = feedbackRouter;
