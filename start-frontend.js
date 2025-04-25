import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const webpack = spawn('node', [
  './node_modules/webpack/bin/webpack.js',
  'serve',
  '--mode',
  'development',
  '--config',
  './webpack.config.js'
], {
  stdio: 'inherit',
  cwd: __dirname
});

webpack.on('error', (err) => {
  console.error('Failed to start webpack:', err);
});

process.on('SIGINT', () => {
  webpack.kill();
  process.exit();
}); 