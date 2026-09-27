const express = require("express");
const CommentController = require("./comment.controller");
const authenticateToken = require("../../middlewares/authMiddleware");

const CommentRouter = express.Router();
CommentRouter.get("/post/:postId", CommentController.list);
CommentRouter.post(
  "/post/:postId",
  authenticateToken,
  CommentController.create,
);

module.exports = CommentRouter;
