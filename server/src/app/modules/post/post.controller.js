const PostService = require("./post.service");

const list = async (req, res) =>
  res.json(
    await PostService.listPosts({
      userId: req.user?.id,
      username: req.query.username,
    }),
  );
const create = async (req, res) =>
  res.status(201).json(await PostService.createPost(req.user.id, req.body));
const like = async (req, res) =>
  res.json(await PostService.toggleLike(req.params.id, req.user.id));
const remove = async (req, res) => {
  await PostService.deletePost(req.params.id, req.user.id);
  res.status(204).end();
};

module.exports = { list, create, like, remove };
