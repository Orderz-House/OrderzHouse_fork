import express from 'express';
import { getPlans, createPlan, editPlan, deletePlan, getPlanSubscriptions } from '../controller/plans.js';
const plansRouter = express.Router();

plansRouter.get('/', getPlans);
plansRouter.post('/create', createPlan);
plansRouter.put('/edit/:id', editPlan);
plansRouter.delete('/delete/:id', deletePlan);
plansRouter.get('/:id/subscriptions', getPlanSubscriptions);
export default plansRouter;