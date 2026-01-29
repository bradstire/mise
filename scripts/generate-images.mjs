import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Generate icon PNGs from SVG
async function generateIcons() {
  const iconSvg = readFileSync(join(publicDir, 'icon.svg'));
  
  // 192x192 icon
  await sharp(iconSvg)
    .resize(192, 192)
    .png()
    .toFile(join(publicDir, 'icon-192.png'));
  console.log('✓ Generated icon-192.png');
  
  // 512x512 icon
  await sharp(iconSvg)
    .resize(512, 512)
    .png()
    .toFile(join(publicDir, 'icon-512.png'));
  console.log('✓ Generated icon-512.png');
  
  // Apple touch icon (180x180)
  await sharp(iconSvg)
    .resize(180, 180)
    .png()
    .toFile(join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Generated apple-touch-icon.png');
}

// Generate OG image PNG from SVG
async function generateOgImage() {
  const ogSvg = readFileSync(join(publicDir, 'og-image.svg'));
  
  await sharp(ogSvg)
    .resize(1200, 630)
    .png()
    .toFile(join(publicDir, 'og-image.png'));
  console.log('✓ Generated og-image.png');
}

async function main() {
  try {
    await generateIcons();
    await generateOgImage();
    console.log('\n🎉 All images generated successfully!');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
