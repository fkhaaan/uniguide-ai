import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service.js';
import { Prisma, UserRole } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

const password = 'test password with spaces';
const user = {
  id: 'test-id',
  email: 'student@example.com',
  fullName: 'Student',
  role: UserRole.STUDENT,
  universityId: null,
};

describe('AuthService', () => {
  const database = { user: { findUnique: vi.fn(), create: vi.fn() } };
  const jwt = new JwtService({
    secret: randomBytes(48).toString('hex'),
    signOptions: { expiresIn: 900, algorithm: 'HS256' },
  });
  let service: AuthService;

  beforeEach(async () => {
    vi.resetAllMocks();
    service = new AuthService(database as unknown as PrismaService, jwt);
    await service.onModuleInit();
    database.user.findUnique.mockResolvedValue(null);
    database.user.create.mockResolvedValue(user);
  });

  it('registers a normalized STUDENT, hashes the password and returns only safe fields', async () => {
    const result = await service.register({
      email: '  STUDENT@EXAMPLE.COM ',
      password,
      name: ' Student ',
    });
    const input = database.user.create.mock.calls[0][0];
    expect(input.data).toMatchObject({
      email: user.email,
      role: 'STUDENT',
      fullName: 'Student',
      universityId: null,
    });
    expect(input.data.passwordHash).not.toBe(password);
    expect(input.data.passwordHash).toMatch(/^\$argon2id\$/);
    expect(await argon2.verify(input.data.passwordHash, password)).toBe(true);
    expect(database.user.findUnique).toHaveBeenCalledWith({
      where: { email: user.email },
      select: { id: true },
    });
    expect(result.user).toEqual({
      id: user.id,
      email: user.email,
      name: 'Student',
      role: 'STUDENT',
      universityId: null,
    });
    expect(result.user).not.toHaveProperty('passwordHash');
    const claims = jwt.verify(result.accessToken);
    expect(Object.keys(claims).sort()).toEqual([
      'email',
      'exp',
      'iat',
      'role',
      'sub',
    ]);
    expect(claims).toMatchObject({
      sub: user.id,
      email: user.email,
      role: 'STUDENT',
    });
    expect(claims.exp - claims.iat).toBe(900);
  });

  it('stores a null name when omitted', async () => {
    await service.register({ email: user.email, password });
    expect(database.user.create.mock.calls[0][0].data.fullName).toBeNull();
  });

  it('rejects existing email addresses without creating a user', async () => {
    database.user.findUnique.mockResolvedValue({ id: user.id });
    await expect(
      service.register({ email: user.email, password }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(database.user.create).not.toHaveBeenCalled();
  });

  it('maps a concurrent unique-email conflict to 409', async () => {
    database.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('unique', {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: { target: ['email'] },
      }),
    );
    await expect(
      service.register({ email: user.email, password }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('does not misclassify unexpected database errors as duplicates', async () => {
    const error = new Error('database unavailable');
    database.user.create.mockRejectedValue(error);
    await expect(
      service.register({ email: user.email, password }),
    ).rejects.toBe(error);
  });

  it('logs in with normalized email and never returns the stored hash', async () => {
    database.user.findUnique.mockResolvedValue({
      ...user,
      passwordHash: await argon2.hash(password),
    });
    const result = await service.login({
      email: ' STUDENT@EXAMPLE.COM ',
      password,
    });
    expect(database.user.findUnique.mock.calls[0][0].where).toEqual({
      email: user.email,
    });
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(jwt.verify(result.accessToken).sub).toBe(user.id);
  });

  it('returns the same generic error for unknown email and wrong password', async () => {
    const expected = new UnauthorizedException('Invalid email or password');
    await expect(
      service.login({ email: user.email, password }),
    ).rejects.toEqual(expected);
    database.user.findUnique.mockResolvedValue({
      ...user,
      passwordHash: await argon2.hash(password),
    });
    await expect(
      service.login({ email: user.email, password: 'incorrect password' }),
    ).rejects.toEqual(expected);
  });
});
