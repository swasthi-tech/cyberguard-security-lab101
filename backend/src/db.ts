import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function getDb() {
  return prisma;
}

export async function initDB() {
  // Prisma handles migrations, we just test connection here
  try {
    await prisma.$connect();
    console.log('Successfully connected to the database via Prisma.');
  } catch (err) {
    console.error('Failed to connect to the database via Prisma:', err);
    throw err;
  }
}

export default prisma;
