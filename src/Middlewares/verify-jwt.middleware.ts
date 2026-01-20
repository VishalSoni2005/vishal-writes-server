import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: string;
    }
  }
}

export const verifyJWT = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
      return res.status(401).json({ 
        message: "Unauthorized", 
        note: "No token provided" 
      });
    }

    // Verify token and extract payload
    const decoded = jwt.verify(token, process.env.SECRET_KEY as string) as JwtPayload & { id: string };
    
    // Attach user ID to request object
    req.user = decoded.id;
    
    next();
  } catch (error: any) {
    console.error("JWT Verification Error:", error);
    
    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Unauthorized",
        note: "Token has expired"
      });
    }
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Unauthorized",
        note: "Invalid token"
      });
    }

    return res.status(401).json({
      message: "Unauthorized",
      note: "Invalid token provided at verifyJWT"
    });
  }
};
// import jwt from "jsonwebtoken";

// export const verifyJWT = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//       return res.status(401).json({
//         message: "Unauthorized",
//         note: "No Authorization header found"
//       });
//     }
//     // Extract the token from the authorization header (bearer token)
//     const token = authHeader.split(" ")[1];
//     if (!token) {
//       return res
//         .status(401)
//         .json({ message: "Unauthorized", note: "No token provided" });
//     }
//     const decoded = jwt.verify(token, process.env.SECRET_KEY);
//     req.user = decoded.id; //todo: note
//     next();
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(401)
//       .json({
//         message: "Unauthorized",
//         note: "Invalid token provided at verifyJWT"
//       });
//   }
// };
