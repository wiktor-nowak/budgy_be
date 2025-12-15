import express, { Response, Request } from "express";
import { PrismaClient, Prisma, AccountType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { authenticateUser } from "../middleware/authentication";
import { authorize } from "../middleware/authorization";

const connectionString = process.env.DATABASE_URL;
const router = express.Router();
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const getAllAccounts = async () => {
  const accounts = await prisma.account.findMany();
  return accounts;
};

router.get("/", authenticateUser, async (_req: Request, res: Response) => {
  try {
    const accounts = await getAllAccounts();
    res.status(200).send({ response: accounts });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.get(
  "/main-account",
  authenticateUser,
  async (req: Request, res: Response) => {
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
  },
);

router.post("/", authenticateUser, async (req: Request, res: Response) => {
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
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;

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

router.get(
  "/my-accounts",
  authenticateUser,
  async (req: Request, res: Response) => {
    const userId = "";
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
  },
);

router.get("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;

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
});

router.patch("/:id", authenticateUser, async (req: Request, res: Response) => {
  const id = req.params.id;
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
});

export default router;
