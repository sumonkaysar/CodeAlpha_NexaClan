const express = require("express");
const UserController = require("./user.controller");
const authenticateToken = require("../../middlewares/authMiddleware");
const optionalAuth = require("../../middlewares/optionalAuthMiddleware");

const UserRouter = express.Router();
UserRouter.get("/me", authenticateToken, UserController.me);
UserRouter.patch("/me", authenticateToken, UserController.updateMe);
UserRouter.get("/:username", optionalAuth, UserController.profile);

module.exports = UserRouter;
