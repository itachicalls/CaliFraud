import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.fraudCase.count()
  console.log('Total cases in database:', count)
  
  const sample = await prisma.fraudCase.findFirst()
  console.log('Sample case:', sample?.title)
  
  await prisma.$disconnect()
}

main()
