import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Config:", cloudinary.config());

const testFilePath = path.join(__dirname, "test-image.png");

cloudinary.uploader.upload(
  testFilePath,
  { folder: "drive-clone", resource_type: "auto" },
  (err, result) => {
    if (err) {
      console.error("UPLOAD ERROR:");
      console.dir(err, { depth: null });
    } else {
      console.log("UPLOAD SUCCESS:", result.secure_url);
    }
  },
);
