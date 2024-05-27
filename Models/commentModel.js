import mongoose from "mongoose";

const commentSchema = mongoose.Schema(
  {
    userId: { type: String, required: true },
    postId: { type: String, required: true},
    comment: String,
    createdAt : Date,
    updateAt : Date,
    likes: [],
  },
  {
    timestamps: true,
  }
);

var commentModel = mongoose.model("Comments", commentSchema);
export default commentModel;
