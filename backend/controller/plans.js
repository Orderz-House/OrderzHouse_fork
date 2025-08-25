const {pool} = require('../models/db');

const getPlans = (req, res) => {
    pool.query('SELECT * FROM Plans')
    .then(result => {
        res.status(200).json({
            success: true,
            plans: result.rows
        });
    })
    .catch(err => {
        res.status(500).json({
            success: false,
            error: err.message
        });
    });
}

const createPlan = (req, res) => {
    const {name, price, duration, description} = req.body;
    const query = 'INSERT INTO Plans (name, price, duration, description) VALUES ($1, $2, $3, $4)';
    const data = [name, price, duration, description];
    pool.query(query, data).then((result) => {
        res.status(201).json({
            success: true,
            message: 'Plan created successfully',
            plan: result.rows[0]
        });
    }).catch((err) => {
        res.status(500).json({
            success: false,
            message : 'Failed to create plan',
            error: err.message
        });
    });
}

const editPlan = (req, res) => {
    const {id} = req.params;
    const {name, price, duration, description} = req.body;
    const query = 'UPDATE Plans SET name = $1, price = $2, duration = $3, description = $4 WHERE id = $5';
    const data = [name, price, duration, description, id];
    pool.query(query, data).then((result) => {
        res.status(200).json({
            success: true,
            message: 'Plan updated successfully',
            plan: result.rows[0]
        });
    }).catch((err) => {
        res.status(500).json({
            success: false,
            message : 'Failed to update plan',
            error: err.message
        });
    });
};

const deletePlan = (req, res) => {
    const {id} = req.params;
    const query = 'DELETE FROM Plans WHERE id = $1';
    const data = [id];
    pool.query(query, data).then((result) => {
        res.status(200).json({
            success: true,
            message: 'Plan deleted successfully'
        });
    }).catch((err) => {
        res.status(500).json({
            success: false,
            message : 'Failed to delete plan',
            error: err.message
        });
    });
};

//show count users subscribed to each plan with table subscriptions in row plans
const getPlanSubscriptions = (req, res) => {
    const {id} = req.params;
    const query = `
    SELECT 
      Plans.id, 
      Plans.name, 
      Plans.price, 
      Plans.duration, 
      Plans.description,
      COUNT(Subscriptions.id) AS subscription_count
    FROM 
      Plans
    LEFT JOIN 
      Subscriptions 
    ON 
      Plans.id = Subscriptions.plan_id
    WHERE 
      Plans.id = $1
    GROUP BY 
      Plans.id
    ORDER BY 
      Plans.id;
  `;
    pool.query(query, [id])
    .then(result => {
        res.status(200).json({
            success: true,
            plans: result.rows
        });
    })
    .catch(err => {
        res.status(500).json({
            success: false,
            error: err.message
        });
    });
};

module.exports = {
    getPlans,
    createPlan,
    editPlan,
    deletePlan,
    getPlanSubscriptions
};

