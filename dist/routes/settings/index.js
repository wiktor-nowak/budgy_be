import express from "express";
import { authMiddleware } from "../../middleware/authentication";
import { getAllSettings } from "./settings";
const settings = express.Router();
settings.get("/", authMiddleware, getAllSettings);
export default settings;
