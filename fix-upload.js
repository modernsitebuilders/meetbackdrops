const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

cloudinary.uploader.upload('/Users/davidmiles/Downloads/bright-bookshelves-18.png', {
  public_id: 'bookshelves-bright-01',
  overwrite: true
}, (error, result) => {
  if (error) console.error(error);
  else console.log('SUCCESS:', result.secure_url);
});