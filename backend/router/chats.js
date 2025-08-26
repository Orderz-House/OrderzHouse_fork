const express = require('express');
const {getConversationId, getChatOneToOne} = require('../controller/chats');
const {authentication} = require("../middleware/authentication");

const chatsRouter = express.Router();
chatsRouter.get('/conversation/', authentication, getConversationId);
chatsRouter.get('/one-to-one/:otherUserId', authentication, getChatOneToOne);

module.exports = chatsRouter;
