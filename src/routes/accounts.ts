import express, { Response, Request } from "express";
import {
  Account,
  PrismaClient,
  Prisma,
  UserToAccount,
  AccountType,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { authMiddleware, AuthRequest } from "./auth";

const connectionString = process.env.DATABASE_URL;
const router = express.Router();
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const getAllAccounts = async () => {
  const accounts = await prisma.account.findMany();
  return accounts;
};

router.get("/", async (_req: Request, res: Response) => {
  try {
    const accounts = await getAllAccounts();
    res.status(200).send({ response: accounts });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, type, balance, description } = req.body;
  let account: Omit<Account, "id" | "createdAt" | "updatedAt">;

  console.log(name, type, balance, description);
  console.log(req.user?.id);

  try {
    if (!Object.values(AccountType).includes(type)) {
      throw new Error("Type is not properly defined!");
    }

    if (type === AccountType.SHARED) {
      account = {
        name,
        type,
        description,
        ownerId: null,
        balance: Prisma.Decimal(balance),
        lastMonthlyBalance: Prisma.Decimal(0.0),
      };

      const accountCreated = await prisma.account.create({
        data: account,
      });
      const u2a: Omit<UserToAccount, "assignedAt"> = {
        userId: 1,
        accountId: accountCreated.id,
      };
      await prisma.userToAccount.create({
        data: u2a,
      });
    } else {
      account = {
        name,
        type,
        description,
        ownerId: req.user?.id ?? null,
        balance: Prisma.Decimal(balance),
        lastMonthlyBalance: Prisma.Decimal(0.0),
      };

      console.log(account);

      await prisma.account.create({
        data: account,
      });
    }

    res.status(201).send({
      response: `Account ${account.name} created!`,
    });
  } catch (error) {
    res.status(500).send({ error: error });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid acc ID" });
  }

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
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid account ID" });
  }

  try {
    const account = await prisma.account.findUnique({
      where: { id },
    });
    if (!account) {
      res.status(404).json({ error: "Account not found" });
    } else {
      res.status(200).send({ response: account });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid account ID" });
  }

  const { name, balance, description } = req.body;

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
    res.status(500).send({ error: error });
  }
});

export default router;
