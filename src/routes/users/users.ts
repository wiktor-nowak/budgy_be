import { Response, Request } from "express";
import credentialsService from "../../services/credentials";
import ResourceNotFoundError from "../../errors/ResourceNotFoundError";
import usersService from "../../services/users";

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await usersService.getAllUsers();
  res.status(200).send({ response: users });
};

export const getActiveUser = async (req: Request, res: Response) => {
  const user = usersService.getActiveUser(req.auth.id);
  if (!user) throw new ResourceNotFoundError("User not found.");
  res.status(200).json({ response: user });
};

// add method getUser - to retrieve a particular user, not active.

export const createUser = async (req: Request, res: Response) => {
  const { username, email, password } = credentialsService.parseRegisterRequest(
    req.body,
  );
  const createdUser = await usersService.createUser(username, email, password);
  if (!createdUser) throw new ResourceNotFoundError("User instance not found.");
  res.status(201).location(`/users/${createdUser.id}`);
  // add sending e-mail with registration link
};

export const updateUser = async (req: Request, res: Response) => {
  // add case of admin who want to change user who is not him - here?? not sure.
  const updatedUser = usersService.updateUser(req.auth.id, req.body);
  if (!updatedUser)
    throw new ResourceNotFoundError("User instance has not been changed.");
  res.status(204);
};

export const changePassword = async (req: Request, res: Response) => {
  const {
    body: { oldPassword, newPassword },
    auth: { id },
  } = req;
  await usersService.changePassword(id, oldPassword, newPassword);
  res.status(204);
};

export const deleteUser = async (req: Request, res: Response) => {
  // OF COURSE CHECK TO BE PERFORMED - cause u almost never delete your own account...
  usersService.deleteUser(req.auth.id);
  res.status(204);
};
