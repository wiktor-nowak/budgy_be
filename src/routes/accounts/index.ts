import express, { Router } from "express";
import {
  createAccount,
  deleteAccount,
  updateAccount,
  getAccount,
  getAccountsCount,
  getAllAccounts,
  getMainAccount,
  getUserAccounts,
  getAccountsWithCategories,
} from "./accounts";

const accounts: Router = express.Router();

accounts.get("/", getUserAccounts);

accounts.get("/all", getAllAccounts);
accounts.get("/main", getMainAccount);
accounts.get("/count", getAccountsCount);
accounts.get("/with-categories", getAccountsWithCategories);
// last get is with parameter
accounts.get("/:id", getAccount);

accounts.post("/", createAccount);
accounts.patch("/:id", updateAccount);
accounts.delete("/:id", deleteAccount);

// WORTH ADDING MIDDLEWARE CHECKING THE ROLE AND WHICH ROLE CAN DO WHICH ACTIONS!!!!

export default accounts;
