import express from "express";
import { prisma } from "../lib/prisma.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from "uuid";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import https from "https";
import http from "http";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary Config:", cloudinary.config());

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
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      include: { files: true },
    });
    res.render("dashboard", { user: req.user, folders });
  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
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
router.post(
  "/folders/:id/upload",
  ensureAuthenticated,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        console.error("MULTER/CLOUDINARY UPLOAD ERROR:");
        console.dir(err, { depth: null });
        return res
          .status(500)
          .send(JSON.stringify(err, Object.getOwnPropertyNames(err)));
      }
      next();
    });
  },
  async (req, res) => {
    try {
      console.log("========== UPLOAD ==========");
      console.dir(req.file, { depth: null });

      if (!req.file) {
        return res.status(400).send("No file received");
      }

      const folderId = parseInt(req.params.id);

      await prisma.file.create({
        data: {
          name: req.file.originalname,
          size: req.file.size,
          path: req.file.path,
          userId: req.user.id,
          folderId,
        },
      });

      console.log("File saved to database");

      res.redirect("/dashboard");
    } catch (err) {
      console.error("UPLOAD ERROR:");
      console.dir(err, { depth: null });

      res
        .status(500)
        .send(JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
  },
);

// File detail page
router.get("/files/:id", ensureAuthenticated, async (req, res) => {
  const fileId = parseInt(req.params.id);
  const file = await prisma.file.findUnique({ where: { id: fileId } });
  res.render("file", { file });
});

//Download
router.get("/files/:id/download", ensureAuthenticated, async (req, res) => {
  const fileId = parseInt(req.params.id);
  const file = await prisma.file.findUnique({ where: { id: fileId } });

  res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
  res.setHeader("Content-Type", "application/octet-stream");

  const protocol = file.path.startsWith("https") ? https : http;
  protocol.get(file.path, (stream) => {
    stream.pipe(res);
  });
});

router.post("/folders/:id/share", ensureAuthenticated, async (req, res) => {
  const folderId = parseInt(req.params.id);
  const { duration } = req.body;

  const days = parseInt(duration);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  const shareLink = await prisma.shareLink.create({
    data: {
      uuid: uuidv4(),
      folderId,
      expiresAt,
    },
  });

  res.send(`Share link: http://localhost:3000/share/${shareLink.uuid}`);
});

router.get("/share/:uuid", async (req, res) => {
  const { uuid } = req.params;

  const link = await prisma.shareLink.findUnique({
    where: { uuid },
    include: {
      folder: {
        include: { files: true },
      },
    },
  });

  if (!link) return res.send("Invalid link");

  if (new Date() > link.expiresAt) {
    return res.send("Link expired");
  }

  res.render("sharedFolder", { folder: link.folder });
});

export default router;
