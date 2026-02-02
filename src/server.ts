import express, { Router } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import accountsRoutes from "./routes/accounts";
import authRoutes from "./routes/auth";
import categoryRoutes from "./routes/categories";
import expensesRoutes from "./routes/expenses";
import balance from "./routes/balance";
import users from "./routes/users";

import errorHandler from "./middleware/error-handler";

const app = express();
const PORT = process.env.PORT ?? 3003;
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/accounts", accountsRoutes);
app.use("/auth", authRoutes);
app.use("/balance", balance);
app.use("/categories", categoryRoutes);
app.use("/expenses", expensesRoutes);
app.use("/users", users);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
