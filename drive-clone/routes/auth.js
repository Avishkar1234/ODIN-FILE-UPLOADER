// routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import passport from "passport";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

// Registration page
router.get("/register", (req, res) => {
  res.render("register");
});

// Register user
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.send("User already exists. Please login.");

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    res.redirect("/login");
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).send("Server error. Try again later.");
  }
});

// Login page
router.get("/login", (req, res) => {
  res.render("login");
});

// Login user
router.post(
  "/login",
  (req, res, next) => {
    console.log("HIT LOGIN ROUTE");
    next();
  },
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  }),
);

// // Dashboard route (protected)
// router.get("/dashboard", (req, res) => {
//   if (!req.isAuthenticated()) return res.redirect("/login");
//   res.send(`Welcome ${req.user.email}`);
// });

// Logout
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/login");
  });
});

export default router;
