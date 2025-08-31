import express from 'express';
import { subscriptionToPlan , getSubscriptionByUserId } from '../controller/subscriptions.js';
const subscriptionsRouter = express.Router();

subscriptionsRouter.post('/subscribe', subscriptionToPlan);
subscriptionsRouter.get('/user/:userId', getSubscriptionByUserId);


export default subscriptionsRouter; 