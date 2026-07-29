import { prisma } from '../src/lib/prisma';

async function checkDb() {
  try {
    const user = await prisma.user.findFirst();
    console.log('User model with loyaltyPoints ok. LoyaltyPoints =', user?.loyaltyPoints);
    const savedAddrCount = await prisma.savedAddress.count();
    console.log('SavedAddress table ok, count =', savedAddrCount);
    console.log('Database schema successfully updated in PostgreSQL! ✅');
  } catch (err) {
    console.error('Error verifying db:', err);
  } finally {
    process.exit(0);
  }
}

checkDb();
