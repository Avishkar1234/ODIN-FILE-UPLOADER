import "./config/env.js";
import express from "express";
import session from "express-session";
import passport from "passport";
import "./config/passport.js";
import connectPgSimple from "connect-pg-simple";
import authRoutes from "./routes/auth.js";
import folderRoutes from "./routes/folder.js";
import fileRoutes from "./routes/file.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PgStore = connectPgSimple(session);

const candidateViews = [
  path.join(process.cwd(), "views"),
  path.join(process.cwd(), "drive-clone", "views"),
  path.join(__dirname, "views"),
];
const viewsPath =
  candidateViews.find((p) => fs.existsSync(p)) || candidateViews[0];

const candidatePublic = [
  path.join(process.cwd(), "public"),
  path.join(process.cwd(), "drive-clone", "public"),
  path.join(__dirname, "public"),
];
const publicPath =
  candidatePublic.find((p) => fs.existsSync(p)) || candidatePublic[0];

console.log("Resolved viewsPath:", viewsPath);
console.log("Resolved publicPath:", publicPath);

app.set("view engine", "ejs");
app.set("views", viewsPath);

app.use(express.urlencoded({ extended: false }));

app.use(express.static(publicPath));

app.use(
  session({
    store: new PgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true, // auto-creates session table
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
    proxy: true,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.use("/", authRoutes);
app.use("/", folderRoutes);
app.use("/", fileRoutes);

// Only listen locally; Vercel uses the exported app as a serverless function
if (process.env.VERCEL !== "1") {
  app.listen(3000, () => {
    console.log("Server started on http://localhost:3000");
  });
}

export default app;
