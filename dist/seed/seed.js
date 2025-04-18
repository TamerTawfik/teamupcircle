"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const prisma = new client_1.PrismaClient();
async function seedTable(filePath, modelName, displayName // For logging purposes
) {
    try {
        const absolutePath = path.resolve(process.cwd(), filePath);
        console.log(`Reading ${displayName} data from: ${absolutePath}`);
        const fileContent = await fs.readFile(absolutePath, 'utf-8');
        const data = JSON.parse(fileContent);
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
    }
    catch (error) {
        console.error(`Error seeding ${displayName} from ${filePath}:`, error);
        throw error;
    }
}
async function main() {
    console.log('Starting database seeding...');
    await seedTable('src/data/techs.json', 'tech', 'Tech');
    await seedTable('src/data/projectDomains.json', 'projectDomain', 'Project Domains');
    await seedTable('src/data/teamRoles.json', 'teamRole', 'Team Roles');
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
