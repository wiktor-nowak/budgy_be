import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import accountsRoutes from "./routes/accounts";
import authRoutes from "./routes/auth";
import categoryRoutes from "./routes/categories";
import transactionsRoutes from "./routes/transactions";
import summaryRoutes from "./routes/summary";
import usersRoutes from "./routes/users";

import errorHandler from "./middleware/error-handler";
import { authMiddleware } from "./middleware/authentication";
import { requireMainAccount } from "./middleware/require-main-account";

const app = express();
const PORT = process.env.PORT ?? 3003;
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*splat", cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/accounts", authMiddleware, accountsRoutes);
app.use("/summary", authMiddleware, requireMainAccount, summaryRoutes);
app.use("/categories", authMiddleware, requireMainAccount, categoryRoutes);
app.use("/transactions", authMiddleware, requireMainAccount, transactionsRoutes);

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
