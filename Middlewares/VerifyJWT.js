import jwt from "jsonwebtoken";

export const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        message: "Unauthorized",
        note: "No Authorization header found"
      });
    }
    // Extract the token from the authorization header (bearer token)
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized", note: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded.id; //todo: note
    next();
  } catch (error) {
    console.error(error);
    return res
      .status(401)
      .json({
        message: "Unauthorized",
        note: "Invalid token provided at verifyJWT"
      });
  }
};
