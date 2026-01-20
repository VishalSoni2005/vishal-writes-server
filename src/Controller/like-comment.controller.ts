import { Request, Response } from "express";
import Blog from "../Schema/blog.model";
import Notification from "../Schema/notification.model";

interface LikeBlogRequestBody {
  _id: string;
  isLikedByUser: boolean;
}

interface CheckLikeRequestBody {
  _id: string;
}

interface AuthRequest extends Request {
  user?: string;
}

export const likeBlog = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user_id = req.user;
    const { _id, isLikedByUser }: LikeBlogRequestBody = req.body;

    // Validate user_id
    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let increment = isLikedByUser ? -1 : 1;

    // ISSUE 1: findByIdAndUpdate expects _id as first parameter, not an object
    const updatedBlog = await Blog.findByIdAndUpdate(
      _id,  // Changed from { _id } to _id
      { $inc: { "activity.total_likes": increment } },
      { new: true }
    );
    
    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (!isLikedByUser) {
      // Create a like notification
      const like = new Notification({
        type: "like",
        blog: _id,
        notification_for: updatedBlog.author,
        user: user_id
      });
      
      await like.save();
      return res.status(200).json({ liked_by_user: true });
      
    } else {
      // Remove the like notification
      await Notification.findOneAndDelete({
        type: "like",
        blog: _id,
        notification_for: updatedBlog.author,
        user: user_id
      });
      return res.status(200).json({ liked_by_user: false });
    }
  } catch (error: any) {
    console.error("Error liking blog:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const isLikedByUser = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user_id = req.user;
    const { _id }: CheckLikeRequestBody = req.body;

    // Validate user_id
    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const isLiked = await Notification.exists({
      user: user_id,
      type: "like",
      blog: _id
    });

    return res.status(200).json({ isLiked: !!isLiked });
  } catch (error: any) {
    console.error("Error checking like status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// import Blog from "../Schema/blog.model.js";
// import User from "../Schema/user.model.js";
// import Notification from "../Schema/notification.model.js";
// interface LikeBlogRequestBody {
//   _id: string;
//   isLikedByUser: boolean;
// }

// interface CheckLikeRequestBody {
//   _id: string;
// }

// interface AuthRequest extends Request {
//   user?: string;
// }

// export const likeBlog = async (req: AuthRequest, res: Response): Promise<any> => {
//   try {
//     const user_id = req.user;
//     const { _id, isLikedByUser }: LikeBlogRequestBody = req.body;

//     let increment = isLikedByUser ? -1 : 1;

//     // Fixed: Changed $in to $inc (increment operator)
//     const updatedBlog = await Blog.findByIdAndUpdate(
//       { _id },
//       { $inc: { "activity.total_likes": increment } },
//       { new: true }
//     );
    
//     if (!updatedBlog) {
//       return res.status(404).json({ message: "Blog not found" });
//     }

//     if (!isLikedByUser) {
//       const like = new Notification({
//         type: "like",
//         blog: _id,
//         notification_for: updatedBlog.author,
//         user: user_id
//       });
      
//       like.save().then(() => {
//         return res.status(200).json({ liked_by_user: true });
//       });
//     } else {
//       await Notification.findOneAndDelete({
//         type: "like",
//         blog: _id,
//         notification_for: updatedBlog.author,
//         user: user_id
//       }).then((data) => {
//         return res.status(200).json({ liked_by_user: false });
//       });
//     }
//   } catch (error: any) {
//     console.error("Error liking blog:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// export const isLikedByUser = async (req: AuthRequest, res: Response): Promise<any> => {
//   try {
//     const user_id = req.user;
//     const { _id }: CheckLikeRequestBody = req.body;

//     const isLiked = await Notification.exists({
//       user: user_id,
//       type: "like",
//       blog: _id
//     });

//     return res.status(200).json({ isLiked: !!isLiked });
//   } catch (error: any) {
//     console.error("Error checking like status:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// // Utility function to validate file types


// // export const likeBlog = async (req , res) => {
// //   try {
// //     const user_id = req.user;
// //     const { _id, isLikedByUser } = req.body;

// //     let increment = isLikedByUser ? -1 : 1;

// //     const updatedBlog = await Blog.findByIdAndUpdate(
// //       { _id },
// //       { $in: { "activity.total_likes": increment } },
// //       { new: true }
// //     );
// //     if (!updatedBlog) {
// //       return res.status(404).json({ message: "Blog not found" });
// //     }

// //     if (!isLikedByUser) {
// //       const like = new Notification({
// //         type: "like",
// //         blog: _id,
// //         notification_for: updatedBlog.author,
// //         user: user_id
// //       });
// //       like.save().then(() => {
// //         return res.status(200).json({ liked_by_user: true });
// //       });
// //     } else {
// //       await Notification.findOneAndDelete({
// //         type: "like",
// //         blog: _id,
// //         notification_for: updatedBlog.author,
// //         user: user_id
// //       }).then((data) => {
// //         return res.status(200).json({ liked_by_user: false });
// //       });
// //     }
// //   } catch (error) {
// //     console.error("Error liking blog:", error);
// //     res.status(500).json({ message: "Internal server error" });
// //   }
// // };

// // export const isLikedByUser = async (req, res) => {
// //   try {
// //     const user_id = req.user;
// //     const { _id } = req.body;

// //     const isLiked = await Notification.exists({
// //       // return null if no doc found or 1 if doc found it return an object
// //       user: user_id,
// //       type: "like",
// //       blog: _id
// //     });

// //     return res.status(200).json({ isLiked });
// //   } catch (error) {
// //     console.error("Error checking like status:", error);
// //     res.status(500).json({ message: "Internal server error" });
// //   }
// // };
