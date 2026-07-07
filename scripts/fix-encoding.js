const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'src');

function fromCodes(...codes) {
  return String.fromCodePoint(...codes);
}

// [bad codepoints[], good char]
const rules = [
  [[0xC3, 0xA2, 0xE2, 0x201A, 0xAC, 0x201D], '\u2014'], // em dash —
  [[0xC3, 0xA2, 0xE2, 0x201A, 0xAC, 0x201C], '\u2013'], // en dash –
  [[0xC3, 0xA2, 0x2013, 0xC2, 0xA0], '\u25A0'], // ■
  [[0xC3, 0x82, 0xC2, 0xB7], '\u00B7'], // ·
  [[0xC3, 0x82, 0xB7], '\u00B7'], // · (variant)
  [[0xC3, 0xA2, 0xE2, 0x201A, 0xAC, 0xA6], '\u20A6'], // ₦ (Ã¢â€šÂ¦)
  [[0xC3, 0xA2, 0x20AC, 0xA0, 0x2190], '\u2190'], // ←
  [[0xC3, 0xA2, 0x20AC, 0xA0, 0x00A0, 0x2190], '\u2190'],
  [[0xC3, 0xA2, 0x20AC, 0xA0, 0x2192], '\u2192'], // →
  [[0xC3, 0xA2, 0x20AC, 0xA0, 0x00A0, 0x2192], '\u2192'],
  [[0xC3, 0xA2, 0xE2, 0x20AC, 0xA0, 0x2192], '\u2192'],
  [[0xC3, 0xA2, 0xE2, 0x20AC, 0xA0, 0x2190], '\u2190'],
  [[0xC3, 0xA2, 0xCB, 0x86, 0xE2, 0x20AC, 0xA6], '\u2B50'], // ⭐
  [[0xC3, 0xA2, 0xCB, 0x9C, 0xE2, 0x20AC, 0xA6], '\u2B50'],
  [[0xC3, 0xA2, 0xCB, 0x9C, 0xE2, 0x20AC, 0xA6], '\u2B50'],
  [[0xE2, 0x201A, 0xA6], '\u20A6'], // â‚¦ → ₦
  [[0xE2, 0x20AC, 0xA6], '\u2026'], // …
  [[0xE2, 0x20AC, 0x201D], '\u2014'],
  [[0xE2, 0x20AC, 0x201C], '\u2013'],
  [[0xC2, 0xB7], '\u00B7'],
];

const replacements = rules.map(([codes, to]) => [fromCodes(...codes), to]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.js')) files.push(full);
  }
  return files;
}

let updated = 0;
for (const file of walk(root)) {
  let text = fs.readFileSync(file, 'utf8');
  const original = text;
  for (const [from, to] of replacements) {
    if (from && text.includes(from)) {
      text = text.split(from).join(to);
    }
  }
  if (text !== original) {
    fs.writeFileSync(file, text, 'utf8');
    updated += 1;
    console.log(path.relative(root, file));
  }
}
console.log(`Updated ${updated} files`);

// Report leftovers
let leftovers = 0;
for (const file of walk(root)) {
  const text = fs.readFileSync(file, 'utf8');
  if (/Ã|â‚|â€|Â·/.test(text)) {
    console.log('LEFT:', path.relative(root, file));
    leftovers++;
  }
}
console.log(`Leftover files: ${leftovers}`);
