import express, { Response, Request } from "express";
import { PrismaClient, User } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const router = express.Router();
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export default router;
