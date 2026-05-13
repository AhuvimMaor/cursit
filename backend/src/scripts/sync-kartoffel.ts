import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import https from 'https';

const prisma = new PrismaClient();

const KARTOFFEL_BASE_URL = process.env.KARTOFFEL_BASE_URL || 'https://kartoffel.branch-yesodot.org/api';

const client = axios.create({
  baseURL: KARTOFFEL_BASE_URL,
  timeout: 15000,
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
});

async function main() {
  console.log('Syncing Kartoffel members...');

  // Fetch members from Kartoffel
  const allEntities: any[] = [];
  for (let page = 1; page <= 3; page++) {
    const res = await client.get('/entities', { params: { page, pageSize: 100 } });
    allEntities.push(...res.data);
    if (res.data.length < 100) break;
  }
  console.log(`Fetched ${allEntities.length} entities from Kartoffel`);

  // Ensure branches exist
  const branchNames = [...new Set(allEntities.map((e) => e.akaUnit).filter(Boolean))];
  const branchMap = new Map<string, number>();
  for (const name of branchNames) {
    const branch = await prisma.branch.upsert({
      where: { id: -1 }, // force create
      update: {},
      create: { name },
    }).catch(() => prisma.branch.findFirst({ where: { name } }));
    if (branch) branchMap.set(name, branch.id);
  }

  // Pick roles: first entity = BIS_CDR, next 3 = BRANCH_COORD, next 5 = TEAM_LEADER, rest = TRAINEE
  let created = 0;
  for (let i = 0; i < Math.min(allEntities.length, 30); i++) {
    const e = allEntities[i];
    const role = i === 0 ? 'BIS_CDR' : i <= 3 ? 'BRANCH_COORD' : i <= 8 ? 'TEAM_LEADER' : 'TRAINEE';
    const branchId = branchMap.get(e.akaUnit) ?? null;

    try {
      await prisma.user.upsert({
        where: { uniqueId: e.personalNumber },
        update: { name: e.fullName, role, branchId },
        create: {
          uniqueId: e.personalNumber,
          name: e.fullName,
          role,
          branchId,
        },
      });
      created++;
    } catch (err) {
      // skip duplicates
    }
  }

  console.log(`Synced ${created} users from Kartoffel`);
  console.log('Done!');
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
