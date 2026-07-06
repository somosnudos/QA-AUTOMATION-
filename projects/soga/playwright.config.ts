import path from 'node:path';
import { createProjectConfig } from '../../config/playwright.config.base';
import { config } from 'dotenv';

config({ path: path.join(__dirname, '.env') });

const ROOT = __dirname;
export default createProjectConfig({
  testDir: path.join(ROOT, 'tests'),
  outputDir: path.join(ROOT, 'test-results'),
  workers: 1,
  use: { baseURL: process.env.BASE_URL },
});
