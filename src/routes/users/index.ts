import express, { Router } from "express";
import { authenticate } from "../../middleware/authentication";
import { authorize } from "../../middleware/authorization";
import { ROLES } from "../../constants";
import {
  changePassword,
  changeUser,
  createUser,
  deleteUser,
  getAllUsers,
  getUserDetails,
} from "./users";

const users: Router = express.Router();

users.get("/", authenticate, authorize([ROLES.ADMIN]), getAllUsers);
users.get("/current-user", authenticate, getUserDetails);
users.post("/", createUser);
users.patch("/:id", authenticate, changeUser);
users.patch("/:id/password", authenticate, changePassword);
users.delete("/id", authenticate, authorize([ROLES.ADMIN]), deleteUser);

export default users;
