const User = require("./user.model");
const UserService = require("./user.service");

const profile = async (req, res) =>
  res.json(await UserService.getProfile(req.params.username, req.user?.id));
const me = async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "username displayName email bio avatarUrl createdAt",
  );
  if (!user) return res.status(404).json({ error: "Profile not found" });
  res.json(user);
};
const updateMe = async (req, res) =>
  res.json(await UserService.updateProfile(req.user.id, req.body));

module.exports = { profile, me, updateMe };
