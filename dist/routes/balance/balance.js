import EntityNotFoundError from "../../errors/EntityNotFoundError";
export const getError = async (req, res, next) => {
    throw new EntityNotFoundError({
        message: "Elo, elo 320!",
        statusCode: 404,
        code: "ERR_NF",
    });
    res.status(200).json({ id: 1 });
};
