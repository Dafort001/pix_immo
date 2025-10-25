import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join } from 'path';

const sourceIcon = 'attached_assets/generated_images/pix.immo_camera_app_icon_0d125864.png';
const outputDir = 'client/public/icons';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  console.log('📱 Generating PWA icons...');
  
  const sourceBuffer = readFileSync(sourceIcon);
  
  for (const size of sizes) {
    const outputPath = join(outputDir, `icon-${size}.png`);
    
    await sharp(sourceBuffer)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Generated ${size}x${size} icon`);
  }
  
  console.log('✅ All PWA icons generated successfully!');
}

generateIcons().catch(console.error);
