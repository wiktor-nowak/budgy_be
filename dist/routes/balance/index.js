import express from "express";
import { getError } from "./balance";
const balance = express.Router();
balance.get("/", getError);
export default balance;
