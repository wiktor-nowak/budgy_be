import express, { Router } from "express";
import { authMiddleware } from "../../middleware/authentication";
import {
  changePassword,
  changeUser,
  createUser,
  deleteUser,
  getAllUsers,
  getUserDetails,
  testUser,
} from "./users";

const users: Router = express.Router();

users.get("/", authMiddleware, getAllUsers);
users.get("/test", authMiddleware, testUser);
users.get("/current-user", authMiddleware, getUserDetails);
users.post("/", createUser);
users.patch("/:id", authMiddleware, changeUser);
users.patch("/:id/password", authMiddleware, changePassword);
users.delete("/:id", authMiddleware, deleteUser);

export default users;
