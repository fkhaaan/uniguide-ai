import 'dotenv/config';
import type { JwtModuleOptions } from '@nestjs/jwt';

export function jwtConfig(): JwtModuleOptions {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret?.trim()) {
    throw new Error('JWT_ACCESS_SECRET is required');
  }
  if (
    secret.trim() === 'change-me-in-local-env' ||
    Buffer.byteLength(secret) < 32
  ) {
    throw new Error(
      'JWT_ACCESS_SECRET must be a non-placeholder secret of at least 32 bytes',
    );
  }

  const duration = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';
  const match = /^([1-9]\d*)(s|m|h|d)?$/.exec(duration);
  const units: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  const seconds = match ? Number(match[1]) * units[match[2] ?? 's'] : NaN;
  if (!Number.isSafeInteger(seconds) || seconds <= 0) {
    throw new Error(
      'JWT_ACCESS_EXPIRES_IN must be positive seconds or a duration such as 15m',
    );
  }
  return { secret, signOptions: { algorithm: 'HS256', expiresIn: seconds } };
}
