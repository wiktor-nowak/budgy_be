import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { z } from "zod";

import userRoutes from "./routes/users";
import authRoutes from "./routes/auth";

const app = express();
const PORT = process.env.PORT ?? 5000;
const corsOptions = {
  origin: "*",
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

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
