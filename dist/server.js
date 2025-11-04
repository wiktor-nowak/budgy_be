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
// import balanceRoutes from "./routes/balance";
const categories_1 = __importDefault(require("./routes/categories"));
const expenses_1 = __importDefault(require("./routes/expenses"));
const users_1 = __importDefault(require("./routes/users"));
const app = (0, express_1.default)();
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3003;
const corsOptions = {
    origin: "http://localhost:5173",
    methods: "GET,PUT,PATCH,POST,DELETE",
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
};
app.use((0, cors_1.default)(corsOptions));
app.use(body_parser_1.default.json());
app.use((0, cookie_parser_1.default)());
// Create user
// const createUser = async ({ name, email }: Pick<User, "name" | "email">) => {
//   await prisma.user.create({
//     data: {
//       name: name,
//       email: email,
//     },
//   });
// };
// Get all users
// Get all users with articles
// const users = await prisma.user.findMany({
//   include: {
//     articles: true,
//   },
// });
// Create an article and associate with a user
// const getAllUsers = async () => {
//   await prisma.article.create({
//     data: {
//       title: "John's first article",
//       body: "This is the first article",
//       author: {
//         connect: {
//           id: 1,
//         },
//       },
//     },
//   });
// };
// Get all articles
// const articles = await prisma.article.findMany();
// Create user and article and associate them
// const user = await prisma.user.create({
//   data: {
//     name: "Sarah Smith",
//     email: "sarah.smith@email.com",
//     articles: {
//       create: {
//         title: "Sarah wrote first Article",
//         body: "This is its content",
//       },
//     },
//   },
// });
// Create another article for specific user
// const article = await prisma.article.create({
//   data: {
//     title: "Sample Article",
//     body: "This is simple article.",
//     author: {
//       connect: {
//         id: 2,
//       },
//     },
//   },
// });
// Get articles of a specific user
// const users = await prisma.user.findMany({
//   include: {
//     articles: true,
//   },
// });
// users.forEach((user) => {
//   console.log(`User: ${user.name}, Email: ${user.email}`);
//   console.log(`Articles:`);
//   user.articles.forEach((article) => {
//     console.log(` -- Title: ${article.title}`);
//   });
//   console.log("\n");
// });
// Update data
// const updateUserBasicData = async (
//   id: number,
//   data: {
//     name?: string;
//     email?: string;
//   }
// ) => {
//   const response = await prisma.user.update({
//     where: {
//       id,
//     },
//     data: {
//       ...data,
//     },
//   });
//   return response;
// };
// Remove data
// const removeUser = async (id: number) => {
//   const response = await prisma.user.delete({
//     where: {
//       id: id,
//     },
//   });
//   return response;
// };
// async function main() {
//   // await createUser();
//   // await removeUser(1);
// }
// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });
app.use("/api/accounts", accounts_1.default);
app.use("/api/auth", auth_1.default);
// app.use("/api/balance", balanceRoutes);
app.use("/api/categories", categories_1.default);
app.use("/api/expenses", expenses_1.default);
app.use("/api/users", users_1.default);
app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});
