import { randomBytes } from 'node:crypto';
import {
  ConflictException,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { Prisma, UserRole } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';

const hashOptions = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;
const publicUserSelect = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  universityId: true,
} as const;
type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

@Injectable()
export class AuthService implements OnModuleInit {
  private dummyHash!: string;

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwt: JwtService,
  ) {}

  async onModuleInit(): Promise<void> {
    // Unknown accounts still perform password verification to reduce timing differences.
    this.dummyHash = await argon2.hash(randomBytes(32), hashOptions);
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) throw new ConflictException('Email is already registered');

    const passwordHash = await argon2.hash(dto.password, hashOptions);
    let user: PublicUser;
    try {
      user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName: dto.name?.trim() ?? null,
          role: UserRole.STUDENT,
          universityId: null,
        },
        select: publicUserSelect,
      });
    } catch (error) {
      // The unique constraint also protects concurrent registrations after the lookup.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email is already registered');
      }
      throw error;
    }
    return this.authResponse(user);
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { ...publicUserSelect, passwordHash: true },
    });
    const valid = await argon2.verify(
      user?.passwordHash ?? this.dummyHash,
      dto.password,
    );
    if (!user || !valid)
      throw new UnauthorizedException('Invalid email or password');
    return this.authResponse(user);
  }

  private async authResponse(user: PublicUser) {
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role,
        universityId: user.universityId,
      },
      accessToken,
    };
  }
}
