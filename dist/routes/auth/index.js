"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authentication_1 = require("../../middleware/authentication");
const auth_1 = require("./auth");
const auth = express_1.default.Router();
auth.post("/", authentication_1.authMiddleware, auth_1.check);
exports.default = auth;
