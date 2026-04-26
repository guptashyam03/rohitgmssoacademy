/**
 * Recovery script — creates or restores an ADMIN account.
 * Run from the project root:
 *   node scripts/recover-admin.js your@email.com yourpassword "Your Name"
 *
 * Requires DATABASE_URL in your .env file.
 */

require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const [,, email, password, name = 'Admin'] = process.argv

if (!email || !password) {
  console.error('Usage: node scripts/recover-admin.js <email> <password> [name]')
  process.exit(1)
}

const prisma = new PrismaClient()

async function main() {
  const hashed = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashed,
      role: 'ADMIN',
      emailVerified: new Date(),
      name,
    },
    create: {
      email,
      password: hashed,
      role: 'ADMIN',
      emailVerified: new Date(),
      name,
    },
  })

  console.log(`\n✓ Admin account ready:`)
  console.log(`  ID:    ${user.id}`)
  console.log(`  Email: ${user.email}`)
  console.log(`  Role:  ${user.role}`)
  console.log(`\nYou can now log in at /login with the credentials you provided.\n`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
