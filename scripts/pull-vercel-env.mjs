import { existsSync, copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');
const targetEnv = String(process.argv[2] || 'development').trim() || 'development';
const vercelProjectPath = join(root, '.vercel', 'project.json');
const envPath = join(root, '.env');

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

if (!existsSync(vercelProjectPath)) {
  fail(
    'Missing .vercel/project.json. Run `npx vercel login` and `npx vercel link` in this repo first.',
  );
}

let projectMeta = null;
try {
  projectMeta = JSON.parse(readFileSync(vercelProjectPath, 'utf8'));
} catch (error) {
  fail(`Could not read .vercel/project.json: ${error.message}`);
}

if (existsSync(envPath)) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = join(root, 'tmp', `env-backup-${stamp}.env`);
  mkdirSync(join(root, 'tmp'), { recursive: true });
  copyFileSync(envPath, backupPath);
  console.log(`Backed up existing .env to ${backupPath}`);
}

console.log(
  `Pulling ${targetEnv} env from Vercel project ${projectMeta?.projectName || '(unknown)'} into ${envPath}`,
);

const pull = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['vercel', 'env', 'pull', '.env', '--environment', targetEnv],
  {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  },
);

if (pull.status !== 0) {
  fail(
    [
      'Vercel env pull failed.',
      'Make sure this device is logged into the same Vercel account/team and has access to the `concerttracker` project.',
      'If this is a fresh machine, run `npx vercel login` first.',
    ].join('\n'),
    pull.status || 1,
  );
}

console.log('\nNext steps:');
console.log('  npm run check');
console.log('  npm test');
console.log('  npm start');
