const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: __dirname + '/.env' });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async () => {
    try {
        const result = await cloudinary.uploader.upload(__dirname + '/../Images/logo-shuddheats.png', {
            folder: 'shuddheats/assets',
            public_id: 'logo_full_spelling_new',
            overwrite: true
        });
        console.log('UPLOAD SUCCESSFUL:');
        console.log(result.secure_url);
    } catch (error) {
        console.error('UPLOAD FAILED:', error);
    }
};

uploadImage();
