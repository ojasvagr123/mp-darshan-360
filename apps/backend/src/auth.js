import jwt from "jsonwebtoken";
import { prisma } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

export function createToken(user) {
  return jwt.sign(
    {
      email: user.email,
      name: user.name,
      role: user.role,
      userId: user.id,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Login required." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      return res.status(401).json({ message: "Invalid user." });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}
