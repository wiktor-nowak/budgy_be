"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authentication_1 = require("../../middleware/authentication");
const authorization_1 = require("../../middleware/authorization");
const constants_1 = require("../../constants");
const users_1 = require("./users");
const users = express_1.default.Router();
users.get("/", authentication_1.authenticate, (0, authorization_1.authorize)([constants_1.ROLES.ADMIN]), users_1.getAllUsers);
users.get("/current-user", authentication_1.authenticate, users_1.getUserDetails);
users.post("/", users_1.createUser);
users.patch("/:id", authentication_1.authenticate, users_1.changeUser);
users.patch("/:id/password", authentication_1.authenticate, users_1.changePassword);
users.delete("/id", authentication_1.authenticate, (0, authorization_1.authorize)([constants_1.ROLES.ADMIN]), users_1.deleteUser);
exports.default = users;
