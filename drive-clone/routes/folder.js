import express from "express";
import { prisma } from "../lib/prisma.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import https from "https";
import http from "http";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "drive-clone",
    resource_type: "auto", // supports any file type
  },
});

const upload = multer({ storage });

const router = express.Router();

// View dashboard with folders
router.get("/dashboard", ensureAuthenticated, async (req, res) => {
  const folders = await prisma.folder.findMany({
    where: { userId: req.user.id },
    include: { files: true },
  });
  res.render("dashboard", { user: req.user, folders });
});

// Create folder
router.post("/folders/create", ensureAuthenticated, async (req, res) => {
  const { name } = req.body;
  await prisma.folder.create({
    data: { name, userId: req.user.id },
  });
  res.redirect("/dashboard");
});

// Rename folder
router.post("/folders/:id/rename", ensureAuthenticated, async (req, res) => {
  const folderId = parseInt(req.params.id);
  const { name } = req.body;
  await prisma.folder.update({
    where: { id: folderId },
    data: { name },
  });
  res.redirect("/dashboard");
});

// Delete folder
router.post("/folders/:id/delete", ensureAuthenticated, async (req, res) => {
  const folderId = parseInt(req.params.id);
  await prisma.folder.delete({
    where: { id: folderId },
  });
  res.redirect("/dashboard");
});

// Upload file to folder
router.post("/folders/:id/upload", ensureAuthenticated, upload.single("file"), async (req, res) => {
  const folderId = parseInt(req.params.id);

  await prisma.file.create({
    data: {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path,        // Cloudinary URL
      userId: req.user.id,
      folderId,
    },
  });

  res.redirect("/dashboard");
});

// File detail page
router.get("/files/:id", ensureAuthenticated, async (req, res) => {
  const fileId = parseInt(req.params.id);
  const file = await prisma.file.findUnique({ where: { id: fileId } });
  res.render("file", { file });
});

//Download
router.get("/files/:id/download", ensureAuthenticated, async (req, res) => {
    const fileId = parseInt(req.params.id);
    const file = await prisma.file.findUnique({ where: { id: fileId }});

    res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
    res.setHeader("Content-Type", "application/octet-stream");

    const protocol = file.path.startsWith("https") ? https : http;
    protocol.get(file.path, (stream) => {
        stream.pipe(res);
    });
});

export default router;