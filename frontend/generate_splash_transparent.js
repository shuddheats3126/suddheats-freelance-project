const sharp = require('sharp');

async function createSplash() {
  const inputFile = 'public/images/logo.png';
  const outputFile = 'public/icons/splash-icon-600x600.png';
  
  // Create a 600x600 transparent canvas
  // Make the actual logo larger (mid-size) by resizing to 600x600
  
  // 1. Process the input: trim empty space, and if it has a white bg, maybe the user wants it transparent, 
  // but if it's already transparent, this just resizes it.
  const processedImageBuffer = await sharp(inputFile)
    .trim({ threshold: 240 }) // Removes background if it's plain white/transparent
    .resize(600, 600, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent padding inside the 600 box
    })
    .toBuffer();

  // 2. Composite the 600x600 image onto a 600x600 transparent background
  await sharp({
    create: {
      width: 600,
      height: 600,
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
