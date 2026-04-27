import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Esto permite que lo importes como: import { prisma } from ...
export { prisma };

// Esto permite que lo importes como: import prisma from ...
export default prisma;