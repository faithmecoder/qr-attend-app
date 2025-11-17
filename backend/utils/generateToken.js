// backend/utils/generateToken.js
import jwt from "jsonwebtoken";

/**
 * Generates a JWT and sets it as a Secure, HttpOnly cookie
 */
const generateAndSetToken = (res, id, role) => {
  const token = jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,           // REQUIRED for Chrome & Android Chrome
    sameSite: "None",       // REQUIRED when frontend != backend domain
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return token;
};

export default generateAndSetToken;
