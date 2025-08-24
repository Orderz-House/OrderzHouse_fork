const express = require('express');
const { subscriptionToPlan , getSubscriptionByUserId} = require('../controller/subscriptions');
const subscriptionsRouter = express.Router();

subscriptionsRouter.post('/subscribe', subscriptionToPlan);
subscriptionsRouter.get('/user/:userId', getSubscriptionByUserId);


module.exports = subscriptionsRouter;