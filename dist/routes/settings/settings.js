export const getAllSettings = async (req, res, next) => {
    try {
        res.status(200).send({
            response: "Hi",
        });
    }
    catch (error) {
        res.status(500).send({ error: error });
    }
};
