"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const accounts_1 = __importDefault(require("./routes/accounts"));
const auth_1 = __importDefault(require("./routes/auth"));
const categories_1 = __importDefault(require("./routes/categories"));
const expenses_1 = __importDefault(require("./routes/expenses"));
const balance_1 = __importDefault(require("./routes/balance"));
const users_1 = __importDefault(require("./routes/users"));
const error_handler_1 = __importDefault(require("./middleware/error-handler"));
const app = (0, express_1.default)();
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3003;
const corsOptions = {
    origin: "*",
    // origin: "http://localhost:5173",
    methods: "GET,PUT,PATCH,POST,DELETE",
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
};
app.use((0, cors_1.default)(corsOptions));
app.use(body_parser_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use("/api/accounts", accounts_1.default);
app.use("/api/authentication", auth_1.default);
app.use("/api/balance", balance_1.default);
app.use("/api/categories", categories_1.default);
app.use("/api/expenses", expenses_1.default);
app.use("/api/users", users_1.default);
app.use(error_handler_1.default);
app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});
