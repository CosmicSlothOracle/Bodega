import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GALLERY_DIR = path.join(__dirname, '../public/gallery');

async function optimizeGallery() {
  console.log(`Scanning ${GALLERY_DIR} for JPEG images...`);
  
  try {
    const files = await fs.readdir(GALLERY_DIR);
    const jpegFiles = files.filter(file => /\.(jpg|jpeg)$/i.test(file));
    
    if (jpegFiles.length === 0) {
      console.log('No JPEG images found to optimize.');
      return;
    }
    
    console.log(`Found ${jpegFiles.length} images to optimize.\n`);
    
    let totalOriginalSize = 0;
    let totalNewSize = 0;
    
    for (const file of jpegFiles) {
      const originalPath = path.join(GALLERY_DIR, file);
      const parsedPath = path.parse(originalPath);
      const newPath = path.join(GALLERY_DIR, `${parsedPath.name}.webp`);
      
      const stat = await fs.stat(originalPath);
      totalOriginalSize += stat.size;
      
      console.log(`Processing: ${file}`);
      
      await sharp(originalPath)
        .resize({
          width: 2400,
          height: 2400,
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 78 })
        .toFile(newPath);
        
      const newStat = await fs.stat(newPath);
      totalNewSize += newStat.size;
      
      const savedBytes = stat.size - newStat.size;
      const savedPercent = ((savedBytes / stat.size) * 100).toFixed(1);
      
      console.log(`  Original: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  New:      ${(newStat.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Saved:    ${(savedBytes / 1024 / 1024).toFixed(2)} MB (${savedPercent}%)\n`);
      
      // Delete the original file
      await fs.unlink(originalPath);
    }
    
    const totalSavedBytes = totalOriginalSize - totalNewSize;
    const totalSavedPercent = ((totalSavedBytes / totalOriginalSize) * 100).toFixed(1);
    
    console.log('Optimization complete!');
    console.log(`Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total new size:      ${(totalNewSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total saved:         ${(totalSavedBytes / 1024 / 1024).toFixed(2)} MB (${totalSavedPercent}%)`);
    
  } catch (error) {
    console.error('Error optimizing gallery:', error);
    process.exit(1);
  }
}

optimizeGallery();