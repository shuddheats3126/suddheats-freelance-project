const fs = require('fs');
const path = require('path');

const target1 = 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267215/WhatsApp_Image_2026-09-21_at_2.51.41_PM_1.jpg';
const target2 = 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267215/WhatsApp_Image_2026-09-21_at_2.51.41_PM_1.jpg';
const replacement = 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267215/WhatsApp_Image_2026-09-21_at_2.51.41_PM_1.jpg';

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === '.next') continue;
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else {
      if (['.js', '.ts', '.tsx', '.py', '.json'].includes(path.extname(fullPath))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(target1) || content.includes(target2)) {
          const newContent = content.split(target1).join(replacement).split(target2).join(replacement);
          fs.writeFileSync(fullPath, newContent, 'utf8');
          console.log('Updated:', fullPath);
        }
      }
    }
  }
}

processDirectory(__dirname);
