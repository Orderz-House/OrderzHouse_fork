const express = require('express');
const {getPlans, createPlan, editPlan, deletePlan, getPlanSubscriptions} = require('../controller/plans');
const plansRouter = express.Router();

plansRouter.get('/', getPlans);
plansRouter.post('/create', createPlan);
plansRouter.put('/edit/:id', editPlan);
plansRouter.delete('/delete/:id', deletePlan);
plansRouter.get('/:id/subscriptions', getPlanSubscriptions);
module.exports = plansRouter;