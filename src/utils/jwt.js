import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const JWT_SECRET = process.env.JWT_SECRET;

export function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
