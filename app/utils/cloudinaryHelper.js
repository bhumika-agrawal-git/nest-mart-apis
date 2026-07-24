import cloudinary from "../configs/cloudinaryConfigs.js";
import streamifier from "streamifier";

/**
 * Upload Single Image
 */
export const uploadSingleImage = (
  file,
  folder = "uploads"
) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,

        resource_type: "image",

        format: "webp",

        transformation: [
          {
            fetch_format: "webp",
            quality: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

/**
 * Upload Multiple Images
 */

export const uploadMultipleImages = async (
  files,
  folder = "uploads"
) => {
  const images = [];

  for (const file of files) {
    const image = await uploadSingleImage(file, folder);

    images.push({
      url: image.secure_url,
      public_id: image.public_id,
    });
  }

  return images;
};

/**
 * Delete Image
 */

export const deleteImage = async (public_id) => {
  if (!public_id) return;

  return await cloudinary.uploader.destroy(public_id);
};