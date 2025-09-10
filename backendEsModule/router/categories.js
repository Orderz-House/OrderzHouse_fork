// routes/categories.js
import express from "express";
import { getCategories } from "../controller/categories.js";
import { authentication } from "../middleware/authentication.js";

const categoriesRouter = express.Router();

categoriesRouter.get("/", getCategories);

export default categoriesRouter;

