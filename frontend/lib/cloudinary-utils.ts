import cloudinary from './cloudinary';

export const getCloudinaryUrl = (publicId: string, options: {
  width?: number;
  height?: number;
  crop?: string;
  quality?: number;
} = {}) => {
  const { width, height, crop = 'fill', quality = 'auto' } = options;
  
  const transformations = [];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`c_${crop}`);
  transformations.push(`q_${quality}`);
  
  const transformationString = transformations.join(',');
  
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transformationString}/${publicId}`;
};

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'menu_images'); // You'll need to create this upload preset in Cloudinary
  
  const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  
  const data = await response.json();
  return data.public_id;
}; 