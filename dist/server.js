import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import accountsRoutes from "./routes/accounts";
import authenticationRoutes from "./routes/auth";
import categoryRoutes from "./routes/categories";
import expensesRoutes from "./routes/expenses";
import balance from "./routes/balance";
import users from "./routes/users";
import errorHandler from "./middleware/error-handler";
const app = express();
const PORT = process.env.PORT ?? 3003;
const corsOptions = {
    origin: "*",
    // origin: "http://localhost:5173",
    methods: "GET,PUT,PATCH,POST,DELETE",
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/api/accounts", accountsRoutes);
app.use("/api/authentication", authenticationRoutes);
app.use("/api/balance", balance);
app.use("/api/categories", categoryRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/users", users);
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});
