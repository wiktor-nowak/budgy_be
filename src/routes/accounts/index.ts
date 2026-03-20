import express, { Router } from "express";
import { requireMainAccount } from "../../middleware/require-main-account";
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

accounts.get("/", requireMainAccount, getUserAccounts);

accounts.get("/all", requireMainAccount, getAllAccounts);
accounts.get("/main", requireMainAccount, getMainAccount);
accounts.get("/count", requireMainAccount, getAccountsCount);
accounts.get("/with-categories", requireMainAccount, getAccountsWithCategories);
// last get is with parameter
accounts.get("/:id", requireMainAccount, getAccount);

accounts.post("/", createAccount);
accounts.patch("/:id", requireMainAccount, updateAccount);
accounts.delete("/:id", requireMainAccount, deleteAccount);

// WORTH ADDING MIDDLEWARE CHECKING THE ROLE AND WHICH ROLE CAN DO WHICH ACTIONS!!!!

export default accounts;
