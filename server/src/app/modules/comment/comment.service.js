const mongoose = require("mongoose");
const Comment = require("./comment.model");
const Post = require("../post/post.model");

const createError = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });

const listForPost = async (postId) => {
  if (!mongoose.isValidObjectId(postId))
    throw createError("Post not found", 404);
  return Comment.find({ post: postId })
    .sort({ createdAt: 1 })
    .populate("author", "username displayName avatarUrl");
};

const create = async (postId, authorId, text) => {
  if (!mongoose.isValidObjectId(postId))
    throw createError("Post not found", 404);
  const content = typeof text === "string" ? text.trim() : "";
  if (!content || content.length > 500)
    throw createError("Comments must be 1-500 characters", 400);
  const post = await Post.findById(postId);
  if (!post) throw createError("Post not found", 404);
  const comment = await Comment.create({
    post: postId,
    author: authorId,
    text: content,
  });
  await Post.updateOne({ _id: postId }, { $inc: { commentCount: 1 } });
  return comment.populate("author", "username displayName avatarUrl");
};

module.exports = { listForPost, create };
