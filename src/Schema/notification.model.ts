import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type NotificationType = "like" | "comment" | "reply";

export interface INotification extends Document {
  type: NotificationType;
  blog: Types.ObjectId;
  notification_for: Types.ObjectId;
  user: Types.ObjectId;
  comment?: Types.ObjectId;
  reply?: Types.ObjectId;
  replied_on_comment?: Types.ObjectId;
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    type: {
      type: String,
      enum: ["like", "comment", "reply"],
      required: true,
    },
    blog: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "blogs",
    },
    notification_for: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "comments",
    },
    reply: {
      type: Schema.Types.ObjectId,
      ref: "comments",
    },
    replied_on_comment: {
      type: Schema.Types.ObjectId,
      ref: "comments",
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification: Model<INotification> =
  mongoose.model<INotification>("notification", notificationSchema);

export default Notification;

// import mongoose, { Schema } from "mongoose";

// const notificationSchema = mongoose.Schema({
//     type: {
//         type: String,
//         enum: ["like", "comment", "reply"],
//         required: true
//     },
//     blog: {
//         type: Schema.Types.ObjectId,
//         required: true,
//         ref: 'blogs'
//     },
//     notification_for: {
//         type: Schema.Types.ObjectId,
//         required: true,
//         ref: 'users'
//     },
//     user: {
//         type: Schema.Types.ObjectId,
//         required: true,
//         ref: 'users'
//     },
//     comment: {
//         type: Schema.Types.ObjectId,
//         ref: 'comments'
//     },
//     reply: {
//         type: Schema.Types.ObjectId,
//         ref: 'comments'
//     }, 
//     replied_on_comment:{
//         type: Schema.Types.ObjectId,
//         ref: 'comments'
//     },
//     seen: {
//         type: Boolean,
//         default: false
//     }
// },
// {
//     timestamps: true
// }
// )

// export default mongoose.model("notification", notificationSchema)