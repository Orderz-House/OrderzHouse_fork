import express from "express";
import { authentication } from "../middleware/authentication.js";
import {
  getFreelancerTasks,
  getTaskPool,
  createTask,
  updateTask,
  deleteTask
} from "../controller/tasks.js";
import pool from "../models/db.js";
const router = express.Router();
router.get("/freelancer/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT t.*, u.first_name || ' ' || u.last_name AS freelancer_name, u.profile_pic_url AS freelancer_avatar
       FROM tasks t
       JOIN users u ON t.freelancer_id = u.id
       WHERE t.freelancer_id = $1`,
      [id]
    );
    res.json({ tasks: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Your other routes from the controller
router.get("/freelancer/:freelancerId", authentication, getFreelancerTasks);
router.get("/pool/:freelancerId", authentication, getTaskPool);
router.post("/", authentication, createTask);
router.put("/:id", authentication, updateTask);
router.delete("/:id", authentication, deleteTask);

// 3. Finally, export the router
export default router;
