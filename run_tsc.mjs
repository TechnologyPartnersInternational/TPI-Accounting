import fs from 'fs';
import { exec } from 'child_process';

exec('npx tsc --noEmit', (error, stdout, stderr) => {
  fs.writeFileSync('tsc-out-full.txt', stdout);
  fs.writeFileSync('tsc-err-full.txt', stderr);
  console.log('done writing tsc logs');
});
