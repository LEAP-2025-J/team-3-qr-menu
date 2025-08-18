import multer from "multer";

const storage = multer.memoryStorage();

// Simple multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export { upload }; 