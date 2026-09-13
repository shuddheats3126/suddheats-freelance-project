const sharp = require('sharp');

async function createSplash() {
  const inputFile = 'C:\\Users\\RANJIT PATRA\\.gemini\\antigravity-ide\\brain\\f778e761-0ed0-4c64-b3f5-29fd1219e85d\\.user_uploaded\\media_1789318726710.png';
  const outputFile = 'public/icons/splash-icon-512x512.png';
  
  // Create a 512x512 transparent canvas
  // We want the actual logo to be around 320px wide so it fits inside the Android circular mask (diameter ~ 330px out of 512px)
  
  // 1. Process the input: trim empty space, and if it has a white bg, maybe the user wants it transparent, 
  // but if it's already transparent, this just resizes it.
  const processedImageBuffer = await sharp(inputFile)
    .trim({ threshold: 240 }) // Removes background if it's plain white/transparent
    .resize(320, 320, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent padding inside the 320 box
    })
    .toBuffer();

  // 2. Composite the 320x320 image onto a 512x512 transparent background
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    }
  })
    .composite([{ input: processedImageBuffer, gravity: 'center' }])
    .png()
    .toFile(outputFile);
    
  console.log('Splash icon generated successfully, sized for Android mask');
}

createSplash().catch(console.error);
