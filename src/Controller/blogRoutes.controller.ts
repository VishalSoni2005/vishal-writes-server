import { Request, Response } from "express";
import Blog from "../Schema/blog.model";
import User from "../Schema/user.model";
import { nanoid } from "nanoid";

interface CreateBlogRequestBody {
  title?: string;
  des?: string;
  tags?: string[];
  banner?: string;
  content?: {
    blocks?: any[];
  };
  draft?: boolean;
  id?: string;
}

interface LatestBlogsRequestBody {
  page?: number;
}

interface SearchBlogsRequestBody {
  eliminate_blog?: string;
  query?: string;
  author?: string;
  category?: string;
  page?: number;
  limit?: number;
}

interface SearchBlogsCountRequestBody {
  author?: string;
  tag?: string;
  query?: string;
}

interface SearchUsersRequestBody {
  query?: string;
}

interface AuthRequest extends Request {
  user?: string;
}

export const CreateBlog = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const authId = req.user;
    if (!authId) {
      return res.status(401).json({
        message: "Unauthorized",
        note: "User authentication required"
      });
    }

    let { title, des, tags = [], banner, content, draft, id }: CreateBlogRequestBody = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Bad Request",
        note: "Title is required"
      });
    }

    if (!draft) {
      if (!des || !banner || !content?.blocks?.length || !tags?.length) {
        return res.status(400).json({
          message: "Bad Request",
          note: "Please fill all required fields"
        });
      }
    }

    if (!Array.isArray(tags)) tags = [];
    tags = tags.map((tag: string) => tag.toLowerCase());

    const blogId =
      id ||
      `${title
        .replace(/[^a-zA-Z0-9]/g, " ")
        .replace(/\s+/g, "-")
        .trim()}-${nanoid(8)}`;

    if (id) {
      const updatedBlog = await Blog.findOneAndUpdate(
        { blog_id: id },
        {
          $set: {
            title,
            des,
            tags,
            banner,
            content,
            draft: !!draft
          }
        },
        { new: true }
      );

      if (!updatedBlog) {
        return res.status(404).json({
          message: "Blog not found"
        });
      }

      return res.status(201).json({
        message: "Blog updated successfully",
        data: updatedBlog,
        id: updatedBlog.blog_id
      });
    }

    const newBlog = new Blog({
      blog_id: blogId,
      title,
      banner,
      des,
      content,
      tags,
      author: authId,
      draft: !!draft
    });

    await newBlog.save();

    const incrementVal = draft ? 0 : 1;

    await User.findByIdAndUpdate(authId, {
      $inc: { "account_info.total_posts": incrementVal },
      $push: { blogs: newBlog._id }
    });

    return res.status(201).json({
      message: "Blog created successfully",
      data: newBlog,
      id: newBlog.blog_id
    });
  } catch (error) {
    console.error("Error in CreateBlog:", error);
    return res.status(500).json({
      message: "Internal server error",
      note: "Error in Create Blog request"
    });
  }
};

export const latestBlogs = async (req: Request, res: Response): Promise<any> => {
  try {
    let maxLimit = 5;

    let { page }: LatestBlogsRequestBody = req.body;

    const blogData = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt -_id")
      .skip(((page || 1) - 1) * maxLimit)
      .limit(maxLimit);

    res.status(200).json({
      message: "Success",
      blogs: blogData
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      note: "Error in get latest blog request"
    });
  }
};

export const trendingBlogs = async (req: Request, res: Response): Promise<any> => {
  try {
    const blogs = await Blog.find({ draft: false })
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({
        "activity.total_read": -1,
        "activity.total_likes": -1,
        publishedAt: -1
      })
      .select("blog_id title publishedAt -_id")
      .limit(5);

    res.status(200).json({
      message: "Success",
      blogs
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      note: "Error in get latest blog request"
    });
  }
};

export const searchBlogs = async (req: Request, res: Response): Promise<any> => {
  try {
    let { eliminate_blog, query, author, category, page = 1, limit }: SearchBlogsRequestBody = req.body;

    let findQuery: any = {};
    if (category) {
      findQuery = {
        tags: { $in: [category.toLowerCase()] },
        draft: false,
        blog_id: { $ne: eliminate_blog }
      };
    } else if (query) {
      findQuery = { title: new RegExp(query, "i"), draft: false };
    } else if (author) {
      findQuery = { author, draft: false };
    }

    let maxLimit = limit ? limit : 2;

    const blogs = await Blog.find(findQuery)
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt -_id")
      .skip((page - 1) * maxLimit)
      .limit(maxLimit);

    res.status(200).json({
      message: "Success",
      blogs
    });
  } catch (err) {
    console.error("Error in searchBlogs:", err);
    return res.status(500).json({
      message: "Internal server error",
      note: "Error in search blog request"
    });
  }
};

