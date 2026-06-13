import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

cloudinary.api
  .ping()
  .then((result) => {
    console.log("PING SUCCESS");
    console.log(result);
  })
  .catch((err) => {
    console.log("PING FAILED");
    console.dir(err, { depth: null });
  });

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
console.log("Secret Exists:", process.env.CLOUDINARY_API_SECRET ? "YES" : "NO");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "drive-clone",
    resource_type: "auto",
  }),
});

const upload = multer({ storage });

export default upload;
