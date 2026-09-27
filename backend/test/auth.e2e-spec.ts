import { randomUUID } from 'node:crypto';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import * as argon2 from 'argon2';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const ownedEmails: string[] = [];
  const password = 'Correct horse battery staple!';
  const email = () => {
    const value = `auth-e2e-${randomUUID()}@example.test`;
    ownedEmails.push(value);
    return value;
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication({ logger: false });
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    try {
      // Exact UUID-based addresses owned by this run; never truncate or delete all users.
      if (prisma && ownedEmails.length)
        await prisma.user.deleteMany({ where: { email: { in: ownedEmails } } });
    } finally {
      if (app) await app.close();
    }
  });

  it('registers, hashes, signs and logs in with normalized email', async () => {
    const address = email();
    const registered = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `  ${address.toUpperCase()}  `,
        password,
        name: ' Student Name ',
      })
      .expect(201);
    expect(registered.body.user).toEqual({
      id: expect.any(String),
      email: address,
      name: 'Student Name',
      role: 'STUDENT',
      universityId: null,
    });
    expect(registered.body.user).not.toHaveProperty('passwordHash');
    const stored = await prisma.user.findUniqueOrThrow({
      where: { email: address },
    });
    expect(stored.passwordHash).not.toBe(password);
    expect(await argon2.verify(stored.passwordHash, password)).toBe(true);
    const claims = app.get(JwtService).verify(registered.body.accessToken);
    expect(Object.keys(claims).sort()).toEqual([
      'email',
      'exp',
      'iat',
      'role',
      'sub',
    ]);
    expect(claims.sub).toBe(stored.id);
    expect(claims.exp).toBeGreaterThan(claims.iat);
    const loggedIn = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: ` ${address.toUpperCase()} `, password })
      .expect(200);
    expect(loggedIn.body.user).toEqual(registered.body.user);
    expect(loggedIn.body.user).not.toHaveProperty('passwordHash');
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: address, password })
      .expect(409);
    const wrong = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: address, password: 'incorrect password' })
      .expect(401);
    const unknown = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: email(), password })
      .expect(401);
    expect(wrong.body).toEqual(unknown.body);
    expect(wrong.body.message).toBe('Invalid email or password');
  });

  it('does not expose internal errors in HTTP responses', async () => {
    const lookup = vi
      .spyOn(prisma.user, 'findUnique')
      .mockRejectedValueOnce(
        new Error('private database implementation detail'),
      );
    try {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: email(), password })
        .expect(500);
      expect(response.body).toEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    } finally {
      lookup.mockRestore();
    }
  });

  it('accepts registration without a name', async () => {
    const result = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: email(), password })
      .expect(201);
    expect(result.body.user.name).toBeNull();
  });

  it('rejects malformed emails', async () => {
    const invalid = `auth-e2e-${randomUUID()}`;
    ownedEmails.push(invalid);
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: invalid, password })
      .expect(400);
  });

  it.each(['short', 'x'.repeat(129), null, 12345])(
    'rejects invalid registration passwords',
    async (value) => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: email(), password: value })
        .expect(400);
    },
  );

  it.each([
    { role: 'ADMIN' },
    { role: 'STAFF' },
    { universityId: randomUUID() },
    { unexpected: true },
    { passwordHash: 'forbidden' },
  ])('rejects unexpected or privileged fields %j', async (extra) => {
    const address = email();
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: address, password, ...extra })
      .expect(400);
    expect(
      await prisma.user.findUnique({ where: { email: address } }),
    ).toBeNull();
  });

  it('rejects malformed login and unexpected login fields', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'invalid', password })
      .expect(400);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: email(), password, role: 'ADMIN' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: email() })
      .expect(400);
  });

  it('handles concurrent duplicate registration as one success and one conflict', async () => {
    const address = email();
    const results = await Promise.all(
      [1, 2].map(() =>
        request(app.getHttpServer())
          .post('/auth/register')
          .send({ email: address, password }),
      ),
    );
    expect(results.map((result) => result.status).sort()).toEqual([201, 409]);
    expect(await prisma.user.count({ where: { email: address } })).toBe(1);
  });
});
