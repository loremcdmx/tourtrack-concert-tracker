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

if (!/^[\w.-]+$/.test(targetEnv)) {
  fail(`Unsupported environment name: ${targetEnv}`);
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

function runVercel(commandParts) {
  if (process.platform === 'win32') {
    return spawnSync(process.env.comspec || 'cmd.exe', ['/d', '/s', '/c', `npx ${commandParts.join(' ')}`], {
      cwd: root,
      stdio: 'pipe',
      env: process.env,
      encoding: 'utf8',
    });
  }
  return spawnSync('npx', commandParts, {
    cwd: root,
    stdio: 'pipe',
    env: process.env,
    encoding: 'utf8',
  });
}

function flush(result) {
  const out = String(result?.stdout || '');
  const err = String(result?.stderr || '');
  if (out) process.stdout.write(out);
  if (err) process.stderr.write(err);
  return `${out}\n${err}`;
}

let pull = runVercel(['vercel', 'env', 'pull', '.env', '--yes', '--environment', targetEnv]);
let combinedOutput = flush(pull);

if (pull.status !== 0 && /not_linked/i.test(combinedOutput)) {
  console.log(`Linking repo to Vercel project ${projectMeta?.projectName || 'concerttracker'} and retrying...`);
  const link = runVercel(['vercel', 'link', '--yes', '--project', projectMeta?.projectName || 'concerttracker']);
  combinedOutput = flush(link);
  if (link.status !== 0) {
    fail(
      [
        'Vercel link failed.',
        'Run `npx vercel login` and then `npx vercel link --yes --project concerttracker` in this repo.',
      ].join('\n'),
      link.status || 1,
    );
  }
  pull = runVercel(['vercel', 'env', 'pull', '.env', '--yes', '--environment', targetEnv]);
  combinedOutput = flush(pull);
}

if (pull.status !== 0) {
  fail(
    [
      'Vercel env pull failed.',
      'Make sure this device is logged into the same Vercel account/team and has access to the `concerttracker` project.',
      'If this is a fresh machine, run `npx vercel login` first.',
      'If the repo is still not linked, run `npx vercel link --yes --project concerttracker` and retry.',
    ].join('\n'),
    pull.status || 1,
  );
}

console.log('\nNext steps:');
console.log('  npm run check');
console.log('  npm test');
console.log('  npm start');
