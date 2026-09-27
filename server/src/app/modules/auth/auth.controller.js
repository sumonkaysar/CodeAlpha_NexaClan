const AuthService = require("./auth.service");

const register = async (req, res) =>
  res.status(201).json(await AuthService.register(req.body));
const login = async (req, res) =>
  res.status(200).json(await AuthService.login(req.body));

module.exports = { register, login };
