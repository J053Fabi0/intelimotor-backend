import { Request } from "express";

export default interface CommonRequest<Body = any, Query = any> extends Request<{}, any, Body, Query> {}
