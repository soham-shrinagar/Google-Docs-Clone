/**
 * Skip Prisma generate on Vercel (frontend-only deploy).
 * Render/backend CI still runs prisma generate via the backend build step.
 */
const { execSync } = require('child_process');
const path = require('path');

if (process.env.VERCEL === '1') {
  console.log('[postinstall] Skipping prisma generate (Vercel frontend deploy)');
  process.exit(0);
}

execSync('npm run db:generate -w backend', {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
});
