const sharp = require('sharp');

async function createIcon() {
  const inputFile = 'C:\\Users\\RANJIT PATRA\\.gemini\\antigravity-ide\\brain\\f778e761-0ed0-4c64-b3f5-29fd1219e85d\\.user_uploaded\\media_1789318726710.png';
  const outputFile = 'public/icons/icon-192x192.png';
  
  const processedImageBuffer = await sharp(inputFile)
    .trim({ threshold: 240 })
    .resize(140, 140, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .toBuffer();

  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    }
  })
    .composite([{ input: processedImageBuffer, gravity: 'center' }])
    .png()
    .toFile(outputFile);
    
  console.log('App icon 192x192 generated successfully');
}

createIcon().catch(console.error);
