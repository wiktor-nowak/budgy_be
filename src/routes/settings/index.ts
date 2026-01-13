import express, { Router } from "express";
import { authMiddleware } from "../../middleware/authentication";
import { getAllSettings } from "./settings";

const settings: Router = express.Router();

settings.get("/", authMiddleware, getAllSettings);

export default settings;
