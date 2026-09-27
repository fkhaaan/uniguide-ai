import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Prisma PostgreSQL connectivity (e2e)', () => {
  it('queries PostgreSQL through the registered PrismaService', async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleFixture.createNestApplication();

    try {
      await app.init();
      const prisma = app.get(PrismaService);
      const result = await prisma.$queryRaw<Array<{ value: number }>>`
        SELECT 1 AS value
      `;
      expect(result).toEqual([{ value: 1 }]);
    } finally {
      await app.close();
    }
  });
});
