import Blog from "../Schema/Blog.js";
import User from "../Schema/User.js";
import Notification from "../Schema/Notification.js";

export const likeBlog = async (req, res) => {
  try {
    const user_id = req.user;
    const { _id, isLikedByUser } = req.body;

    let increment = isLikedByUser ? -1 : 1;

    const updatedBlog = await Blog.findByIdAndUpdate(
      { _id },
      { $in: { "activity.total_likes": increment } },
      { new: true }
    );
    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (!isLikedByUser) {
      const like = new Notification({
        type: "like",
        blog: _id,
        notification_for: updatedBlog.author,
        user: user_id
      });
      like.save().then(() => {
        return res.status(200).json({ liked_by_user: true });
      });
    } else {
      await Notification.findOneAndDelete({
        type: "like",
        blog: _id,
        notification_for: updatedBlog.author,
        user: user_id
      }).then((data) => {
        return res.status(200).json({ liked_by_user: false });
      });
    }
  } catch (error) {
    console.error("Error liking blog:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const isLikedByUser = async (req, res) => {
  try {
    const user_id = req.user;
    const { _id } = req.body;

    const isLiked = await Notification.exists({
      // return null if no doc found or 1 if doc found it return an object
      user: user_id,
      type: "like",
      blog: _id
    });

    return res.status(200).json({ isLiked });
  } catch (error) {
    console.error("Error checking like status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
