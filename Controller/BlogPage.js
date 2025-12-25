import { response } from "express";
import Blog from "../Schema/Blog.js";
import User from "../Schema/User.js";

export const BlogPage = async (req, res) => {
  try {
    const { blog_id, draft, mode } = req.body;
    const incrementVal = mode !== "edit" ? 1 : 0;

    const blog = await Blog.findOneAndUpdate(
      { blog_id },
      { $inc: { "activity.total_reads": incrementVal } }, // to increase author totol read count
      { new: true }
    )
      .populate(
        "author",
        "personal_info.fullname personal_info.username personal_info.profile_img"
      )
      .select("title des content banner activity publishedAt blog_id tags");

    // response from upper request will ve :
    // { activity, _id, blog_id, tags, title, banner, content: [], des , author: {personal_info: {fullname, username, profile_pic}, _id}, publishedAt}
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    await User.findOneAndUpdate(
      { "personal_info.username": blog.author.personal_info.username },
      { $inc: { "account_info.total_read": incrementVal } }
    );

    if(blog.draft && !draft) {
      return response.status(404).json({ message: "Blog not found can access draft blog" });
    }

    return res.status(200).json({ blog });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};
