import express, { Router } from "express";
import seminuevoRoutes from "./seminuevoRoutes";
import { screenshotsDir } from "../utils/constants";

const router = Router();

// Default response.
router.get("/", (_, res) => res.send({ status: 200 }).status(200));

router.use(seminuevoRoutes);

// Serve the screenshots as static files
router.use("/screenshots", express.static(screenshotsDir));

export default router;
