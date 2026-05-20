/**
 * Generates minimal valid placeholder PNG icons for PWA.
 * Pure Node.js — no external dependencies.
 * Run: node scripts/generate-icons.js
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function createSolidPng(width, height, r, g, b) {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const crcBuf = Buffer.concat([Buffer.from(type), data]);
    const crc = crc32(crcBuf);
    const crcOut = Buffer.alloc(4);
    crcOut.writeUInt32BE(crc >>> 0);
    return Buffer.concat([len, Buffer.from(type), data, crcOut]);
  }

  // CRC32 table
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crcTable[n] = c;
  }
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Raw image data (scanlines with filter byte 0)
  const row = Buffer.alloc(1 + width * 3);
  row[0] = 0; // filter none
  for (let x = 0; x < width; x++) {
    row[1 + x * 3] = r;
    row[2 + x * 3] = g;
    row[3 + x * 3] = b;
  }
  const rawData = Buffer.concat(Array(height).fill(row));
  const compressed = zlib.deflateSync(rawData);

  const iend = Buffer.alloc(0);

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", iend),
  ]);
}

const iconsDir = path.join(__dirname, "../public/icons");
const publicDir = path.join(__dirname, "../public");

const configs = [
  { name: "icon-192x192.png", size: 192, dir: iconsDir },
  { name: "icon-512x512.png", size: 512, dir: iconsDir },
  { name: "apple-touch-icon.png", size: 180, dir: publicDir },
];

for (const { name, size, dir } of configs) {
  const png = createSolidPng(size, size, 10, 10, 10); // #0A0A0A
  const out = path.join(dir, name);
  fs.writeFileSync(out, png);
  console.log(`Written ${out} (${size}x${size} black placeholder)`);
}
