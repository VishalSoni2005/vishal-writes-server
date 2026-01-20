import { Request, Response } from "express";
import User from "../Schema/user.model";

interface GetProfileRequestBody {
  username?: string;
}

interface AuthRequest extends Request {
  user?: string; // Assuming you might need auth info
}

// Define a type for the user data returned (adjust based on your User model)
interface UserProfileData {
  _id?: any;
  personal_info?: {
    username?: string;
    fullname?: string;
    email?: string;
    profile_img?: string;
    // Add other personal_info fields
  };
  // Add other fields from your User model
  [key: string]: any;
}

export const getProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const { username }: GetProfileRequestBody = req.body;

    if (!username) {
      return res.status(400).json({
        message: "Username is required"
      });
    }

    const user: UserProfileData | null = await User.findOne({
      "personal_info.username": username
    }).select("-personal_info.password -google_auth -updatedAt -blogs");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (err: any) {
    console.error("Error in getProfile:", err);
    return res.status(500).json({
      message: "Internal server error",
      note: "Error in getting user profile"
    });
  }
};
// import User from "../Schema/user.model.js";

// export const getProfile = async (req, res) => {
//   try {
//     const { username } = req.body;

//     if (!username) {
//       return res.status(400).json({
//         message: "Username is required"
//       });
//     }

//     const user = await User.findOne({
//       "personal_info.username": username
//     }).select("-personal_info.password -google_auth -updatedAt -blogs");

//     return res.status(200).json(user);
//   } catch (err) {
//     return res.status(500).json({
//       message: "Internal server error",
//       note: "Error in getting user profile"
//     });
//   }
// };
