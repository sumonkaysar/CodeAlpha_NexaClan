const mongoose = require("mongoose");
const Follow = require("./follow.model");
const User = require("../user/user.model");

const createError = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });

const setFollowing = async (followerId, username, shouldFollow) => {
  const target = await User.findOne({
    username: username.toLowerCase(),
  }).select("_id");
  if (!target) throw createError("Profile not found", 404);
  if (target._id.toString() === followerId)
    throw createError("You cannot follow yourself", 400);
  if (shouldFollow) {
    await Follow.updateOne(
      { follower: followerId, following: target._id },
      { $setOnInsert: { follower: followerId, following: target._id } },
      { upsert: true },
    );
  } else {
    await Follow.deleteOne({ follower: followerId, following: target._id });
  }
  return { following: shouldFollow };
};

const listPeople = async ({ query, currentUserId }) => {
  const search =
    typeof query === "string"
      ? query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      : "";
  const conditions = search
    ? {
        $or: [
          { username: new RegExp(search, "i") },
          { displayName: new RegExp(search, "i") },
        ],
      }
    : {};
  if (currentUserId && mongoose.isValidObjectId(currentUserId)) {
    conditions._id = { $ne: currentUserId };
  }
  const people = await User.find(conditions)
    .select("username displayName avatarUrl bio")
    .limit(8);
  const following = currentUserId
    ? await Follow.find({
        follower: currentUserId,
        following: { $in: people.map((person) => person._id) },
      }).select("following")
    : [];
  const followingIds = new Set(
    following.map((item) => item.following.toString()),
  );
  return people.map((person) => ({
    ...person.toObject(),
    isFollowing: followingIds.has(person._id.toString()),
  }));
};

module.exports = { setFollowing, listPeople };
