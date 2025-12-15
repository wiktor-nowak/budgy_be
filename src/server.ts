import express, { Router } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import accountsRoutes from "./routes/accounts";
import authenticationRoutes from "./routes/authentication";
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
