import { Response, Request, NextFunction } from "express";
import {
  PrismaClient,
  Prisma,
  AccountType,
} from "../../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import AuthenticationError from "../../errors/AuthenticationError";
import ResourceNotFoundError from "../../errors/ResourceNotFoundError";
import accountsService from "../../services/accounts";

export const getAllAccounts = async (_req: Request, res: Response) => {
  const accounts = await accountsService.getAllAccounts();
  if (!accounts) throw new ResourceNotFoundError("Nothing found.");
  res.status(200).json({ response: accounts });
};

export const getMainAccount = async (req: Request, res: Response) => {
  const account = accountsService.getMainAccount(req.auth.id);
  res.status(200).json({ response: account });
};

export const createAccount = async (req: Request, res: Response) => {
  const { name, type, balance, description, setAsMain } = req.body;
  const newAccount = await accountsService.createAccount({
    name,
    type,
    balance,
    description,
    setAsMain,
    userId: req.auth.id,
  });
  res.status(201).location(`/accounts/${newAccount.id}`);
};

export const deleteAccount = async (req: Request, res: Response) => {
  await accountsService.deleteAccount(req.body?.id);
  res.status(204);
};

export const getUserAccounts = async (req: Request, res: Response) => {
  const accounts = accountsService.getUserAccounts(req.auth.userId);
  res.status(200).send({ response: accounts });
};

export const getAccountsCount = async (req: Request, res: Response) => {
  const len = accountsService.getAccountsCount(req.auth.id);
  res.status(200).send({ response: len });
};

export const getAccount = async (req: Request, res: Response) => {
  const account = await accountsService.getAccount(req.body.id);
  res.status(200).send({ response: account });
};

export const updateAccount = async (req: Request, res: Response) => {
  const { id, name, balance, description, setAsMain } = req.body;

  await accountsService.updateAccount({
    accountId: id,
    userId: req.auth.id,
    name,
    balance,
    description,
    setAsMain,
  });
  res.status(204);
};
