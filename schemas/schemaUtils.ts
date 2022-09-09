import Joi from "joi";
import { NextFunction } from "express";
import validateRequest from "../utils/validateRequest";
import CommonRequest from "../types/commonRequest.type";
import CommonResponse from "../types/commonResponse.type";

export const a =
  (schema: Joi.Schema, element?: "body" | "header" | "query") =>
  (req: CommonRequest, res: CommonResponse, next: NextFunction) =>
    validateRequest(req, res, next, schema, element);
