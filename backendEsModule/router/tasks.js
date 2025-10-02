import express from "express";
import { authentication } from "../middleware/authentication.js";
import {
  getFreelancerTasks,
  getTaskPool,
  createTask,
  updateTask,
  deleteTask
} from "../controller/tasks.js";
router.get("/freelancer/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT t.*, f.name AS freelancer_name, f.profile_pic_url AS freelancer_avatar
       FROM tasks t
       JOIN freelancers f ON t.freelancer_id = f.id
       WHERE t.freelancer_id = $1`,
      [id]
    );

    res.json({ tasks: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

const router = express.Router();

// My tasks
router.get("/freelancer/:freelancerId", authentication, getFreelancerTasks);

// Task pool
router.get("/pool/:freelancerId", authentication, getTaskPool);

// CRUD
router.post("/", authentication, createTask);
router.put("/:id", authentication, updateTask);
router.delete("/:id", authentication, deleteTask);

export default router;
