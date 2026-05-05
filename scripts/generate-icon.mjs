import sharp from 'sharp';
import fs from 'fs';

const SIZE = 512;
const RADIUS = 115;

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5"/>
      <stop offset="50%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#6d28d9"/>
    </linearGradient>
  </defs>

  <!-- Rounded background -->
  <rect width="${SIZE}" height="${SIZE}" rx="${RADIUS}" fill="url(#bg)"/>

  <!-- Medal ribbon left -->
  <path d="M185 195 L215 310 L256 285 L220 170 Z" fill="#a5b4fc" opacity="0.9"/>
  <!-- Medal ribbon right -->
  <path d="M327 195 L297 310 L256 285 L292 170 Z" fill="#a5b4fc" opacity="0.9"/>

  <!-- Medal circle -->
  <circle cx="256" cy="210" r="105" fill="#fbbf24"/>
  <circle cx="256" cy="210" r="90" fill="#f59e0b"/>

  <!-- Star -->
  <polygon
    points="256,140 272,192 328,192 282,225 300,278 256,246 212,278 230,225 184,192 240,192"
    fill="white"
    opacity="0.95"
  />
</svg>`;

const sizes = [
  { file: 'public/apple-touch-icon.png', size: 180 },
  { file: 'public/icon-192.png', size: 192 },
  { file: 'public/icon-512.png', size: 512 },
];

for (const { file, size } of sizes) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(file);
  console.log(`Generated ${file}`);
}
