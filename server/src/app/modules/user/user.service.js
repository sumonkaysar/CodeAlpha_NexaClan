const mongoose = require("mongoose");
const User = require("./user.model");
const Follow = require("../follow/follow.model");

const createError = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });

const getProfile = async (username, currentUserId) => {
  const user = await User.findOne({ username: username.toLowerCase() }).select(
    "username displayName bio avatarUrl createdAt",
  );
  if (!user) throw createError("Profile not found", 404);
  const [followers, following, isFollowing] = await Promise.all([
    Follow.countDocuments({ following: user._id }),
    Follow.countDocuments({ follower: user._id }),
    currentUserId && currentUserId !== user._id.toString()
      ? Follow.exists({ follower: currentUserId, following: user._id })
      : false,
  ]);
  return {
    ...user.toObject(),
    followers,
    following,
    isFollowing: Boolean(isFollowing),
    isMe: currentUserId === user._id.toString(),
  };
};

const updateProfile = async (userId, updates) => {
  const allowed = {};
  if (typeof updates.displayName === "string")
    allowed.displayName = updates.displayName.trim();
  if (typeof updates.bio === "string") allowed.bio = updates.bio.trim();
  if (typeof updates.avatarUrl === "string")
    allowed.avatarUrl = updates.avatarUrl.trim();
  if (
    allowed.displayName !== undefined &&
    (!allowed.displayName || allowed.displayName.length > 48)
  ) {
    throw createError("Display name must be 1-48 characters", 400);
  }
  if (allowed.bio !== undefined && allowed.bio.length > 180)
    throw createError("Bio must be 180 characters or less", 400);
  if (allowed.avatarUrl && !/^https?:\/\//i.test(allowed.avatarUrl)) {
    throw createError("Avatar URL must start with http:// or https://", 400);
  }
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: allowed },
    { new: true, runValidators: true },
  );
  if (!user || !mongoose.isValidObjectId(userId))
    throw createError("Profile not found", 404);
  return user;
};

module.exports = { getProfile, updateProfile };
