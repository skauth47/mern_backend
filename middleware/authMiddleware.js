import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    // GET TOKEN FROM HEADER
    const authHeader = req.headers.authorization;

    // CHECK IF TOKEN EXISTS
    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    // REMOVE "Bearer "
    const token = authHeader.split(" ")[1];

    // VERIFY TOKEN
    const decoded = jwt.verify(token, "mysecretkey");

    // SAVE USER INFO IN REQUEST
    req.user = decoded;

    // MOVE TO NEXT FUNCTION
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

export default authMiddleware;