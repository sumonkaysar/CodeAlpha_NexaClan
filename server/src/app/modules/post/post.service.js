const mongoose = require("mongoose");
const Post = require("./post.model");
const Follow = require("../follow/follow.model");

const createError = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });
const authorFields = "username displayName avatarUrl";

const listPosts = async ({ userId, username }) => {
  let authorIds;
  if (username) {
    const User = require("../user/user.model");
    const author = await User.findOne({
      username: username.toLowerCase(),
    }).select("_id");
    if (!author) throw createError("Profile not found", 404);
    authorIds = [author._id];
  } else if (userId) {
    const followed = await Follow.find({ follower: userId }).select(
      "following",
    );
    authorIds = [userId, ...followed.map((item) => item.following)];
  }

  const query = authorIds ? { author: { $in: authorIds } } : {};
  const posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .limit(40)
    .populate("author", authorFields)
    .populate("likes", "_id");

  return posts.map((post) => {
    const item = post.toObject();
    item.likedByMe = Boolean(
      userId && item.likes.some((like) => like._id.toString() === userId),
    );
    item.likes = item.likes.length;
    return item;
  });
};

const createPost = async (userId, { text, imageUrl }) => {
  const content = typeof text === "string" ? text.trim() : "";
  const image = typeof imageUrl === "string" ? imageUrl.trim() : "";
  if (!content && !image)
    throw createError("Write something or add an image URL", 400);
  if (content.length > 2000)
    throw createError("Posts can be up to 2,000 characters", 400);
  if (image && !/^https?:\/\//i.test(image))
    throw createError("Image URL must start with http:// or https://", 400);
  return Post.create({ author: userId, text: content, imageUrl: image });
};

const toggleLike = async (postId, userId) => {
  if (!mongoose.isValidObjectId(postId))
    throw createError("Post not found", 404);
  const post = await Post.findById(postId);
  if (!post) throw createError("Post not found", 404);
  const alreadyLiked = post.likes.some((id) => id.toString() === userId);
  if (alreadyLiked) post.likes.pull(userId);
  else post.likes.addToSet(userId);
  await post.save();
  return { liked: !alreadyLiked, likes: post.likes.length };
};

const deletePost = async (postId, userId) => {
  if (!mongoose.isValidObjectId(postId))
    throw createError("Post not found", 404);
  const post = await Post.findOneAndDelete({ _id: postId, author: userId });
  if (!post) throw createError("Post not found or you cannot delete it", 404);
  const Comment = require("../comment/comment.model");
  await Comment.deleteMany({ post: postId });
};

module.exports = { listPosts, createPost, toggleLike, deletePost };
