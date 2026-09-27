const CommentService = require("./comment.service");

const list = async (req, res) =>
  res.json(await CommentService.listForPost(req.params.postId));
const create = async (req, res) =>
  res
    .status(201)
    .json(
      await CommentService.create(
        req.params.postId,
        req.user.id,
        req.body.text,
      ),
    );

module.exports = { list, create };
