import { randomBytes } from 'node:crypto';
import { jwtConfig } from './jwt.config.js';

describe('JWT configuration', () => {
  afterEach(() => vi.unstubAllEnvs());

  it.each([undefined, '', '   '])(
    'rejects missing or blank secrets (%s)',
    (value) => {
      vi.stubEnv('JWT_ACCESS_SECRET', value);
      expect(jwtConfig).toThrow('JWT_ACCESS_SECRET is required');
    },
  );

  it.each(['change-me-in-local-env', 'short'])(
    'rejects placeholder/short secrets',
    (value) => {
      vi.stubEnv('JWT_ACCESS_SECRET', value);
      expect(jwtConfig).toThrow('at least 32 bytes');
    },
  );

  it.each([
    ['15m', 900],
    ['1h', 3600],
    ['60', 60],
    [undefined, 900],
  ])('uses configured expiry %s', (value, seconds) => {
    vi.stubEnv('JWT_ACCESS_SECRET', randomBytes(48).toString('hex'));
    vi.stubEnv('JWT_ACCESS_EXPIRES_IN', value);
    expect(jwtConfig().signOptions).toEqual({
      algorithm: 'HS256',
      expiresIn: seconds,
    });
  });

  it.each(['', '0', '-1', 'forever', '1.5h'])(
    'rejects invalid expiry %s',
    (value) => {
      vi.stubEnv('JWT_ACCESS_SECRET', randomBytes(48).toString('hex'));
      vi.stubEnv('JWT_ACCESS_EXPIRES_IN', value);
      expect(jwtConfig).toThrow('JWT_ACCESS_EXPIRES_IN');
    },
  );
});
