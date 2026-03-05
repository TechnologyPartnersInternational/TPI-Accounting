const { execSync } = require('child_process');

try {
  const output = execSync('npx tsc --noEmit', { encoding: 'utf-8' });
  console.log('SUCCESS:\n', output);
} catch (error) {
  console.error('ERROR OUT:\n', error.stdout);
  console.error('ERROR ERR:\n', error.stderr);
}
