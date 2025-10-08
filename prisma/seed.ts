import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'frontend' },
      update: {},
      create: {
        name: 'Frontend Development',
        slug: 'frontend',
        color: '#3B82F6' // Blue
      }
    }),
    prisma.category.upsert({
      where: { slug: 'backend' },
      update: {},
      create: {
        name: 'Backend Development',
        slug: 'backend',
        color: '#8B5CF6' // Purple
      }
    }),
    prisma.category.upsert({
      where: { slug: 'mobile' },
      update: {},
      create: {
        name: 'Mobile Development',
        slug: 'mobile',
        color: '#F59E0B' // Amber
      }
    }),
    prisma.category.upsert({
      where: { slug: 'data-science' },
      update: {},
      create: {
        name: 'Data Science & ML',
        slug: 'data-science',
        color: '#10B981' // Green
      }
    }),
    prisma.category.upsert({
      where: { slug: 'devops' },
      update: {},
      create: {
        name: 'DevOps & Cloud',
        slug: 'devops',
        color: '#EF4444' // Red
      }
    }),
    prisma.category.upsert({
      where: { slug: 'dsa' },
      update: {},
      create: {
        name: 'DSA & Algorithms',
        slug: 'dsa',
        color: '#EC4899' // Pink
      }
    }),
    prisma.category.upsert({
      where: { slug: 'design' },
      update: {},
      create: {
        name: 'UI/UX Design',
        slug: 'design',
        color: '#14B8A6' // Teal
      }
    }),
    prisma.category.upsert({
      where: { slug: 'productivity' },
      update: {},
      create: {
        name: 'Productivity',
        slug: 'productivity',
        color: '#6366F1' // Indigo
      }
    })
  ]);

  console.log(`✅ Created ${categories.length} categories`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
