import express from "express";
import { authMiddleware } from "../../middleware/authentication";
import { check } from "./auth";
const auth = express.Router();
auth.post("/", authMiddleware, check);
export default auth;
