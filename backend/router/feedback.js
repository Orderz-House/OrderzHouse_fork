const express = require("express");
const { addFeedback, viewFeedbacksById } = require("../controller/feedback");
const authentication = require("../middleware/authentication");

const feedbackRouter = express.Router();

feedbackRouter.post("/add", authentication, addFeedback);

feedbackRouter.get("/:userId", authentication, viewFeedbacksById);

module.exports = feedbackRouter;
