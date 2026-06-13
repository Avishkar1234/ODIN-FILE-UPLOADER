// config/passport.js
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        console.log("🔵 LOGIN ATTEMPT:", email);

        const user = await prisma.user.findUnique({
          where: { email },
        });

        console.log("🟡 USER FOUND:", user);

        if (!user) {
          console.log("❌ No user found");
          return done(null, false);
        }

        const match = await bcrypt.compare(password, user.password);

        console.log("🟢 PASSWORD MATCH:", match);

        if (!match) {
          console.log("❌ Wrong password");
          return done(null, false);
        }

        console.log("✅ LOGIN SUCCESS");

        return done(null, user);
      } catch (err) {
        console.log("🔥 ERROR:", err);
        return done(err);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

console.log("Strategy running");

export default passport;
