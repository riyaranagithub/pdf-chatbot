import { Router } from "express";
import { chatAskQuestion } from "../controller/chat/chatAskQuestion";
import { chatGetMessages } from "../controller/chat/chatGetMessages";

const chatRouter = Router();

chatRouter.get("/messages", getMessages);
chatRouter.post("/ask", askQuestion);

export default chatRouter;