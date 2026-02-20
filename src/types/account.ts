import { AccountType } from "../prisma/generated/enums";

export interface AccountData {
  name: string;
  type: AccountType;
  description: string;
  setAsMain: boolean;
  userId: string;
}

export interface UpdateAccountData extends Omit<AccountData, "type"> {
  accountId: string;
}
