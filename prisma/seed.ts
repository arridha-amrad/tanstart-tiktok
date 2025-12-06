import "dotenv/config"

import { PrismaClient } from '../src/generated/prisma/client.js'

import { withAccelerate } from '@prisma/extension-accelerate'


const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate())

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing todos
  await prisma.todo.deleteMany()

  // Create example todos
  const todos = await prisma.todo.createMany({
    data: [
      { title: 'Buy groceries' },
      { title: 'Read a book' },
      { title: 'Workout' },
    ],
  })

  console.log(`✅ Created ${todos.count} todos`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
