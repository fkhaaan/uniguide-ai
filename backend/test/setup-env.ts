import { randomBytes } from 'node:crypto';

// E2E signing keys are ephemeral and never written to disk or printed.
process.env.JWT_ACCESS_SECRET = randomBytes(48).toString('hex');
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
