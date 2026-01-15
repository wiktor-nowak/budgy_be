"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("./auth");
const auth = express_1.default.Router();
auth.post("/refresh", auth_1.refreshHandler);
auth.post("/login", auth_1.loginHandler);
auth.post("/logout", auth_1.logoutHandler);
exports.default = auth;
