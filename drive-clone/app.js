import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import "./config/passport.js";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { prisma } from "./lib/prisma.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

// View engine
app.set("view engine", "ejs");

// Middleware
app.use(express.urlencoded({ extended: false }));

// Session store configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7 days
    store: new PrismaSessionStore(prisma, {
      sessionModelName: "Session", // must match your Prisma model
      checkPeriod: 2 * 60 * 1000, // 2 minutes
      dbRecordIdIsSessionId: false, // use 'id' field as session id
      dbRecordIdFunction: undefined, // optional
    }),
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Temporary test route
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

// Auth routes
app.use("/", authRoutes);

// Start server
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});