const FollowService = require("./follow.service");

const follow = async (req, res) =>
  res.json(
    await FollowService.setFollowing(req.user.id, req.params.username, true),
  );
const unfollow = async (req, res) =>
  res.json(
    await FollowService.setFollowing(req.user.id, req.params.username, false),
  );
const people = async (req, res) =>
  res.json(
    await FollowService.listPeople({
      query: req.query.q,
      currentUserId: req.user?.id,
    }),
  );

module.exports = { follow, unfollow, people };
