
import mongoose, { Schema, Document, Model, Types } from "mongoose";

const profileImgsNameList = [
  "Garfield", "Tinkerbell", "Annie", "Loki", "Cleo",
  "Angel", "Bob", "Mia", "Coco", "Gracie", "Bear",
  "Bella", "Abby", "Harley", "Cali", "Leo",
  "Luna", "Jack", "Felix", "Kiki",
];

const profileImgsCollectionsList = [
  "notionists-neutral",
  "adventurer-neutral",
  "fun-emoji",
];

/* -------------------- INTERFACES -------------------- */

interface PersonalInfo {
  fullname: string;
  email: string;
  password?: string;
  username?: string;
  bio?: string;
  profile_img?: string;
}

interface SocialLinks {
  youtube?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  github?: string;
  website?: string;
}

interface AccountInfo {
  total_posts: number;
  total_reads: number;
}

export interface IUser extends Document {
  personal_info: PersonalInfo;
  social_links: SocialLinks;
  account_info: AccountInfo;
  google_auth: boolean;
  blogs: Types.ObjectId[];
  joinedAt: Date;
}

/* -------------------- SCHEMA -------------------- */

const userSchema = new Schema<IUser>(
  {
    personal_info: {
      fullname: {
        type: String,
        lowercase: true,
        required: true,
        minlength: 3,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
      },
      password: String,
      username: {
        type: String,
        minlength: 3,
        unique: true,
      },
      bio: {
        type: String,
        maxlength: 200,
        default: "",
      },
      profile_img: {
        type: String,
        default: () => {
          const collection =
            profileImgsCollectionsList[
              Math.floor(Math.random() * profileImgsCollectionsList.length)
            ];
          const seed =
            profileImgsNameList[
              Math.floor(Math.random() * profileImgsNameList.length)
            ];
          return `https://api.dicebear.com/6.x/${collection}/svg?seed=${seed}`;
        },
      },
    },

    social_links: {
      youtube: { type: String, default: "" },
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      github: { type: String, default: "" },
      website: { type: String, default: "" },
    },

    account_info: {
      total_posts: { type: Number, default: 0 },
      total_reads: { type: Number, default: 0 },
    },

    google_auth: {
      type: Boolean,
      default: false,
    },

    blogs: {
      type: [Schema.Types.ObjectId],
      ref: "blogs",
      default: [],
    },
  },
  {
    timestamps: { createdAt: "joinedAt" },
  }
);

/* -------------------- MODEL -------------------- */

const User: Model<IUser> = mongoose.model<IUser>("users", userSchema);
export default User;

// import mongoose, { Schema } from "mongoose";

// let profile_imgs_name_list = [
//   "Garfield",
//   "Tinkerbell",
//   "Annie",
//   "Loki",
//   "Cleo",
//   "Angel",
//   "Bob",
//   "Mia",
//   "Coco",
//   "Gracie",
//   "Bear",
//   "Bella",
//   "Abby",
//   "Harley",
//   "Cali",
//   "Leo",
//   "Luna",
//   "Jack",
//   "Felix",
//   "Kiki"
// ];
// let profile_imgs_collections_list = [
//   "notionists-neutral",
//   "adventurer-neutral",
//   "fun-emoji"
// ];

// const userSchema = mongoose.Schema(
//   {
//     personal_info: {
//       fullname: {
//         type: String,
//         lowercase: true,
//         required: true,
//         minlength: [3, "fullname must be 3 letters long"]
//       },
//       email: {
//         type: String,
//         required: true,
//         lowercase: true,
//         unique: true
//       },
//       password: String,
//       username: {
//         type: String,
//         minlength: [3, "Username must be 3 letters long"],
//         unique: true
//       },
//       bio: {
//         type: String,
//         maxlength: [200, "Bio should not be more than 200"],
//         default: ""
//       },
//       profile_img: {
//         type: String,
//         default: () => {
//           return `https://api.dicebear.com/6.x/${profile_imgs_collections_list[Math.floor(Math.random() * profile_imgs_collections_list.length)]}/svg?seed=${profile_imgs_name_list[Math.floor(Math.random() * profile_imgs_name_list.length)]}`;
//         }
//       }
//     },
//     social_links: {
//       youtube: {
//         type: String,
//         default: ""
//       },
//       instagram: {
//         type: String,
//         default: ""
//       },
//       facebook: {
//         type: String,
//         default: ""
//       },
//       twitter: {
//         type: String,
//         default: ""
//       },
//       github: {
//         type: String,
//         default: ""
//       },
//       website: {
//         type: String,
//         default: ""
//       }
//     },
//     account_info: {
//       total_posts: {
//         type: Number,
//         default: 0
//       },
//       total_reads: {
//         type: Number,
//         default: 0
//       }
//     },
//     google_auth: {
//       type: Boolean,
//       default: false
//     },
//     blogs: {
//       type: [Schema.Types.ObjectId],
//       ref: "blogs",
//       default: []
//     }
//   },
//   {
//     timestamps: {
//       createdAt: "joinedAt"
//     }
//   }
// );

// export default mongoose.model("users", userSchema);
