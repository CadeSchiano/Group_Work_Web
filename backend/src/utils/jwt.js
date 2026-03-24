import jwt from "jsonwebtoken";

export const signToken = (user) =>
  jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
