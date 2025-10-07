// Quick database connection test script
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  console.log('🔍 Testing database connection...\n')
  
  try {
    console.log('📡 Attempting to connect to Supabase...')
    const start = Date.now()
    
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1 as result`
    
    const duration = Date.now() - start
    console.log(`✅ SUCCESS! Database connected in ${duration}ms\n`)
    
    // Test a real query
    console.log('🔍 Testing video table access...')
    const videoCount = await prisma.video.count()
    console.log(`✅ Found ${videoCount} videos in database\n`)
    
    process.exit(0)
  } catch (error: any) {
    console.error('❌ DATABASE CONNECTION FAILED\n')
    console.error('Error:', error.message)
    console.error('\n📋 Possible causes:')
    console.error('  1. Database is paused (Supabase free tier)')
    console.error('  2. Network/firewall blocking connection')
    console.error('  3. Wrong credentials in .env file')
    console.error('  4. Database server is down')
    console.error('\n🔧 Solution:')
    console.error('  → Go to https://supabase.com/dashboard')
    console.error('  → Find your project (gpllsuldiupvtvnigrlp)')
    console.error('  → Click "Resume database" or "Unpause"')
    console.error('  → Wait 30-60 seconds, then try again')
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
