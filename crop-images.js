const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const productsDir = `C:\\Users\\RANJIT PATRA\\Downloads\\New folder\\naya 2.0\\freelance-project-main\\frontend\\public\\images\\products`;

async function cropImages() {
    console.log('='.repeat(60));
    console.log('Cropping Product Images - Zoomed Format');
    console.log('='.repeat(60));

    const files = glob.sync(path.join(productsDir, '*.jpeg'));

    for (const file of files) {
        try {
            const filename = path.basename(file);
            console.log(`\n[${filename}]`);

            // Get image metadata
            const metadata = await sharp(file).metadata();
            console.log(`  Original: ${metadata.width}x${metadata.height}`);

            // Crop to square from center
            const size = Math.min(metadata.width, metadata.height);
            const left = Math.floor((metadata.width - size) / 2);
            const top = Math.floor((metadata.height - size) / 2);

            // Process: crop to square, then resize to 800x800
            await sharp(file)
                .extract({ left, top, width: size, height: size })
                .resize(800, 800, { fit: 'cover', position: 'center' })
                .jpeg({ quality: 95, progressive: true })
                .toFile(file + '.tmp');

            // Replace original
            fs.renameSync(file + '.tmp', file);

            const stats = fs.statSync(file);
            console.log(`  Cropped: 800x800`);
            console.log(`  Size: ${(stats.size / 1024).toFixed(0)}KB ✓`);

        } catch (err) {
            console.log(`  ERROR: ${err.message}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('Done! All product images cropped and optimized.');
    console.log('='.repeat(60));
}

cropImages().catch(console.error);

