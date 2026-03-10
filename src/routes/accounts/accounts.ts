import { Response, Request } from "express";
import ResourceNotFoundError from "../../errors/ResourceNotFoundError";
import accountsService from "../../services/accounts";

export const getAllAccounts = async (_req: Request, res: Response) => {
  const accounts = await accountsService.getAllAccounts();
  if (!accounts) throw new ResourceNotFoundError("Nothing found.");
  res.status(200).json({ response: accounts });
};

export const getMainAccount = async (req: Request, res: Response) => {
  const account = await accountsService.getMainAccount(req.auth.id);
  res.status(200).json({ response: account });
};

export const createAccount = async (req: Request, res: Response) => {
  const newAccount = await accountsService.createAccount({
    ...req.body,
    userId: req.auth.id,
  });
  res
    .status(201)
    .location(`/accounts/${newAccount.id}`)
    .send({ response: newAccount });
};

// TODO: Change this one - not working!
export const deleteAccount = async (req: Request, res: Response) => {
  await accountsService.deleteAccount(req.auth?.id);
  res.status(204);
};

export const getUserAccounts = async (req: Request, res: Response) => {
  const accounts = await accountsService.getUserAccounts(req.auth.id);
  res.status(200).send({ response: accounts });
};

export const getAccountsWithCategories = async (
  req: Request,
  res: Response,
) => {
  const accounts = await accountsService.getAccountsWithCategories(req.auth.id);
  res.status(200).send({ response: accounts });
};

export const getAccountsCount = async (req: Request, res: Response) => {
  const len = await accountsService.getAccountsCount(req.auth.id);
  res.status(200).send({ response: len });
};

export const getAccount = async (req: Request, res: Response) => {
  const account = await accountsService.getAccount(req.params.id as string);
  res.status(200).send({ response: account });
};

export const updateAccount = async (req: Request, res: Response) => {
  const { id, name, description, setAsMain } = req.body;

  await accountsService.updateAccount({
    accountId: id,
    userId: req.auth.id,
    name,
    description,
    setAsMain,
  });
  res.status(204);
};
