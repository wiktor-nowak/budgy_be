import { Category } from "../prisma/generated/client";

export type CategoryData = Pick<Category, "name" | "shortcut" | "accountId">;
export type UpdateCategoryData = Pick<Category, "name" | "shortcut" | "id">;
export type CategoryEntry = Pick<Category, "name" | "shortcut">;

export const GENERIC_CATEGORIES: CategoryEntry[] = [
  { name: "Housing", shortcut: "HOU" },
  { name: "Utilities", shortcut: "UTIL" },
  { name: "Food & Dining", shortcut: "FONDR" },
  { name: "Groceries", shortcut: "GRO" },
  { name: "Transportation", shortcut: "TRNSP" },
  { name: "Entertainment", shortcut: "ENT" },
  { name: "Healthcare", shortcut: "HEALH" },
  { name: "Personal Care", shortcut: "PC" },
  { name: "Bills & Services", shortcut: "BNS" },
  { name: "Gifts & Donations", shortcut: "GND" },
  { name: "Earnings", shortcut: "MONEY" },
  { name: "Other", shortcut: "OTH" },
];
