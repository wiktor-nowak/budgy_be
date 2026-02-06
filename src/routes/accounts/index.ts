import express, { Router } from "express";
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

// accounts.get("/", getAllAccounts);
// accounts.get("/:id", getAccount);
// accounts.get("/main-account", getMainAccount);
// accounts.get("/my-accounts", getMyAccounts);
accounts.get("/count", getAccountsCount);
// accounts.post("/", createAccount);
// accounts.delete("/:id", deleteAccount);
// accounts.patch("/:id", editAccount);

export default accounts;
