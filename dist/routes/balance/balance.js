"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getError = void 0;
const EntityNotFoundError_1 = __importDefault(require("../../errors/EntityNotFoundError"));
const getError = async (req, res, next) => {
    throw new EntityNotFoundError_1.default({
        message: "Elo, elo 320!",
        statusCode: 404,
        code: "ERR_NF",
    });
    res.status(200).json({ id: 1 });
};
exports.getError = getError;
