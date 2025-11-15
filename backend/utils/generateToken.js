// backend/utils/generateToken.js
import jwt from "jsonwebtoken";

/**
 * generateAndSetToken(res, id, role)
 * - Signs JWT with payload { id, role }
 * - Sets cookie named 'token' (HttpOnly)
 */
const generateAndSetToken = (res, id, role) => {
  const token = jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  // cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only HTTPS
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };

  res.cookie("token", token, cookieOptions);
  return token;
};

export default generateAndSetToken;
