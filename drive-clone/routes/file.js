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

export default router;