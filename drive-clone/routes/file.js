import express from "express";
import upload from "../config/multer.js";
import { prisma } from "../lib/prisma.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/folder/:id/upload",
    ensureAuthenticated,
    upload.single("file"),
    async (req, res) => {
        const folderId = parseInt(req.params.id);

        await prisma.file.create({
            data: {
                name: req.file.originalname,
                size: req.file.size,
                path: req.file.filename,
                folderId,
                userId: req.user.id,
            },
        });

        res.redirect("/dashboard");
    }
);

// View file details
router.get("/files/:id", ensureAuthenticated, async (req, res) => {
    const fileId = parseInt(req.params.id);

    const file = await prisma.file.findFirst({
        where: {
            id: fileId,
            userId: req.user.id,
        },
    });

    if(!file) return res.send("File not found");

    res.render("fileDetails", { file });
})

// Download file
router.get("/files/:id/download", ensureAuthenticated, async (req, res) => {
    const fileId = parseInt(req.params.id);

    const file = await prisma.file.findFirst({
        where: {
            id: fileId,
            userId: req.user.id,
        },
    });

    if (!file) return res.send("File not found");

    res.download(`uploads/$(file.path)`, file.name);
});

export default router;