// backend/utils/generateToken.js
import jwt from "jsonwebtoken";

/**
 * generateAndSetToken(res, id, role)
 * Signs JWT and sets cookie named 'token'
 */
const generateAndSetToken = (res, id, role) => {
  const token = jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  const isProd = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true,
    secure: isProd,                     // only secure in production
    sameSite: isProd ? "None" : "Lax",  // None for cross-site in prod, Lax for dev
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };

  res.cookie("token", token, cookieOptions);
  return token;
};

export default generateAndSetToken;
