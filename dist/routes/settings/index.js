"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authentication_1 = require("../../middleware/authentication");
const settings_1 = require("./settings");
const settings = express_1.default.Router();
settings.get("/", authentication_1.authMiddleware, settings_1.getAllSettings);
exports.default = settings;
