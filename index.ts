import { join } from "path";

import * as dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: join(__dirname, "..", "/.env") });

import cors from "cors";
import express from "express";
import { screenshotsDir, usingCors } from "./utils/constants";

if (process.env.USERNAME === undefined) console.log("USERNAME not set in .env"), process.exit(0);
if (process.env.PASSWORD === undefined) console.log("PASSWORD not set in .env"), process.exit(0);

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const whitelist = ["https://intelimotor.josefabio.com"];
app.use(
  usingCors
    ? cors({
        origin: function (origin, cb) {
          if (!origin || whitelist.indexOf(origin) !== -1) {
            cb(null, true);
          } else {
            cb(new Error("Not allowed by CORS"));
          }
        },
      })
    : cors()
);

import router from "./routes/routes";
app.use(router);

import { address } from "ip";
const port = process.env.PORT || 3026;
app
  .listen(+port, () => process.env.NODE_ENV === "test" || console.log(`Server on http://${address()}:${port}`))
  .on("error", (err: any) => process.env.NODE_ENV || console.log(err));

export default app;

// Create screenshot diretory if it doesn't exist
import fs from "fs";
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);
