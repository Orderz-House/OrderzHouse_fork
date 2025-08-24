const pool = require('../models/db');

const subscriptionToPlan = (req, res) => {
    const { freelancer_id, plan_id, status } = req.body;

    // التحقق من الحقول الأساسية
    if (!freelancer_id || !plan_id || !status) {
        return res.status(400).json({ success: false, message: "freelancer_id, plan_id, and status are required" });
    }

    const getPlanQuery = 'SELECT duration FROM plans WHERE id = $1';
    pool.query(getPlanQuery, [plan_id])
        .then(result => {
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: "Plan not found" });
            }

            const planDuration = result.rows[0].duration; 
            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setMonth(startDate.getMonth() + planDuration);

            const startDateString = startDate.toISOString().split('T')[0]; // yyyy-mm-dd
            const endDateString = endDate.toISOString().split('T')[0]; // yyyy-mm-dd


            const query = 'INSERT INTO subscriptions (freelancer_id, plan_id, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5)';
            const data = [freelancer_id, plan_id, startDateString, endDateString, status];

            pool.query(query, data).then((result) => {
                res.status(201).json({
                    success: true,
                    message: 'Subscription created successfully',
                    subscription: result.rows[0]
                });
            }).catch((err) => {
                res.status(500).json({
                    success: false,
                    message: 'Failed to create subscription',
                    error: err.message
                });
            });

        }).catch((err) => {
            res.status(500).json({
                success: false,
                message: 'Error fetching plan details',
                error: err.message
            });
        });
};

const getSubscriptionByUserId = (req, res) => {
    const userId = req.params.userId;
    if (!userId) {
        return res.status(400).json({ success: false, message: "userId is required" });
    }
    const query = `
        SELECT s.*, p.name AS plan_name, u.first_name, u.last_name, u.email
        FROM subscriptions s
        JOIN plans p ON s.plan_id = p.id
        JOIN users u ON s.freelancer_id = u.id
        WHERE s.freelancer_id = $1
    `;
    pool.query(query, [userId])
        .then(result => {
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: "No subscriptions found for this user" });
            }
            res.status(200).json({
                success: true,
                subscriptions: result.rows
            });
        })
        .catch(err => {
            res.status(500).json({
                success: false,
                message: "Error fetching subscriptions",
                error: err.message
            });
        });
    
};

module.exports = { 
    subscriptionToPlan,
    getSubscriptionByUserId
};