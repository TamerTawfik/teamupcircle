import { PrismaClient } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();

interface DataItem {
  id: string;
  name: string;
}

type ModelName = 'tech' | 'projectDomain' | 'teamRole';

async function seedTable<T extends DataItem>(
  filePath: string,
  modelName: ModelName,
  displayName: string // For logging purposes
) {
  try {
    const absolutePath = path.resolve(process.cwd(), filePath);
    console.log(`Reading ${displayName} data from: ${absolutePath}`);
    const fileContent = await fs.readFile(absolutePath, 'utf-8');
    const data = JSON.parse(fileContent) as T[];

    console.log(`Seeding ${data.length} ${displayName} records...`);

    for (const item of data) {
      const upsertArgs = {
        where: { id: item.id },
        update: { name: item.name },
        create: {
          id: item.id,
          name: item.name,
        },
      };

      // Use a switch statement to call the correct model's upsert
      switch (modelName) {
        case 'tech':
          await prisma.tech.upsert(upsertArgs);
          break;
        case 'projectDomain':
          await prisma.projectDomain.upsert(upsertArgs);
          break;
        case 'teamRole':
          await prisma.teamRole.upsert(upsertArgs);
          break;
        default:
          // Should not happen with TypeScript, but good practice
          console.warn(`Unknown model name: ${modelName}`);
      }
    }
    console.log(`Successfully seeded ${displayName}.`);
  } catch (error) {
    console.error(`Error seeding ${displayName} from ${filePath}:`, error);
    throw error;
  }
}

async function main() {
  console.log('Starting database seeding...');

  await seedTable<DataItem>('src/data/techs.json', 'tech', 'Tech');
  await seedTable<DataItem>('src/data/projectDomains.json', 'projectDomain', 'Project Domains');
  await seedTable<DataItem>('src/data/teamRoles.json', 'teamRole', 'Team Roles');

  console.log('Database seeding finished.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 