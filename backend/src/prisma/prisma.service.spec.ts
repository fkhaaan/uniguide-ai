import { PrismaService } from './prisma.service.js';

describe('PrismaService configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([undefined, '', '   '])(
    'fails clearly when DATABASE_URL is missing or blank (%s)',
    (value) => {
      vi.stubEnv('DATABASE_URL', value);
      expect(() => new PrismaService()).toThrow(
        'DATABASE_URL is required to initialize PrismaService',
      );
    },
  );
});
