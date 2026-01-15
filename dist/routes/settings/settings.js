"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSettings = void 0;
const getAllSettings = async (req, res, next) => {
    try {
        res.status(200).send({
            response: "Hi",
        });
    }
    catch (error) {
        res.status(500).send({ error: error });
    }
};
exports.getAllSettings = getAllSettings;
