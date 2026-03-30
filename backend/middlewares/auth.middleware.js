import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    // read the token from the header
    const authHeader = req.headers.authorization;
    console.log(`auth.middleware: ${req.method} ${req.originalUrl} - Authorization:`, authHeader);

    //check if token exists and is in the correct format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Extract token from header. Handle malformed headers like
    // "Authorization: Bearer <token>" or extra spaces.
    let token = null;
    if (authHeader.includes("Bearer ")) {
      // prefer the substring after the first occurrence of "Bearer "
      token = authHeader.split("Bearer ")[1];
    }
    // fallback: take last whitespace-separated segment
    if (!token) {
      const parts = authHeader.split(/\s+/).filter(Boolean);
      token = parts[parts.length - 1];
    }
    if (typeof token === 'string') token = token.trim();

    // Verify token and return user info
    if (!token) {
      console.error("auth.middleware: no token after parsing header");
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("auth.middleware decoded:", decoded);
    // Attach user info to request
    req.user = decoded;

    next();

  } catch (error) {
    console.error("auth.middleware error:", error.message || error);
    // More specific error responses for common JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(401).json({ message: 'Authentication failed' });
  }
};
