import { PrismaClient } from './generated/prisma/client.js'

import { withAccelerate } from '@prisma/extension-accelerate'

const instance = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate())

declare global {
  var __prisma: typeof instance | undefined
}

export const prisma = globalThis.__prisma || instance

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}