export const countLatestBlogs = async (req: Request, res: Response): Promise<any> => {
  try {
    const count = await Blog.countDocuments({ draft: false });
    res.status(200).json({
      message: "Success",
      totalDocs: count
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      note: "Error in get latest blog count request"
    });
  }
};

export const searchBlogsCountForCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    let { author, tag, query }: SearchBlogsCountRequestBody = req.body;

    let findQuery: any = {};
    if (tag) {
      findQuery = { tags: tag, draft: false };
    } else if (query) {
      findQuery = { title: new RegExp(query, "i"), draft: false };
    } else if (author) {
      findQuery = { author, draft: false };
    }
    const count = await Blog.countDocuments(findQuery);
    res.status(200).json({
      message: "Success",
      totalDocs: count
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      note: "Error in search blog count request"
    });
  }
};

export const searchUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    let { query }: SearchUsersRequestBody = req.body;
    
    if (!query) {
      return res.status(400).json({
        message: "Bad Request",
        note: "Search query is required"
      });
    }

    const users = await User.find({
      "personal_info.username": new RegExp(query, "i")
    })
      .limit(50)
      .select(
        "personal_info.username personal_info.fullname personal_info.profile_img -_id"
      );

    res.status(200).json({
      message: "Success",
      users
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      note: "Error in search user request"
    });
  }
};
// import Blog from "../Schema/blog.model.js";
// import User from "../Schema/user.model.js";
// import { nanoid } from "nanoid";

// export const CreateBlog = async (req, res) => {
//   try {
//     const authId = req.user;
//     if (!authId) {
//       return res.status(401).json({
//         message: "Unauthorized",
//         note: "User authentication required"
//       });
//     }

//     let { title, des, tags = [], banner, content, draft, id } = req.body;

//     if (!title) {
//       return res.status(400).json({
//         message: "Bad Request",
//         note: "Title is required"
//       });
//     }

//     if (!draft) {
//       if (!des || !banner || !content?.blocks?.length || !tags?.length) {
//         return res.status(400).json({
//           message: "Bad Request",
//           note: "Please fill all required fields"
//         });
//       }
//     }

//     if (!Array.isArray(tags)) tags = [];
//     tags = tags.map((tag) => tag.toLowerCase());

//     const blogId =
//       id ||
//       `${title
//         .replace(/[^a-zA-Z0-9]/g, " ")
//         .replace(/\s+/g, "-")
//         .trim()}-${nanoid(8)}`;

//     if (id) {
//       // learning : findOneAndUpdate will return the updated document only if {new: true} is passed in options
//       const updatedBlog = await Blog.findOneAndUpdate(
//         { blog_id: id },
//         {
//           $set: {
//             title,
//             des,
//             tags,
//             banner,
//             content,
//             draft: !!draft
//           }
//         },
//         { new: true } //💥
//       );

//       if (!updatedBlog) {
//         return res.status(404).json({
//           message: "Blog not found"
//         });
//       }

//       return res.status(201).json({
//         message: "Blog updated successfully",
//         data: updatedBlog,
//         id: updatedBlog.blog_id
//       });
//     }

//     const newBlog = new Blog({
//       blog_id: blogId,
//       title,
//       banner,
//       des,
//       content,
//       tags,
//       author: authId,
//       draft: !!draft
//     });

//     await newBlog.save();

//     const incrementVal = draft ? 0 : 1;

//     await User.findByIdAndUpdate(authId, {
//       $inc: { "account_info.total_posts": incrementVal },
//       $push: { blogs: newBlog._id }
//     });

//     return res.status(201).json({
//       message: "Blog created successfully",
//       data: newBlog,
//       id: newBlog.blog_id
//     });
//   } catch (error) {
//     console.error("Error in CreateBlog:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//       note: "Error in Create Blog request"
//     });
//   }
// };

// //* get all blog entries
// export const latestBlogs = async (req, res) => {
//   try {
//     let maxLimit = 5;

//     let { page } = req.body;

