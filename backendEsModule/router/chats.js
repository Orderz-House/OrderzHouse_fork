import express from 'express';
import {getMessagesByProjectId} from '../controller/chats.js';
import { authentication } from "../middleware/authentication.js";

const chatsRouter = express.Router();
/*
chatsRouter.get('/conversation/', authentication, getConversationId);
chatsRouter.get('/one-to-one/:otherUserId', authentication, getChatOneToOne);
chatsRouter.post('/create', authentication, createConversation)
*/

chatsRouter.get(`/project/:projectId/messages`, authentication, getMessagesByProjectId)


export default chatsRouter;
