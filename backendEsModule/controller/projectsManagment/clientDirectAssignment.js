import pool from "../../models/db.js";
import { ASSIGNMENT_TYPE_CLIENT_PICK_AT_CREATE } from "../../services/clientDirectFreelancerPick.js";

/**
 * GET /projects/freelancers/selectable-for-create
 * Verified freelancers for manual assignment dropdown (only if caller has can_assign_freelancer_on_create).
 */
export const getFreelancersSelectableForCreate = async (req, res) => {
  try {
    const userId = req.token?.userId;
    const { rows } = await pool.query(
      `SELECT role_id, COALESCE(can_assign_freelancer_on_create, false) AS can_pick
       FROM users WHERE id = $1 AND is_deleted = false`,
      [userId]
    );
    if (!rows.length || Number(rows[0].role_id) !== 2 || !rows[0].can_pick) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to list freelancers for assignment",
      });
    }

    const { rows: list } = await pool.query(
      `SELECT id, first_name, last_name, username, profile_pic_url
       FROM users
       WHERE role_id = 3
         AND is_deleted = false
         AND COALESCE(is_verified, false) = true
       ORDER BY first_name ASC NULLS LAST, last_name ASC NULLS LAST, id ASC
       LIMIT 300`
    );

    return res.json({ success: true, freelancers: list });
  } catch (err) {
    console.error("getFreelancersSelectableForCreate:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /projects/freelancer/client-direct-assignment-stats
 * Freelancer-only: today's client-pick-at-create count + total completed projects (any assignment path).
 */
export const getFreelancerClientDirectAssignmentStats = async (req, res) => {
  try {
    const freelancerId = req.token?.userId;
    const role = Number(req.token?.role ?? req.token?.roleId);
    if (!freelancerId || role !== 3) {
      return res.status(403).json({ success: false, message: "Freelancers only" });
    }

    const { rows: todayRows } = await pool.query(
      `SELECT COUNT(*)::int AS cnt
       FROM project_assignments pa
       WHERE pa.freelancer_id = $1
         AND pa.assignment_type = $2
         AND pa.status = 'active'
         AND (pa.assigned_at AT TIME ZONE 'UTC')::date = (NOW() AT TIME ZONE 'UTC')::date`,
      [freelancerId, ASSIGNMENT_TYPE_CLIENT_PICK_AT_CREATE]
    );

    const { rows: doneRows } = await pool.query(
      `SELECT COUNT(DISTINCT p.id)::int AS cnt
       FROM projects p
       INNER JOIN project_assignments pa
         ON pa.project_id = p.id AND pa.freelancer_id = $1 AND pa.status = 'active'
       WHERE p.is_deleted = false
         AND (
           LOWER(COALESCE(p.status, '')) = 'completed'
           OR LOWER(COALESCE(p.completion_status, '')) = 'completed'
         )`,
      [freelancerId]
    );

    return res.json({
      success: true,
      todayClientDirectAssignments: todayRows[0]?.cnt ?? 0,
      totalCompletedProjects: doneRows[0]?.cnt ?? 0,
    });
  } catch (err) {
    console.error("getFreelancerClientDirectAssignmentStats:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
