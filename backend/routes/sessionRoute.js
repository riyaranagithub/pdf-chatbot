import { Router } from "express";
import { sessionCreate } from "../controller/session/sessionCreate";
import { sessionDelete } from "../controller/session/sessionDelete";
import { sessionGetAll } from "../controller/session/sessionGetAll";
import { sessionGetById } from "../controller/session/sessionGetById";


const sessionRoute = Router();

sessionRoute.post("/sessionCreate", sessionCreate);
sessionRoute.delete("/sessionDelete/:session_id", sessionDelete);
sessionRoute.get("/sessionGetAll", sessionGetAll);
sessionRoute.get("/sessionGetById/:session_id", sessionGetById);



export default sessionRoute;