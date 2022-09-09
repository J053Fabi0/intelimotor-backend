import Joi from "joi";
import { a } from "./schemaUtils";

export const postSeminuevo = a(
  Joi.object({
    price: Joi.number().positive().precision(2).required(),
    description: Joi.string().required(),
  })
);
