import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
