import express, { Router } from "express";
import { authMiddleware } from "../../middleware/authentication";
import { requireMainAccount } from "../../middleware/require-main-account";
import {
  changePassword,
  updateUser,
  createUser,
  deleteUser,
  getAccessStatus,
  getAllUsers,
  getActiveUser,
} from "./users";

const users: Router = express.Router();

users.get("/", authMiddleware, requireMainAccount, getAllUsers);
users.get("/access-status", authMiddleware, getAccessStatus);
users.get("/active", authMiddleware, requireMainAccount, getActiveUser);
users.post("/", createUser);
users.patch("/:id", authMiddleware, requireMainAccount, updateUser);
users.patch("/:id/password", authMiddleware, requireMainAccount, changePassword);
users.delete("/:id", authMiddleware, requireMainAccount, deleteUser);

export default users;
