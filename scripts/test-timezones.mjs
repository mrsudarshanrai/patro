import { spawnSync } from 'node:child_process';

// West of UTC is where UTC/local date mixing shifts results by a day.
const timezones = ['Asia/Kathmandu', 'UTC', 'America/New_York', 'America/Los_Angeles', 'Pacific/Auckland'];

for (const tz of timezones) {
  const { status } = spawnSync('npx', ['jest', 'test/timezone.test.ts'], {
    stdio: 'inherit',
    env: { ...process.env, TZ: tz },
    shell: process.platform === 'win32',
  });
  if (status !== 0) process.exit(status ?? 1);
}
