require("dotenv").config();
const express = require("express");
const cors = require("cors");
const AuthRouter = require("./app/modules/auth/auth.route");
const UserRouter = require("./app/modules/user/user.route");
const PostRouter = require("./app/modules/post/post.route");
const CommentRouter = require("./app/modules/comment/comment.route");
const FollowRouter = require("./app/modules/follow/follow.route");
const notFoundMiddleware = require("./app/middlewares/notFoundMiddleware");
const errorHandlerMiddleware = require("./app/middlewares/errorHandlerMiddleware");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", AuthRouter);
app.use("/api/users", UserRouter);
app.use("/api/posts", PostRouter);
app.use("/api/comments", CommentRouter);
app.use("/api/follows", FollowRouter);

app.get("/", (_req, res) => {
  res.status(200).json({ message: "NexaClan API is running" });
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
