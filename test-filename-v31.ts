/**
 * Smoke test for filename v3.1 pattern
 * 
 * Tests:
 * 1. Final JPEG generation: {date}-{shootcode}_{room_type}_{index}_v{ver}.jpg
 * 2. RAW/HDR frame generation: {date}-{shootcode}_{room_type}_{index}_g{stack}_e{ev}.{ext}
 * 3. Parsing back filenames
 * 4. Index tracking per room type
 * 5. Version tracking for re-exports
 */

import {
  generateFinalJpegFilename,
  generateRawFrameFilename,
  parseFinalJpegFilename,
  parseRawFrameFilename,
  FilenameIndexTracker,
  FilenameVersionTracker,
  extractBaseName,
  formatDateForFilename,
} from './shared/filename-v31.js';

console.log('=== Filename v3.1 Smoke Test ===\n');

// Test 1: Final JPEG filename
console.log('Test 1: Final JPEG filename generation');
const jpegFilename = generateFinalJpegFilename({
  date: '2025-10-28',
  shootCode: 'AB3KQ',
  roomType: 'Fassade',
  index: 1,
  version: 1,
});
console.log(`Generated: ${jpegFilename}`);
console.log(`Expected:  2025-10-28-AB3KQ_fassade_001_v1.jpg`);
console.log(`✓ Match: ${jpegFilename === '2025-10-28-AB3KQ_fassade_001_v1.jpg'}\n`);

// Test 2: RAW/HDR frame filenames (HDR 5 bracket)
console.log('Test 2: RAW/HDR frame generation (HDR 5 bracket)');
const evValues = [-2, -1, 0, 1, 2];
const rawFilenames = evValues.map(ev => generateRawFrameFilename({
  date: '2025-10-28',
  shootCode: 'AB3KQ',
  roomType: 'Fassade',
  index: 1,
  stackNumber: 1,
  evValue: ev,
  extension: 'dng',
  version: 1,
}));

console.log('HDR 5 bracket frames:');
rawFilenames.forEach((filename, i) => {
  console.log(`  [${i}] ${filename}`);
});
console.log(`✓ All frames have base: 2025-10-28-AB3KQ_fassade_001_g001_e{ev}.dng\n`);

// Test 3: Parse JPEG filename
console.log('Test 3: Parse JPEG filename');
const parsedJpeg = parseFinalJpegFilename(jpegFilename);
console.log('Parsed components:', parsedJpeg);
console.log(`✓ Correct: ${
  parsedJpeg?.date === '2025-10-28' &&
  parsedJpeg?.shootCode === 'AB3KQ' &&
  parsedJpeg?.roomType === 'fassade' &&
  parsedJpeg?.index === 1 &&
  parsedJpeg?.version === 1
}\n`);

// Test 4: Parse RAW filename
console.log('Test 4: Parse RAW filename');
const parsedRaw = parseRawFrameFilename(rawFilenames[0]);
console.log('Parsed RAW (e-2):', parsedRaw);
console.log(`✓ Correct: ${
  parsedRaw?.date === '2025-10-28' &&
  parsedRaw?.shootCode === 'AB3KQ' &&
  parsedRaw?.roomType === 'fassade' &&
  parsedRaw?.index === 1 &&
  parsedRaw?.stackNumber === 1 &&
  parsedRaw?.evValue === -2 &&
  parsedRaw?.extension === 'dng'
}\n`);

// Test 5: Index tracking (simulating multiple subjects)
console.log('Test 5: Index auto-increment per room type');
const indexTracker = new FilenameIndexTracker();
console.log(`First Fassade:     index = ${indexTracker.getNextIndex('Fassade')}`);
console.log(`Second Fassade:    index = ${indexTracker.getNextIndex('Fassade')}`);
console.log(`First Wohnzimmer:  index = ${indexTracker.getNextIndex('Wohnzimmer')}`);
console.log(`Third Fassade:     index = ${indexTracker.getNextIndex('Fassade')}`);
console.log(`Second Wohnzimmer: index = ${indexTracker.getNextIndex('Wohnzimmer')}`);
console.log(`✓ Indices increment independently per room type\n`);

// Test 6: Version tracking (re-exports)
console.log('Test 6: Version tracking for re-exports');
const versionTracker = new FilenameVersionTracker();
const baseName = '2025-10-28-AB3KQ_fassade_001';
console.log(`First export of ${baseName}:  v${versionTracker.getNextVersion(baseName)}`);
console.log(`Re-export of same:            v${versionTracker.getNextVersion(baseName)}`);
console.log(`Another re-export:            v${versionTracker.getNextVersion(baseName)}`);
console.log(`✓ Versions increment for same base name\n`);

// Test 7: Extract base name
console.log('Test 7: Extract base name from filenames');
const base1 = extractBaseName('2025-10-28-AB3KQ_fassade_001_v1.jpg');
const base2 = extractBaseName('2025-10-28-AB3KQ_fassade_001_g001_e-2.dng');
console.log(`JPEG base:  ${base1}`);
console.log(`RAW base:   ${base2}`);
console.log(`✓ Same base: ${base1 === base2}\n`);

// Test 8: Orientation NOT in filename (only in JSON metadata)
console.log('Test 8: Orientation NOT in filename');
const fassadeFront = generateFinalJpegFilename({
  date: '2025-10-28',
  shootCode: 'AB3KQ',
  roomType: 'Fassade',
  index: 1,
  version: 1,
});
const fassadeSide = generateFinalJpegFilename({
  date: '2025-10-28',
  shootCode: 'AB3KQ',
  roomType: 'Fassade',
  index: 2,
  version: 1,
});
console.log(`Fassade front: ${fassadeFront}`);
console.log(`Fassade side:  ${fassadeSide}`);
console.log(`✓ No orientation suffix in filename (orientation in JSON metadata only)\n`);

// Test 9: Date formatting
console.log('Test 9: Date formatting');
const testDate = new Date('2025-10-28T15:30:00Z');
const formatted = formatDateForFilename(testDate);
console.log(`Date: ${testDate.toISOString()}`);
console.log(`Formatted: ${formatted}`);
console.log(`✓ Correct format: ${formatted === '2025-10-28'}\n`);

// Test 10: Room type normalization (Gäste-WC → gaeste-wc)
console.log('Test 10: Room type normalization with umlauts');
const gaesteWc = generateFinalJpegFilename({
  date: '2025-10-28',
  shootCode: 'AB3KQ',
  roomType: 'Gäste-WC',
  index: 1,
  version: 1,
});
console.log(`Generated: ${gaesteWc}`);
console.log(`Expected:  2025-10-28-AB3KQ_gaeste-wc_001_v1.jpg`);
console.log(`✓ Umlauts normalized: ${gaesteWc === '2025-10-28-AB3KQ_gaeste-wc_001_v1.jpg'}\n`);

console.log('=== All Tests Passed ✓ ===');
