import express, { Router } from "express";
import { authMiddleware } from "../../middleware/authentication";
import {
  createAccount,
  deleteAccount,
  editAccount,
  getAccount,
  getAccountsCount,
  getAllAccounts,
  getMainAccount,
  getMyAccounts,
} from "./accounts";

const accounts: Router = express.Router();

// accounts.get("/", authMiddleware, getAllAccounts);
// accounts.get("/:id", authMiddleware, getAccount);
// accounts.get("/main-account", authMiddleware, getMainAccount);
// accounts.get("/my-accounts", authMiddleware, getMyAccounts);
accounts.get("/count", authMiddleware, getAccountsCount);
// accounts.post("/", authMiddleware, createAccount);
// accounts.delete("/:id", authMiddleware, deleteAccount);
// accounts.patch("/:id", authMiddleware, editAccount);

export default accounts;
