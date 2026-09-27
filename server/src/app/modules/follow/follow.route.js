const express = require("express");
const FollowController = require("./follow.controller");
const authenticateToken = require("../../middlewares/authMiddleware");

const FollowRouter = express.Router();
FollowRouter.get("/people", FollowController.people);
FollowRouter.post("/:username", authenticateToken, FollowController.follow);
FollowRouter.delete("/:username", authenticateToken, FollowController.unfollow);

module.exports = FollowRouter;
