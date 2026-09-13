const sharp = require('sharp');

async function createSplash() {
  const inputFile = 'public/images/logo.png';
  const outputFile = 'public/icons/splash-icon-512x512.png';
  
  // Create a 512x512 transparent canvas
  // Make the actual logo larger (mid-size) by resizing to 450x450
  
  // 1. Process the input: trim empty space, and if it has a white bg, maybe the user wants it transparent, 
  // but if it's already transparent, this just resizes it.
  const processedImageBuffer = await sharp(inputFile)
    .trim({ threshold: 240 }) // Removes background if it's plain white/transparent
    .resize(450, 450, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent padding inside the 450 box
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
