const express = require('express');
const {getConversationId, getChatOneToOne, createConversation} = require('../controller/chats');
const {authentication} = require("../middleware/authentication");

const chatsRouter = express.Router();
chatsRouter.get('/conversation/', authentication, getConversationId);
chatsRouter.get('/one-to-one/:otherUserId', authentication, getChatOneToOne);
chatsRouter.post('/create', authentication, createConversation)

module.exports = chatsRouter;
