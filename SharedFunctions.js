import { bucket } from './firebaseConfig.js';

// Function to upload image to Firebase Storage
export const uploadImageToFirebase = async (folderType , id, imageType , image ) => {
    try {
      const blob = bucket.file(`${folderType}/${id}/${imageType}_pics/${Date.now()}_${image.originalname}`);
      const blobStream = blob.createWriteStream({ resumable: false });
  
      return new Promise((resolve, reject) => {
        blobStream.on('error', (err) => {
          reject(err);
        });
  
        blobStream.on('finish', async () => {
          const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(blob.name)}?alt=media`;
          resolve(publicUrl);
        });
  
        blobStream.end(image.buffer);
      });
    } catch (error) {
      throw new Error("Failed to upload image to Firebase Storage");
    }
  };
  
  // Function to delete image from Firebase Storage
  export const deleteImageFromFirebase = async (imageUrl) => {
    try {
      const imagePath = decodeURIComponent(imageUrl).split(`${bucket.name}/o/`)[1].split('?')[0];
      const imageFile = bucket.file(imagePath);
      await imageFile.delete();
    } catch (error) {
      throw new Error("Failed to delete image from Firebase Storage");
    }
  };