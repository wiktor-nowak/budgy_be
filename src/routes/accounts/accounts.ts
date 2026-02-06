import { Response, Request, NextFunction } from "express";
import {
  PrismaClient,
  Prisma,
  AccountType,
} from "../../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export const getAllAccounts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accounts = await prisma.account.findMany();
    res.status(200).send({ response: accounts });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const getMainAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = "";
  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const acc = await prisma.user.findUnique({
      where: { id: userId },
      select: { mainAccountId: true },
    });
    // if (!user) {
    //   res.status(404).json({ error: "User not found!" });
    // } else if (user.mainAccountId) {
    //   const account = await prisma.account.findUnique({
    //     where: { id: user.mainAccountId },
    //   });
    //   if (!account) {
    //     res.status(404).json({ error: "Account not found!" });
    //   }
    //   res.status(200).json({ response: account });
    // }
    if (!acc) {
      res.status(404).json({ error: "User not found!" });
    }
    res.status(200).json({ response: acc });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

export const createAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, type, balance, description, isFirstAccount } = req.body;
  const userId = "";

  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
  } else {
    try {
      if (!Object.values(AccountType).includes(type)) {
        res.status(400).json({ error: "Invalid account type" });
      }

      if (type === AccountType.SHARED) {
        const newAccount = await prisma.account.create({
          data: {
            name,
            type,
            balance: Prisma.Decimal(balance),
            description,
            ownerId: null,
            lastMonthlyBalance: Prisma.Decimal(0.0),
          },
        });

        await prisma.userToAccount.create({
          data: {
            userId: userId,
            accountId: newAccount.id,
          },
        });

        res
          .status(201)
          .json({ response: `Account ${newAccount.name} created!` });
      } else {
        if (type === AccountType.BANK) {
          const newlyCreatedAccount = await prisma.account.create({
            data: {
              name,
              type,
              balance: Prisma.Decimal(balance),
              description,
              ownerId: userId,
              lastMonthlyBalance: Prisma.Decimal(0.0),
            },
          });
          await prisma.user.update({
            where: { id: userId },
            data: { mainAccountId: newlyCreatedAccount.id },
          });
        } else {
          await prisma.account.create({
            data: {
              name,
              type,
              balance: Prisma.Decimal(balance),
              description,
              ownerId: userId,
              lastMonthlyBalance: Prisma.Decimal(0.0),
            },
          });
        }

        res.status(201).json({ response: `Account ${name} created!` });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to create account" });
    }
  }
};

export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  try {
    await prisma.account.delete({
      where: { id },
    });

    res
      .status(200)
      .json({ message: `Account with ID ${id} deleted successfully.` });
  } catch (error) {
    res.status(404).json({ error: "Account not found or already deleted." });
  }
};

export const getMyAccounts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.auth.userId;
  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const sharedAccountLinks = await prisma.userToAccount.findMany({
      where: { userId: userId },
      select: { accountId: true },
    });
    const sharedAccountIds = sharedAccountLinks.map((link) => link.accountId);

    const accounts = await prisma.account.findMany({
      where: {
        OR: [{ ownerId: userId }, { id: { in: sharedAccountIds } }],
      },
    });
    res.status(200).send({ response: accounts });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user accounts" });
  }
};

// OK
export const getAccountsCount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.auth.id;
  console.log(userId);
  try {
    const XXX = await prisma.user.findUnique({
      where: { id: userId },
    });

    const accounts = await prisma.account.findMany({
      where: {
        ownerId: userId,
      },
    });
    res.status(200).send({ response: XXX });
  } catch (error) {
    res.status(500).json({ error: "XD" });
  }
};

export const getAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  try {
    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            username: true,
          },
        },
        coOwners: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });
    if (!account) {
      res.status(404).json({ error: "Account not found" });
    } else {
      res.status(200).send({ response: account });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const editAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { name, balance, description } = req.body;
  // const userId = req.user?.id;
  const userId = "";

  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const updatedAccount = await prisma.account.update({
      where: { id },
      data: {
        name,
        balance: Prisma.Decimal(balance),
        description,
      },
    });
    res.status(200).send({
      response: `Account ${updatedAccount.name} successfully updated.`,
    });
  } catch (error) {
    res.status(500).send({ error: "Failed to update account" });
  }
};
