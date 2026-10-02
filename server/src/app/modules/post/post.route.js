const express = require("express");
const PostController = require("./post.controller");
const authenticateToken = require("../../middlewares/authMiddleware");
const optionalAuth = require("../../middlewares/optionalAuthMiddleware");

const PostRouter = express.Router();
PostRouter.get("/", optionalAuth, PostController.list);
PostRouter.post("/", authenticateToken, PostController.create);
PostRouter.post("/:id/like", authenticateToken, PostController.like);
PostRouter.delete("/:id", authenticateToken, PostController.remove);

module.exports = PostRouter;
