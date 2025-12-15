import express, { Router } from "express";
import { authenticateUser } from "../../middleware/authentication";
import { ROLES } from "../../constants";
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

users.get("/", authenticateUser, getAllUsers);
users.get("/test", authenticateUser, testUser);
users.get("/current-user", authenticateUser, getUserDetails);
users.post("/", createUser);
users.patch("/:id", authenticateUser, changeUser);
users.patch("/:id/password", authenticateUser, changePassword);
users.delete("/:id", authenticateUser, deleteUser);

export default users;
