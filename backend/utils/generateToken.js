// backend/utils/generateToken.js
import jwt from "jsonwebtoken";

const generateAndSetToken = (res, id, role) => {
  const token = jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  // 🚀 Recommended Change: Check if running in a secure context (not local development)
  // The 'secure' flag will be true on Render/Vercel (HTTPS)
  const isSecure = process.env.NODE_ENV !== "development";

  const cookieOptions = {
    httpOnly: true,
    // CRITICAL: Must be TRUE for production/Render (HTTPS)
    secure: isSecure,
    // CRITICAL: Must be 'None' when secure: true and cross-site (Vercel to Render)
    sameSite: isSecure ? "None" : "Lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };

  // Log cookie settings for debugging in Render logs
  console.log(`Setting token cookie with options: ${JSON.stringify(cookieOptions)}`);

  res.cookie("token", token, cookieOptions);
  return token;
};

export default generateAndSetToken;