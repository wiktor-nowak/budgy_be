import { AccountData, UpdateAccountData } from "../types/account";
import { prisma } from "../lib/db/prisma";
import { AccountType } from "../prisma/generated/enums";
import ResourceNotFoundError from "../errors/ResourceNotFoundError";
import { GENERIC_CATEGORIES } from "../types/category";

async function createAccount({
  name,
  type,
  description,
  setAsMain,
  userId,
}: AccountData) {
  const ownerId = type === AccountType.SHARED ? null : userId;

  const createdAccount = await prisma.$transaction(async (tx) => {
    const account = await tx.account.create({
      data: {
        name,
        type,
        description,
        ownerId,
      },
    });

    if (!ownerId) {
      await tx.userToAccount.create({
        data: {
          userId: userId,
          accountId: account.id,
        },
      });
      // emit event later
    }

    if (ownerId && setAsMain) {
      await tx.user.update({
        where: { id: ownerId },
        data: { mainAccountId: account.id },
      });
    }

    await tx.category.createMany({
      data: GENERIC_CATEGORIES.map((category) => ({
        name: category.name,
        shortcut: category.shortcut,
        accountId: account.id,
      })),
    });

    return account;
  });

  if (createdAccount) {
    // await sendEmail();
  }
  return createdAccount;
}

async function getMainAccount(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user?.mainAccountId)
    throw new ResourceNotFoundError("No account marked as main.");
  return await prisma.account.findUnique({
    where: {
      id: user?.mainAccountId,
    },
  });
}

async function getAllAccounts() {
  return await prisma.account.findMany();
}

async function getUserAccounts(id: string) {
  const sharedAccountLinks = await prisma.userToAccount.findMany({
    where: { userId: id },
    select: { accountId: true },
  });
  const sharedAccountIds = sharedAccountLinks.map((link) => link.accountId);
  const accounts = await prisma.account.findMany({
    where: {
      OR: [{ ownerId: id }, { id: { in: sharedAccountIds } }],
    },
  });
  if (!accounts)
    throw new ResourceNotFoundError("No accounts assigned to this user.");
  if (accounts.length === 0) {
    return [];
  }
  return accounts.map((acc) => ({
    id: acc.id,
    name: acc.name,
    type: acc.type,
    balance: acc.balance,
  }));
}

async function getAccountsWithCategories(id: string) {
  const sharedAccountLinks = await prisma.userToAccount.findMany({
    where: { userId: id },
    select: { accountId: true },
  });
  const sharedAccountIds = sharedAccountLinks.map((link) => link.accountId);
  return await prisma.account.findMany({
    where: {
      OR: [{ ownerId: id }, { id: { in: sharedAccountIds } }],
    },
    select: {
      id: true,
      name: true,
      categories: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

async function getAccount(id: string) {
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
      categories: {
        select: {
          name: true,
          shortcut: true,
        },
      },
    },
  });
  if (!account) throw new ResourceNotFoundError("Not such account found.");
  return account;
}

async function getAccountsCount(id: string) {
  return (await getUserAccounts(id)).length;
}

async function updateAccount({
  name,
  description,
  setAsMain,
  userId,
  accountId,
}: UpdateAccountData) {
  return prisma.$transaction(async (tx) => {
    if (setAsMain && userId) {
      tx.user.update({
        where: { id: userId },
        data: { mainAccountId: accountId },
      });
    }
    return await tx.account.update({
      where: { id: accountId },
      data: {
        name,
        description,
      },
    });
  });
}

async function shareAccount(id: string, email: string) {}

async function deleteAccount(id: string) {
  return await prisma.account.delete({
    where: { id },
  });
}

export default {
  createAccount,
  getAccount,
  getAccountsCount,
  getAllAccounts,
  getMainAccount,
  getUserAccounts,
  deleteAccount,
  // shareAccount,
  updateAccount,
  getAccountsWithCategories,
};
