import { Router } from "express";
import * as s from "../schemas/seminuevoSchema";
import * as c from "../controllers/seminuevoController";

const seminuevoRoutes = Router();

seminuevoRoutes.post("/seminuevo", s.postSeminuevo, c.postSeminuevo);

export default seminuevoRoutes;
