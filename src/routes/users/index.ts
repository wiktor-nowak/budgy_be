import express, { Router } from "express";
import { authMiddleware } from "../../middleware/authentication";
import {
  changePassword,
  updateUser,
  createUser,
  deleteUser,
  getAllUsers,
  getActiveUser,
} from "./users";

const users: Router = express.Router();

users.get("/", authMiddleware, getAllUsers);
users.get("/active", authMiddleware, getActiveUser);
users.post("/", createUser);
users.patch("/:id", authMiddleware, updateUser);
users.patch("/:id/password", changePassword);
users.delete("/:id", authMiddleware, deleteUser);

export default users;
