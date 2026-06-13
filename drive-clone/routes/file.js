import express from "express";
import { prisma } from "../lib/prisma.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";
import https from "https";
import http from "http";

const router = express.Router();

// File Details
router.get("/files/:id", ensureAuthenticated, async (req, res) => {
  const fileId = parseInt(req.params.id);

  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      userId: req.user.id,
    },
  });

  if (!file) {
    return res.send("File not found");
  }

  res.render("fileDetails", { file });
});

// Download File
router.get("/files/:id/download", ensureAuthenticated, async (req, res) => {
  const fileId = parseInt(req.params.id);

  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      userId: req.user.id,
    },
  });

  if (!file) {
    return res.send("File not found");
  }

  res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);

  const protocol = file.path.startsWith("https") ? https : http;

  protocol.get(file.path, (stream) => {
    stream.pipe(res);
  });
});

export default router;
