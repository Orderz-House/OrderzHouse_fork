import express from 'express';
import {getConversationId, getChatOneToOne, createConversation} from '../controller/chats.js';
import { authentication } from "../middleware/authentication.js";

const chatsRouter = express.Router();
chatsRouter.get('/conversation/', authentication, getConversationId);
chatsRouter.get('/one-to-one/:otherUserId', authentication, getChatOneToOne);
chatsRouter.post('/create', authentication, createConversation)

export default chatsRouter;