//     //todo: this populate method will add the user info form user schema to blog schema
//     const blogData = await Blog.find({ draft: false })
//       .populate(
//         "author",
//         "personal_info.profile_img personal_info.username personal_info.fullname -_id"
//       )
//       .sort({ publishedAt: -1 }) //? to get latest blog first and old as ordered
//       .select("blog_id title des banner activity tags publishedAt -_id")
//       .skip((page - 1) * maxLimit) //* skip the doc
//       .limit(maxLimit);

//     //? this is send to frontend blog object
//     //todo: blogdata is an object contain maxLimit's number of objects and
//     //todo: each object contain blog_id, title, des, banner, activity, tags, publishedAt, and user info from user schema

//     // console.log("blogData -> ", blogData);

//     res.status(200).json({
//       message: "Success",
//       blogs: blogData
//     });
//   } catch (err) {
//     return res.status(500).json({
//       message: "Internal server error",
//       note: "Error in get latest blog request"
//     });
//   }
// };

// export const trendingBlogs = async (req, res) => {
//   try {
//     const blogs = await Blog.find({ draft: false })
//       .populate(
//         "author",
//         "personal_info.profile_img personal_info.username personal_info.fullname -_id"
//       )
//       .sort({
//         "activity.total_read": -1,
//         "activity.total_likes": -1,
//         publishedAt: -1
//       }) // sort on basis of number of read
//       .select("blog_id title publishedAt -_id")
//       .limit(5);

//     res.status(200).json({
//       message: "Success",
//       blogs
//     });
//   } catch (err) {
//     return res.status(500).json({
//       message: "Internal server error",
//       note: "Error in get latest blog request"
//     });
//   }
// };

// export const searchBlogs = async (req, res) => {
//   try {
//     let { eliminate_blog, query, author, category, page = 1, limit } = req.body;

//     let findQuery;
//     if (category) {
//       findQuery = {
//         tags: { $in: [category.toLowerCase()] },
//         draft: false,
//         blog_id: { $ne: eliminate_blog }
//       };
//     } else if (query) {
//       findQuery = { title: new RegExp(query, "i"), draft: false }; //TODO: to check any key word is included in titile or not
//     } else if (author) {
//       findQuery = { author, draft: false };
//     }

//     let maxLimit = limit ? limit : 2;

//     const blogs = await Blog.find(findQuery)
//       .populate(
//         "author",
//         "personal_info.profile_img personal_info.username personal_info.fullname -_id"
//       )
//       .sort({ publishedAt: -1 })
//       .select("blog_id title des banner activity tags publishedAt -_id")
//       .skip((page - 1) * maxLimit)
//       .limit(maxLimit);

//     // console.log("blogs from search blog api -> ", blogs);

//     res.status(200).json({
//       message: "Success",
//       blogs
//     });
//   } catch (err) {
//     console.error("Error in searchBlogs:", err);
//     return res.status(500).json({
//       message: "Internal server error",
//       note: "Error in search blog request"
//     });
//   }
// };

// export const countLatestBlogs = async (req, res) => {
//   try {
//     const count = await Blog.countDocuments({ draft: false });
//     res.status(200).json({
//       message: "Success",
//       totalDocs: count
//     });
//   } catch (err) {
//     return res.status(500).json({
//       message: "Internal server error",
//       note: "Error in get latest blog count request"
//     });
//   }
// };

// export const searchBlogsCountForCategory = async (req, res) => {
//   try {
//     let { author, tag, query } = req.body;

//     let findQuery;
//     if (tag) {
//       findQuery = { tags: tag, draft: false };
//     } else if (query) {
//       findQuery = { title: new RegExp(query, "i"), draft: false }; //TODO: to check any key word is included in titile or not
//     } else if (author) {
//       findQuery = { author, draft: false };
//     }
//     const count = await Blog.countDocuments(findQuery);
//     res.status(200).json({
//       message: "Success",
//       totalDocs: count
//     });
//   } catch (err) {
//     return res.status(500).json({
//       message: "Internal server error",
//       note: "Error in search blog count request"
//     });
//   }
// };

// export const searchUsers = async (req, res) => {
//   try {
//     let { query } = req.body;
//     const users = await User.find({
//       "personal_info.username": new RegExp(query, "i") //? searching for all docs have search query
//     })
//       .limit(50)
//       .select(
//         "personal_info.username personal_info.fullname personal_info.profile_img -_id"
//       );

//     res.status(200).json({
//       message: "Success",
//       users
//     });
//   } catch (err) {
//     return res.status(500).json({
//       message: "Internal server error",
//       note: "Error in search user request"
//     });
//   }
// };
