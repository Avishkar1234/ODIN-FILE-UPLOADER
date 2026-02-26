import express from "express";
import { prisma } from "../lib/prisma.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

// View dashboard with folders
router.get("/dashboard", ensureAuthenticated, async (req, res) => {
  const folders = await prisma.folder.findMany({
    where: { userId: req.user.id },
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

export default router;