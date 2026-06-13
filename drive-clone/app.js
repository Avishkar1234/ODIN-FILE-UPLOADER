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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PgStore = connectPgSimple(session);

const viewsPath = path.join(process.cwd(), "views");
const publicPath = path.join(process.cwd(), "public");

console.log("__dirname:", __dirname);
console.log("cwd:", process.cwd());
console.log("viewsPath:", viewsPath);

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
