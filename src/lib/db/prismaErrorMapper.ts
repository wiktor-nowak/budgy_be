import { Prisma } from "../../prisma/generated/client";
import DatabaseError from "../../errors/DatabaseError";

export function mapPrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    throw new DatabaseError();
  }
  throw error;
}
