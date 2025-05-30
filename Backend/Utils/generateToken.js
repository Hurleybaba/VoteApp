import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "60m",
  });

  // Set the token in a cookie (optional, if you want to use cookies for authentication)

  return token;
};

export default generateToken;
