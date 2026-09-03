import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDb = async () => {
  return {
    get: async (query: string, params: any[] = []) => {
      const result: any[] = await prisma.$queryRawUnsafe(query, ...params);
      return result.length > 0 ? result[0] : null;
    },
    run: async (query: string, params: any[] = []) => {
      await prisma.$executeRawUnsafe(query, ...params);
    }
  };
};

export async function initDB() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to the database via Prisma.');
  } catch (err) {
    console.error('Failed to connect to the database via Prisma:', err);
    throw err;
  }
}

export default prisma;
