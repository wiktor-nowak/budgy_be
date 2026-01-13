"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authentication_1 = require("../../middleware/authentication");
const accounts_1 = require("./accounts");
const accounts = express_1.default.Router();
accounts.get("/", authentication_1.authMiddleware, accounts_1.getAllAccounts);
accounts.get("/:id", authentication_1.authMiddleware, accounts_1.getAccount);
accounts.get("/main-account", authentication_1.authMiddleware, accounts_1.getMainAccount);
accounts.get("/my-accounts", authentication_1.authMiddleware, accounts_1.getMyAccounts);
accounts.post("/", authentication_1.authMiddleware, accounts_1.createAccount);
accounts.delete("/:id", authentication_1.authMiddleware, accounts_1.deleteAccount);
accounts.patch("/:id", authentication_1.authMiddleware, accounts_1.editAccount);
exports.default = accounts;
