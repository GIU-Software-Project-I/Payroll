const fs = require('fs');
const path = 'c:/Users/Compu Zone/Desktop/pr-tracking/backend/.env';
const s = fs.readFileSync(path, 'utf8');
console.log('Raw file JSON:', JSON.stringify(s));
console.log('\n--- Lines (showing indices and JSON) ---');
const lines = s.split(/\r?\n/);
lines.forEach((l,i)=> console.log(i, JSON.stringify(l)));
const idx = lines.findIndex(l => l.includes('JWT_SECRET'));
if (idx === -1) {
  console.log('\nJWT_SECRET not found in file lines');
  process.exit(0);
}
const line = lines[idx];
console.log('\nFound line index', idx, '->', JSON.stringify(line));
console.log('Chars and codes:');
for (let i=0;i<line.length;i++){
  const ch=line[i];
  console.log(i, JSON.stringify(ch), ch.charCodeAt(0));
}
