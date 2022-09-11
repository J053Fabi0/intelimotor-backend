import { Router } from "express";
import timeout from "connect-timeout";
import * as s from "../schemas/seminuevoSchema";
import * as c from "../controllers/seminuevoController";

const seminuevoRoutes = Router();

seminuevoRoutes.post("/seminuevo", timeout("3m"), s.postSeminuevo, c.postSeminuevo);

export default seminuevoRoutes;
