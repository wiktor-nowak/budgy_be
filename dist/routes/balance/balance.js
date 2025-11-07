"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getError = void 0;
const EntityNotFoundError_1 = __importDefault(require("../../errors/EntityNotFoundError"));
const getError = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    throw new EntityNotFoundError_1.default({
        message: "Elo, elo 320!",
        statusCode: 404,
        code: "ERR_NF",
    });
    res.status(200).json({ id: 1 });
});
exports.getError = getError;
