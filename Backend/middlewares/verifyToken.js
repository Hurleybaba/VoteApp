import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  // const token = req.headers["authorization"]?.split(" ")[1];

  // Extract token from the Authorization header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.userId = decoded.userId; // Attach userId to the request object
    next(); // Proceed to the next middleware or route handler
  });
};
