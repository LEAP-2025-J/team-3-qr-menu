import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Cloudinary тохиргоо
cloudinary.config({
  cloud_name: process.env["CLOUDINARY_CLOUD_NAME"] || "",
  api_key: process.env["CLOUDINARY_API_KEY"] || "",
  api_secret: process.env["CLOUDINARY_API_SECRET"] || "",
});

export default cloudinary;

// Type definitions
interface UploadResult {
  success: boolean;
  url?: string;
  public_id?: string;
  error?: string;
  result?: any;
}

// Upload image to Cloudinary
export const uploadToCloudinary = async (
  filePath: string,
  folder: string = "menu"
): Promise<UploadResult> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: "auto",
      transformation: [
        { width: 800, height: 800, crop: "fill" },
        { quality: "auto" },
      ],
    });

    // Upload дараа local файлыг устгах
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    // Алдаа гарвал local файлыг устгах
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: "Зураг upload хийхэд алдаа гарлаа",
    };
  }
};

// Upload image from memory buffer to Cloudinary
export const uploadBufferToCloudinary = async (
  fileBuffer: Buffer,
  originalname: string,
  folder: string = "menu"
): Promise<UploadResult> => {
  try {
    // Convert buffer to base64 string for Cloudinary
    const base64String = `data:image/jpeg;base64,${fileBuffer.toString(
      "base64"
    )}`;

    const result = await cloudinary.uploader.upload(base64String, {
      folder: folder,
      resource_type: "auto",
      transformation: [
        { width: 800, height: 800, crop: "fill" },
        { quality: "auto" },
      ],
    });

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary buffer upload error:", error);
    return {
      success: false,
      error: "Зураг upload хийхэд алдаа гарлаа",
    };
  }
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (
  publicId: string
): Promise<UploadResult> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: true,
      result: result,
    };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return {
      success: false,
      error: "Зураг устгахад алдаа гарлаа",
    };
  }
};
